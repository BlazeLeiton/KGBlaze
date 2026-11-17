# Project Relight — Stage 38 · Home V5 · Approved icon delta CP02

Date: 2026-11-17 (America/Mexico_City)
Scope: HOME only, no visual redesign of Scripta Lyrica/Rebel Mix or Terminal. This checkpoint extends `RELIGHT_HOME_V5_APPROVED_CP01_2026-11-17.md` and does not supersede it.

## Decision approved in conversation

- Top blue **Salidas** button in global header: replace Unicode airplane `✈` with the **exact aircraft + runway silhouette** recovered from Terminal's existing canvas-rendered header (two `Path2D` paths), recolored **solid white strokes**. No extra engine/twin-engine is to be combined in the top button.
- Bottom **Próximas salidas** blue tile: replace Unicode `✈` (interpretable visually as a four-engine aircraft) with a **new approved, side/top-view twin-engine SVG**, nose precisely aligned with horizontal axis pointing **right**, achieved by `rotate(90 50 50)`. Engines one per wing, slightly forward from wing, shortened and moved exactly **1 viewBox coordinate inward each** (x=26 and x=65 versus x=25 and x=66; y=37.5, height=17.5). Preserve all other silhouette path geometry. These dimensions are SVG viewBox units, not guaranteed physical display pixels.
- Both **outline** and **filled** twin-engine options were approved as vector artwork; keep both reusable SVG variants in repository. Home uses **outline** by default, consistent with the user's earlier preference not to fill. Changing the selected style does not require redrawing or generating images.
- The **Rebel Mix** tile and its music symbol are not modified in this icon-only PR. Its independent headphones request belongs to the next separately validated harmonization; do not silently redesign Rebel Mix.
- Keep desktop and mobile layout and ES/EN/JA language behavior intact. Moving `data-i18n="departures"` to the text-only span inside top link prevents translated text from destroying the icon element.

## Canonical vector assets

- `public/assets/icons/kgblaze-bimotor-outline.svg` — approved two-engine line icon, blue interior/white stroke for blue tile.
- `public/assets/icons/kgblaze-bimotor-filled.svg` — approved same geometry, solid white fill.
- `public/assets/icons/kgblaze-departures-white.svg` — exact original aircraft+runway silhouette, white stroke.
- `public/home.html` embeds the matching outline and top SVG inline to ensure immediate rendering without an asset URL dependency.

## Provenance and constraints

Aeroméxico 2024 Brand Book and `press_NEWAM_24.pptx` were inspiration for the earlier KGBlaze/Twitch panels' iconographic language. The approved graphics are our own HTML/SVG/Canvas reinterpretations, not sourced from Canva. No generated image assets; no external corporate logo reused. Home colors #020C41 base, #276EF1 tile/button, #551E5F Rebel Mix tile, #FA0073 Mexican pink, #A5EBFF United light blue. No changes to Terminal backend or its original icon.

Status: code saved in branch pending PR/merge. Validate against Home V5 mobile and desktop; do not treat a successful GitHub merge alone as proof of live Cloudflare deployment.
