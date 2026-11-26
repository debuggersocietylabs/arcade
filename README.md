# Arcade

A growing collection of browser games (2D and 3D) built with **Babylon.js, TypeScript and Vite**, published with GitHub Pages.
Live site: https://debuggersocietylabs.github.io/arcade/ (after you finish [SETUP.md](SETUP.md)).

```bash
npm ci
npm run dev                 # http://localhost:5173
npm run new-game -- my-game --type 2d --title "My Game"
npm run check               # typecheck + unit tests + build + browser smoke tests
```

Adding a game = adding a folder under `games/`. It is built, tested and listed on the landing page automatically.
See [CLAUDE.md](CLAUDE.md) for conventions, [SETUP.md](SETUP.md) for GitHub Pages and scheduled Claude tasks, and `progress/` for the work queue and history.

| Game | Type | |
| --- | --- | --- |
| Neon Runner | 3D | Synthwave lane runner |
