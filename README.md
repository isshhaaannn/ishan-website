# Ishan portfolio

Next.js 15, static. 524 creatives across 25 projects, pulled from the Drive
folder and refiled by client rather than by medium.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## How the media pipeline works

The Drive folder is filed by medium (Deck, Logofolio, Print) which splits single
clients across five folders. Nothing on the site reads that structure directly.

```
Drive folder
  └─ scripts/fetch-assets.py     downloads originals   → assets/raw/**  (872 MB, gitignored)
      └─ data/structure.mjs      the merge map          (edit this to regroup)
          └─ scripts/build-catalog.mjs
              ├─ public/media/**  webp at 520 and 1400  (124 MB)
              └─ data/catalog.json
```

`data/catalog.json` is the only thing the app reads. To regroup the work, edit
`data/structure.mjs` and re-run:

```bash
node scripts/build-catalog.mjs
```

Derivatives already on disk are skipped, so re-running is cheap.

### Refetching from Drive

`data/manifest.json` holds every Drive file id and its thumbnail URL. If Ishan
adds work, recrawl the folder and rebuild:

```bash
python3 scripts/fetch-assets.py
node scripts/build-catalog.mjs
```

## Structure

| Path | What |
| --- | --- |
| `app/page.jsx` | Home: hero rail, statement, selected, index, archive strip |
| `app/work/[id]` | Case study. One filmstrip per carousel |
| `app/archive` | Every frame, filterable by room |
| `components/webgl/` | The rail: shader, geometry, texture loading |
| `components/SlideViewer.jsx` | Fullscreen carousel scrubber |
| `data/structure.mjs` | The merge map |

## The WebGL

There are no 3D models. Every plane in the rail is one of Ishan's own images,
bent along an arc and sheared by scrub velocity. Two places use it:

- **Hero**, drifting on its own, thumbnail textures.
- **SlideViewer**, scrubbed by drag, wheel or arrow keys, full resolution.

Shader lives in `components/webgl/slideMaterial.js`. Chromatic split scales with
velocity, grain is tinted to the paper ground, and slides at the edge of the rail
dissolve into the page background so it reads as a band rather than a crop.

Everything else is DOM. The archive grid holds 524 images and would die under
WebGL, so it does not use it.

## Type and colour

- **Fraunces** (variable, `SOFT` / `WONK` / `opsz`) for display, via `next/font`
- **Helvetica Neue** for body and UI, system stack, falls back to Arial
- **DM Mono** for counts, labels and metadata

Ground is sand and off-white. The only accent is `--tide`, an electric blue
lifted from Ishan's own Jerseyfolio work. Every colour is a token in
`app/globals.css` and is redefined for dark in all three theme states.

## Known gaps

- `hello@Ishan.design` and the Instagram handle are placeholders.
- Two Drive clients are filed under working names (`christian`, `Banners`).
- 12 `.psd` working files in the Drive have no thumbnail and are not on the site.
- `public/media` is 124 MB. Move it to a CDN before launch.
# ishan-website
