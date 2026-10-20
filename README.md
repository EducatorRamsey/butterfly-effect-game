# The Butterfly Effect: The Cost of Every Choice

A playable seven-day opening chapter of a narrative economics game for high school seniors. Explore an original, illustrated Albuquerque neighborhood in Phaser 3, make commitments with limited time and resources, and reflect on the next-best alternatives you gave up.

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

Walking costs five game minutes per fifteen seconds of movement. Reading dialogue uses no time. Each location offers one commitment per day. Use **Week calendar** to see deadlines. After finishing a day, choose **Start the next day** in the journal. All costs and requirements appear before choosing. Finish the day whenever you wish; the decision journal and reflection are available at any time. Your progress is automatically saved to this browser's local storage. New stories replace that save. Download the reflection before restarting if you want to keep it. Shared school devices should start a fresh story between students.

## What this milestone includes

- A title screen, four selectable starting interests, changeable pathway, accessible introduction, and five interactive locations.
- Smooth accelerated movement, directional walking frames, building/plant collision, camera following, and keyboard, mouse, menu, and touch navigation.
- Seven playable days with new conversations across all five locations. A calendar, daily commitments, paid work, shared equipment, a clinic appointment, limited project hours, groceries, savings transfers, and a Friday housing bill make choices carry forward.
- Training opens a carpool and a reserved Tuesday workshop. Helping Elena reduces the room deposit. Tuesday’s reduced bus service adds 90 minutes to each work or learning commitment for city-bus riders. A bike, carpool, or planned ride changes that trade-off. Time already spent cannot be recovered.
- Short dialogue, clear time/money summaries, and optional **Tell me more** sections. Narration reads the current visible panel, including every choice and reason an option is unavailable. Expand a detail section before Listen to include it.
- A reflection after three commitments, a second reflection at the end of the week, and a downloadable decision summary. This remains an **age-18 snapshot**, not the planned four-year life simulation. Existing first-chapter saves continue into the week without losing their resources or choices.

Original scenery and character art are drawn in code. These are cohesive prototype assets designed to be replaceable; no commercial game assets are used. Monetary amounts and availability are illustrative classroom scenarios, not current financial or enrollment advice. Work pays immediately after each completed shift; accepting a schedule does not pay wages. Expected weekly income is a planning estimate. The housing deposit is separate from Friday’s bill: $125 for the shared room (a simplified four-week share of $500/month), or a $40 household contribution when living with family. Friday’s bill uses spending money, then savings. Any remaining amount becomes an unpaid housing balance, without interest or a failure score. The bill is charged once, including after reloads.

Temporary family/shared rides apply only to Tuesday; the previous travel plan returns the next morning. Grocery spending is a selected decision, not a hidden recurring deduction. This milestone does not simulate all living expenses, formal loans, or the consequences of a long-term overdue balance.

## Automated browser tests

```sh
npm ci
npx playwright install chromium
npm test
```

The config uses `/usr/bin/chromium` when installed, and otherwise uses Playwright’s downloaded Chromium. You can optionally set `CHROMIUM_PATH` to another Chrome/Chromium executable.

The suite runs the actual game at 1440×1000 and Chromebook-sized 1366×768 viewports. It covers new/continued/restarted stories, all locations, linked decisions and arithmetic, deadlines, affordability, narration controls, speed, map navigation, movement, keyboard dialogue, reflection, ending, all seven days, legacy-save continuation, Friday settlement and shortfall handling, responsive layout, and browser/asset errors. See [validation notes](docs/VALIDATION.md) for the current run and limits.

## Publish on GitHub Pages

The included **Deploy game to GitHub Pages** workflow builds and publishes `dist/` when changes reach `main`, or when run manually.

1. Merge the game pull request into `main` (or push the reviewed code there).
2. In your repository, open **Settings → Pages → Build and deployment → Source**, and select **GitHub Actions**.
3. Open **Actions → Deploy game to GitHub Pages**. Wait for the deployment to succeed.
4. The deployment summary and **Settings → Pages** show your game link. Share that link with students; they need only a browser.

The relative Vite base supports repository Pages paths and custom domains. The site runs without third-party runtime requests. A service worker/offline-first mode is not part of this milestone.

For changes and file organization, see [architecture](docs/ARCHITECTURE.md). For the remaining game, see [roadmap](docs/ROADMAP.md).
