# Version 1.0 validation

The game now contains the full requested narrative arc: the two-week opening and three later chapters, ending at age 22. Validation used Node 24.19.0, npm 11.9.0, and Chromium through Playwright.

## Completed checks

- TypeScript checking and Vite production build passed.
- The full 54-test desktop/Chromebook regression run passed with no skipped tests.
- A subsequent focused run passed all 18 later-chapter checks after consistency refinements, including two new viewport-specific checks for changing direction and a higher household contribution. Together, these runs cover 56 distinct passing browser scenarios. No tests were skipped.
- A production-browser smoke run used built `dist/` assets, continued an opening save through all nine later moments, completed a training credential, financed a car, settled nine budgets, and reached the age-22 snapshot. The ending had a $630 remaining car-loan balance. There were no uncaught JavaScript errors or failed asset requests.
- The final snapshot was visually inspected at 1366×900. It shows learning, housing, transport, finances, relationships, and the chosen opportunity cost in the accessible dialogue interface.

## Complete-game coverage

`tests/life.spec.ts` exercises each of College, Employment, Trades, and Independent work from a fresh story, through the opening and all three later chapters, to age 22. Tests verify the correct pathway-specific credential/portfolio, nine monthly settlements, retained earlier choices, final narration text, selecting an important decision, writing a reflection, downloading the actual snapshot contents, and reloading the final save without duplicating settlement.

Boundary scenarios cover:

- A completed older two-week save continuing without losing cash, with a required main decision and reserved exploration time.
- A $600 college transition loan: $3 interest, a $50 payment, a $553 remaining loan balance, and cash matching the preview. Reloading does not reapply the month.
- An unaffordable modeled month: $100 spending and $50 reserves are used, $1,150 becomes unpaid bills, and a $1,200 loan accrues $6 interest without inventing an unaffordable payment.
- A player with no cash or learning milestones still reaching a complete age-22 outcome through work/community experience. Reflection HTML is escaped on reload, and restarting remains available.
- A higher family contribution preserving the actual home, and a paid bridge course updating the direction while retaining learning experience.

The earlier 38 browser scenarios retain coverage of movement, collisions, nearby and map interactions, all five character locations, three discoveries, seeded bulletins, cash/food/equipment scarcity, friendship support, quiet housing, narration rates, modal keyboard focus, the first two weeks, and legacy day-1/day-7 saves.

Every browser scenario checks for uncaught JavaScript errors and HTTP errors.

## Limits

These checks run real Chromium at desktop 1440×1000 and Chromebook 1366×768 viewports, not physical school devices. Native touch hardware, audible voice quality, assistive technology, and physical printing were not tested. The print action and print layout are implemented; download contents and persistent reflection text were browser-tested.

The full regression result is local. GitHub Actions and publication to the live Pages URL are separate operations after pushing and merging. The 25–35-minute classroom session is a design target, not a measured class result.

The economy models selected months, not every intervening month between ages 18 and 22. Amounts are illustrative. The four-chapter story and final ending are complete; refined art, explorable interiors, translations, and offline caching are optional enhancements.
