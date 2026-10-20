# Validation of the two-week expansion (v0.3)

Tested with Node 24.19.0, npm 11.9.0, and system Chromium through Playwright.

- `npm run build`: TypeScript and Vite production build passed.
- `npm test`: **38 passed**, no skipped tests, across desktop 1440×1000 and Chromebook 1366×768.
- Production smoke: served built `dist/`, selected Trades, read the corrected introduction, visited all five characters, interacted with the lowrider, verified its saved outcome, and opened the calendar bulletin. No page exceptions or HTTP errors.
- Visual review: inspected game-canvas captures at the home, training center, and apartments, which together show all five characters. Names sit to the left of the player and characters; their heads and bodies are unobstructed.

## Classroom-feedback coverage

Eight new browser scenarios run at both viewport sizes:

1. Day 2's three-hour work meeting blocks the longer advising appointment before its deadline. The library alternative stays open. The calendar has fourteen days, a current bulletin, and an unread-update indicator that clears when checked.
2. The lowrider, mural, and bosque have functional decisions. Their outcomes save; reloading preserves the same seeded daily bulletin.
3. A bike remains available to buy after the route change. Time with Alex raises a separate connection value and unlocks a bike loan at 2.
4. Groceries cost $20 for three meals in one hour. Community food pickup takes two hours for one meal, without a cash cost. A later packed-meal shift consumes one meal and pays $8 more than buying lunch.
5. A completed older seven-day save retains funds and its prior bill, advances through days 8–14, and gets exactly one new Friday charge. Reloading the ending does not charge again.
6. Week-two housing opens a quiet-space learning benefit; supervised practice consumes a part; a later repair job is unavailable without equipment despite time remaining; Trades can submit an apprenticeship application.
7. Different days show different reflection questions. A smaller room changes the monthly rent to $350 and the weekly bill to $88.
8. Mouse events from an HTML control cannot activate a world building underneath their coordinates. This guards a real bug uncovered in the first Chromebook pass.

## Existing-game regressions

The original eleven scenarios still run at both sizes: all five locations, exact resource changes, training and family callbacks, movement and collision, map and held directional controls, narration text/speed, modal keyboard access, affordability, enrollment deadlines, first-week progression, midweek save/continue, legacy day-1 saves, bus-service conflicts, and low-funds housing settlement.

Every scenario monitors uncaught JavaScript errors and HTTP errors. Test names and exact expectations are in `tests/game.spec.ts`, `tests/week.spec.ts`, and `tests/expansion.spec.ts`.

## Limits

Tests use real Chromium at representative viewport sizes, not physical Chromebooks or mobile devices. Held pointer input tests the directional controls. Audible narration, school browser policies, assistive technology, and student reading/attention needs need classroom review.

The new code has not yet run through GitHub Actions or live Pages deployment. Those occur separately after pushing and merging. Random events are saved-seed variations with disclosed consequences; they never remove money automatically. Housing, wages, and service conditions are illustrative classroom scenarios.

This remains an age-18, two-week chapter with outdoor exploration. Playable interiors, a full age-18-to-22 simulation, and long-term loan/overdue-bill consequences remain future work. Old saves retain existing choices and finances; new supplies default to zero, without retroactively changing their old outcomes.
