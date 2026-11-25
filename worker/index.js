// PERSPECTIVE source gatherer. Runs hourly (cron), reads RSS feeds listed in Supabase,
// tags each item with a country, stores it as "pending" for human review.
const ALIASES = { Burma:'MMR', Gaza:'PSE', 'West Bank':'PSE', Darfur:'SDN', Khartoum:'SDN', Tigray:'ETH', Sahel:'MLI', 'Democratic Republic of Congo':'COD', 'DR Congo':'COD', DRC:'COD', Kinshasa:'COD', Goma:'COD', 'Port-au-Prince':'HTI', Rangoon:'MMR', Naypyidaw:'MMR' };

const sb = (env, path, init = {}) =>
  fetch(env.SUPABASE_URL + '/rest/v1/' + path, {
    ...init,
    headers: { apikey: env.SUPABASE_SERVICE_KEY, Authorization: 'Bearer ' + env.SUPABASE_SERVICE_KEY, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });

const tag = (s, name) => { const m = s.match(new RegExp('<' + name + '[^>]*>([\\s\\S]*?)</' + name + '>', 'i')); return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : ''; };
const clean = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#8217;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

function parseFeed(xml) {
  const blocks = xml.match(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi) || [];
  return blocks.map((b) => {
    let link = tag(b, 'link');
    if (!link) { const m = b.match(/<link[^>]+href="([^"]+)"/i); link = m ? m[1] : ''; }
    return {
      title: clean(tag(b, 'title')),
      url: link.trim(),
      published: tag(b, 'pubDate') || tag(b, 'published') || tag(b, 'updated'),
      excerpt: clean(tag(b, 'description') || tag(b, 'summary')).slice(0, 400),
      author: clean(tag(b, 'dc:creator') || tag(b, 'author')),
    };
  }).filter((i) => i.title && i.url);
}

function matchCountry(text, countries) {
  for (const [k, code] of Object.entries(ALIASES)) if (new RegExp('\\b' + k + '\\b').test(text)) return code;
  let best = null;
  for (const c of countries) {
    if (c.name.length < 4) continue;
    if (new RegExp('\\b' + c.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(text)) { best = c.code; break; }
  }
  return best;
}

async function run(env) {
  const countries = await (await sb(env, 'countries?select=code,name')).json();
  const sources = await (await sb(env, 'sources?select=*&active=eq.true&feed_url=not.is.null')).json();
  let added = 0;
  for (const s of sources) {
    try {
      const res = await fetch(s.feed_url, { headers: { 'User-Agent': 'PerspectiveBot/0.1 (+https://perspective)' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const items = parseFeed(await res.text()).slice(0, 40);
      const rows = items.map((i) => {
        const code = matchCountry(i.title + ' ' + i.excerpt, countries);
        const d = new Date(i.published);
        return code && {
          country_code: code, lens: s.lens, title: i.title, url: i.url, source_id: s.id, source_name: s.name,
          author: i.author || null, published_at: isNaN(d) ? null : d.toISOString(), excerpt: i.excerpt,
          state_affiliated: s.state_affiliated, status: 'pending',
        };
      }).filter(Boolean);
      if (rows.length) {
        const r = await sb(env, 'items?on_conflict=url', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' }, body: JSON.stringify(rows) });
        if (!r.ok) throw new Error('insert ' + r.status + ' ' + (await r.text()).slice(0, 200));
        added += rows.length;
      }
      await sb(env, 'sources?id=eq.' + s.id, { method: 'PATCH', body: JSON.stringify({ last_fetched_at: new Date().toISOString(), last_error: null }) });
    } catch (e) {
      await sb(env, 'sources?id=eq.' + s.id, { method: 'PATCH', body: JSON.stringify({ last_error: String(e).slice(0, 300) }) });
    }
  }
  return added;
}

export default {
  async scheduled(_e, env, ctx) { ctx.waitUntil(run(env)); },
  async fetch(req, env) {
    // open /?key=RUN_KEY once to trigger a run by hand
    if (new URL(req.url).searchParams.get('key') !== env.RUN_KEY) return new Response('perspective worker', { status: 200 });
    return new Response('queued items: ' + (await run(env)));
  },
};
