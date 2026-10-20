# Architecture

The game separates Phaser exploration, the accessible DOM interface, story data, economic rules, financial settlement, saving, narration, and the final reflection.

## Modules

- `world.ts`: original drawn scenery and characters, collisions, camera, directional animation, prompts, and mouse/keyboard/touch-facing hooks. World pointer events require an actual canvas target so HTML buttons cannot activate buildings underneath.
- `main.ts`: title and introduction, accessible modal conversations, dashboard, calendar/timeline, optional exploration, chapter transitions, journal, and narration controls. The same saved state feeds both the canvas and HTML alternatives.
- `model.ts`: typed state and choices, availability rules, immutable choice application, persistence validation, old-save migration, and one-time day/moment completion.
- `story.ts`, `week.ts`, `firstWeekBalance.ts`, `secondWeek.ts`: graduation and the two-week opening. Choices define visible costs, resource effects, requirements, and a next-best alternative.
- `neighborhood.ts`: discovery sites, seeded bulletins, choice helpers, and opening reflections.
- `timeline.ts`: nine later moments, chapter/age/season labels, main locations, and reflection questions. Days 15–23 are internal IDs for time-jump moments, not consecutive calendar days.
- `chapters.ts`: all later-chapter conversations and decisions, including recurring-character callbacks and four work/learning directions. Each moment has a required main decision and optional activities.
- `finance.ts`: representative monthly forecasts and settlement. It never advances hidden months.
- `snapshot.ts`: age-22 outcome, significant-decision selection, personal reflection, escaped HTML, and plain-text export.
- `narration.ts`: browser speech synthesis, cancellation, complete-panel text, and rate.
- `style.css`: visual system, responsive layout, reduced motion, and print layout.

## Progression and time

The first fourteen days remain chapter 1. Chapters 2, 3, and 4 each contain three moments across ages 19–22. `stageForDay` supplies the current label and required location. `finishDay` rejects a later moment without its main decision. Optional choices are unavailable until that decision is made. Travel before it is free in time so wandering cannot consume an essential appointment and deadlock the story. After the main decision, time costs and bus commute penalties apply normally.

Only the final age-22 moment sets `completed`. A completed older day-7 or day-14 save becomes an ended opening segment that can continue. At the first time jump, fresh food is cleared and Alex's opening bike loan is returned; durable skills, relationships, money, savings, parts, and choices remain.

## Finances

Opening housing is settled once on days 7 and 14. Later moments branch to `settleMonth` before weekly logic; no month receives both a weekly and monthly housing charge.

`LifeProfile` holds monthly take-home income, essentials, tuition, planned loan payment, learning milestones, credential/portfolio, and the budget history. `forecast` computes variable income from the saved seed, housing, 0.5% monthly loan interest, an affordable actual loan payment, reserve use, and any unpaid bills. `settleMonth` applies exactly that forecast, appends the money ledger, and stores the period in history. An already-ended moment returns unchanged state, including after a reload.

`loan` tracks formal illustrative loan principal plus modeled interest. `debt` tracks unpaid bills. Loan payments can only use funds left after basic expenses; a cash shortfall never creates a fictional payment. A car loan directly finances the car; a college transition loan adds cash and a matching loan balance. Savings transfers move existing cash. Intervening months are neither charged nor credited, and the UI states this before transitions and in the final snapshot.

Education milestones represent learning across the time jumps. Completing a credential needs earlier preparation; a free work/community-experience alternative always remains. Every required moment has an attainable option for a player with no cash, no credential, or little social support.

## Persistence and privacy

The key remains `butterfly-effect-v1`; migrations fill new fields without reconstructing historical finances. JSON values are validated before use. Reflection fields are limited to 600 characters, escaped on HTML rendering, and exported as plain text. They remain on the local device. No name, account, analytics, database, or external API is required.

`calendarChecked` records read notices. The opening seed fixes daily events on reload, and later independent-work income uses the same seed for stable previews. Print and download are explicit local actions.

## Adding content safely

1. Add content to the appropriate data module. Keep speech short and all costs visible before choosing.
2. Express effects in typed `Choice` fields, not only in narration. Keep a free attainable main option and explain the next-best alternative.
3. For later callbacks, inspect existing flags, skills, relationships, or budget values rather than assuming every player followed one path.
4. Add an actual browser scenario for the new behavior, including an unavailable or low-resource case when relevant.
5. Run the production build and browser regressions, including a fresh full-game route and old-save continuation.
