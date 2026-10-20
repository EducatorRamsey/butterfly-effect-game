# Validation of the first-week milestone (v0.2)

Tested in this cloud workspace with Node 24.19.0, npm 11.9.0, and system Chromium using Playwright.

- `npm run build`: passed TypeScript checking and Vite production build.
- `npm test`: **22 passed**, no skipped tests. Eleven browser scenarios each run at desktop 1440×1000 and Chromebook 1366×768.
- Production smoke: served the built `dist/` output with Vite preview, started a story, earned $20 from orientation, finished Saturday, advanced to Sunday, opened the seven-day calendar, and loaded Sunday's advising conversation. Verified $340 spending money and day 2. No page exceptions or failed HTTP responses.

## Existing-game regressions

1. All five locations, exact economic consequences, family-assisted housing deposit, training carpool, first reflection, journal, save/continue, day completion, and restart with a different pathway.
2. Keyboard movement changes saved position; building collision blocks passage; E opens nearby dialogue; map travel, held directional pointer controls, and reduced motion work.
3. A long Saturday shift closes training enrollment; a waitlist does not grant the reserved-seat carpool.
4. Changing pathways, unaffordable choices, modal keyboard focus, Escape, and a 390px layout without horizontal overflow.
5. Narration receives the whole current conversation and every choice at the selected speed. Speech calls are instrumented to verify text and rate, not audible output.

## New first-week scenarios

6. A complete seven-day playthrough: paid shifts, scheduling without unearned wages, clinic conflict, reserved Tuesday training, tool-bench practice, groceries, net project earnings, midweek reload, both reflections, Friday housing, reflection download, and no duplicate payment after reload. The tested route ends with $152 cash, $150 savings, and no unpaid balance.
7. Reduced bus service adds 90 minutes to work and learning commitments. A long shift makes training unavailable. Buying a ride afterward does not recover time already spent. The temporary ride expires next morning.
8. An actual legacy-save fixture without day, ledger, or completion fields preserves resources and choices, advances to Sunday, and permits a new home commitment without duplicating it that day.
9. A Friday low-funds save pays $10 cash and $20 savings toward $125 housing, leaving $95 unpaid. Reopening the finish action does not charge it again.
10. The tool-bench deadline closes after other work. Optional explanations are hidden until expanded; panel narration and speed controls remain available.
11. A carpool reserved earlier avoids the Tuesday bus penalty and leaves enough time for both work and the workshop.

Every test monitors uncaught page exceptions and HTTP errors. None occurred in the final run.

## Limits

Tests use real Chromium at representative viewports, not a physical Chromebook or mobile device. Held pointer input exercises directional controls; native touch hardware, audible voice quality, screen readers, and student reading/attention needs still require classroom review.

GitHub Actions checks on the review branch and the live Pages deployment are separate from these local results. Publication occurs after merge to main. This milestone has outdoor exploration and conversation panels; playable interiors, usable item inventory, long-term bills/loan contracts, and the age-22 simulation remain future work. The weekly housing amounts and reduced-service event are illustrative scenarios.
