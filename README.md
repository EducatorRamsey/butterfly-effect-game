# The Butterfly Effect: The Cost of Every Choice

A playable first chapter of a narrative economics game for high school seniors. Explore an original, illustrated Albuquerque neighborhood in Phaser 3, make commitments with limited time and resources, and reflect on the next-best alternatives you gave up.

![The playable Juniper neighborhood](docs/neighborhood.png)

## Play and develop

Requires Node.js 22.12+ (tested with Node 24) and npm.

```sh
npm ci
npm run dev
```

Open the address printed by Vite in your browser. In a cloud coding workspace, use its port preview for port **5173** if available. On your own computer the address is usually `http://localhost:5173`. This game needs no accounts, API keys, external artwork, or backend.

```sh
npm run build       # TypeScript validation and production output in dist/
npm run preview     # inspect the production build (port 4173)
```

If your workspace prevents writes to npm's default cache, add `--cache /tmp/butterfly-npm-cache` to `npm ci`.

## Controls

- **WASD / arrow keys:** walk. Click or focus the game canvas first if a menu button has keyboard focus.
- **E / Enter:** talk near a building entrance.
- **Click a building, sidebar location, or Locations:** travel to its entrance and start a conversation. Direct travel costs five game minutes.
- **Directional buttons:** hold to move on a touch screen.
- **Escape / ×:** close a dialogue. Closing without choosing makes no commitment.
- **Listen / Replay / Stop:** browser narration, with five speed settings and optional automatic reading. Voice availability depends on the browser/OS.

Walking costs five game minutes per fifteen seconds of movement. Reading dialogue uses no time. Each location offers one commitment for the day. All costs and requirements appear before choosing. Finish the day whenever you wish; the decision journal and reflection are available at any time. Your progress is automatically saved to this browser's local storage. New stories replace that save. Download the reflection before restarting if you want to keep it. Shared school devices should start a fresh story between students.

## What this milestone includes

- A title screen, four selectable starting interests, changeable pathway, accessible introduction, and five interactive locations.
- Smooth accelerated movement, directional walking frames, building/plant collision, camera following, and keyboard, mouse, menu, and touch navigation.
- Fifteen choices across family, work, education, transport, and housing. Time windows, affordability, training requirements, recurring-cost estimates, savings transfers, relationships, and skills have working rules.
- Training opens a carpool; helping Elena reduces a later housing deposit. Long paid work can close the training enrollment window.
- Visual-novel-style conversations with original stylized portraits; narration reads the complete panel, including all choices and disabled-choice explanations.
- A reflection after three commitments and a downloadable end-of-chapter summary. This is an **age-18 snapshot**, not the planned four-year life simulation.

Original scenery and character art are drawn in code. These are cohesive prototype assets designed to be replaceable; no commercial game assets are used. Monetary amounts and availability are illustrative classroom scenarios, not current financial or enrollment advice. Weekly income and monthly rent are forecasts, not accrued cash flows in the one-day chapter. No debt is incurred by the current choices.

## Automated browser tests

```sh
npm ci
npx playwright install chromium
npm test
```

The config uses `/usr/bin/chromium` when installed, and otherwise uses Playwright’s downloaded Chromium. You can optionally set `CHROMIUM_PATH` to another Chrome/Chromium executable.

The suite runs the actual game at 1440×1000 and Chromebook-sized 1366×768 viewports. It covers new/continued/restarted stories, all locations, linked decisions and arithmetic, deadlines, affordability, narration controls, speed, map navigation, movement, keyboard dialogue, reflection, ending, responsive layout, and browser/asset errors. See [validation notes](docs/VALIDATION.md) for the current run and limits.

## Publish on GitHub Pages

The included **Deploy game to GitHub Pages** workflow builds and publishes `dist/` when changes reach `main`, or when run manually.

1. Merge the game pull request into `main` (or push the reviewed code there).
2. In your repository, open **Settings → Pages → Build and deployment → Source**, and select **GitHub Actions**.
3. Open **Actions → Deploy game to GitHub Pages**. Wait for the deployment to succeed.
4. The deployment summary and **Settings → Pages** show your game link. Share that link with students; they need only a browser.

The relative Vite base supports repository Pages paths and custom domains. The site runs without third-party runtime requests. A service worker/offline-first mode is not part of this milestone.

For changes and file organization, see [architecture](docs/ARCHITECTURE.md). For the remaining game, see [roadmap](docs/ROADMAP.md).
