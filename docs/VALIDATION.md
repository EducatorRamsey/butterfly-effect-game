# Validation of milestone 1

Tested in this cloud workspace with Node 24.19.0, npm 11.9.0, and system Chromium using Playwright.

- `npm run build`: passed TypeScript checking and Vite production build.
- `npm test`: **10 passed**, no skipped tests. Five browser scenarios each run at desktop 1440×1000 and Chromebook 1366×768.
- Production smoke: served `dist/` with Vite preview; started a new game, visited the workplace, selected paid orientation, and verified spending money changed from $320 to $340. Built assets loaded with no page exceptions or failed HTTP responses.

## Browser scenarios

1. All five locations, a complete connected decision sequence, exact time/money consequences, family-assisted housing deposit, training carpool, reflection, journal, saved continuation, chapter ending, and restart with a different pathway.
2. Keyboard movement changes the saved position; holding up at a building is blocked by collision; E opens the nearby conversation; map travel and held directional pointer controls work; reduced-motion setting applies.
3. A long shift closes the funded training enrollment window. Joining the waitlist does not grant a seat, and the workshop carpool remains unavailable.
4. Pathway changes preserve the story, unaffordable housing is disabled, the modal retains keyboard focus and closes on Escape, and a 390px display has no horizontal overflow.
5. Narration receives the entire current conversation, including all three options, at the selected speed. This uses an instrumented speech-synthesis call so the exact text/rate can be asserted.

Every test watches for uncaught page errors and HTTP errors. No such errors occurred in the final run. Earlier graphics-restart, keyboard-event, focus, and narration-access issues were corrected before this result.

## Limits

The tests use real Chromium browser interactions, not a physical Chromebook or mobile device. The directional controls are exercised with held pointer input; native touch hardware was not available. Audible voice quality, school voice policies, assistive-technology behavior, and student reading/attention needs require classroom review. The narration test verifies content and speed sent to the browser, not audio output.

GitHub Actions and Pages deployment are supplied but have not run from this workspace. A successful local build does not mean the game is already published. The current milestone has outdoor exploration and character conversation panels; playable indoor maps, recurring calendar cash flows, a usable item inventory, and an age-22 outcome are future work.
