# Changelog

## v0.1 (2026-11-24)
- Restart from Oct 8 World Perspectives build. Renamed PERSPECTIVE, brown map palette, tabs Local / International / Scholar / Sources, panel renderer fixed (old build never opened its panel), live date.

## v0.2 (2026-11-24)
- Full redesign (CFR-style information architecture, Sentala-style calm editorial typography). Map: fixed 22 unclickable shapes (Greece, Mongolia, Iceland, Greenland, Qatar...), hover/click bug, drag-pan and zoom, filters, country search, deep links (#c-SDN). Country card with Local / International / Scholar / Sources. Underreported cards, report list, source library.

## v0.3 (2026-11-24)
- Map regenerated in Natural Earth projection (50m, simplified), graticule, shading, labels with zoom-aware density, fly-to on select, right drawer for country card.
- Colour logic: green = covered (quiet to high activity), bordeaux = underreported. Russia/USA/China no longer red.

## v0.4 (2026-11-24)
- News-outlet redesign: ticker, centered masthead (Old Standard TT), Newsreader headlines, Libre Franklin UI, hairline rules, front page with lead story, numbered list and library column. No country labels on map. Icon zoom controls. Tooltip suppressed during fly-to.
- v0.5: map-first page, thin dark section band with dark-mode toggle, dark theme, thinner selection outline with blurred background, side column of small states and islands
- v0.6: clicking a country opens a full country report page (three lenses side by side, timeline, sources) instead of the side card; back to map
- v0.7: floating scrollable summary card over the map with a 'Read the full report' button that opens the dedicated country page (#r-XXX); summary stays #c-XXX
- v1.0: dual-layer tactical map (green coverage, orange hatch for underreported), new legend
- v1.1: live 30-minute rescoring from GDELT via Supabase; urgency hatching for all countries scoring 60 or more
- v1.2: click outside closes the country card and resets the map
- v1.3: map explainer; preliminary rubric scores for all 235 shapes
- v1.4: country pages load on demand from data/; score panel; library filters; 11 sourced pages (SSD, CAF, SOM, PSE, ERI, SYR, LBN, MLI, BFA, NER, TCD)
- v1.4.1: draft labels and review bar removed for the public site
- v1.5: 12 more sourced country pages (AFG, PAK, BGD, IRN, IRQ, ISR, UKR, RUS, TWN, PRK, NGA, CMR); 23 in total
