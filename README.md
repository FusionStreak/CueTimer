# Cue Timer

A browser-based countdown timer for tracking named cues during film and theatre production. No server required — runs entirely client-side.

**Live:** <https://sayfullaheid.me/CueTimer/>

## Features

- Pre-roll countdown before the clock starts
- "Now Acting" and "Next Up" cards with color-coded cues
- Lead-in warning (pulsing card + audio blip) 5 seconds before each cue
- Pitched audio tone on cue activation
- In-app cue editor — add, rename, recolor, reorder, delete cues
- Cues and timer position persist across page refreshes (localStorage)
- Shareable URL — encode your cue list in the URL hash and send it to collaborators
- Mobile-friendly layout

## Keyboard shortcuts

| Key   | Action        |
|-------|---------------|
| Space | Start / Pause |
| R     | Reset         |
| E     | Open editor   |
| M     | Toggle mute   |

## Local development

```bash
pnpm install
pnpm dev
```

Open <http://localhost:5173> in your browser.

## Build

```bash
pnpm build       # output → dist/
pnpm preview     # serve the production build locally
```

## Deploying to GitHub Pages

1. Push the repo to GitHub.
2. Go to **Settings → Pages** and set the source to **GitHub Actions**.
3. Every push to `main` triggers the workflow in `.github/workflows/deploy.yml`, which builds the project and deploys `dist/` to Pages.

The Vite build is configured with `base: '/FilmTimer/'` for the production path. If your repository is named differently, update `base` in `vite.config.ts` and the `GITHUB_REPOSITORY` path to match.

## Editing cues

Click **✏️** in the header (or press `E`) to open the cue editor. Fields:

- **Time** — seconds from scene start, accepts `MM:SS` or plain seconds
- **Name** — label shown on the timer display
- **Color** — one of: `green`, `yellow`, `orange`, `blue`, `red`

Drag rows to reorder. Cues are sorted by time when the editor closes.
