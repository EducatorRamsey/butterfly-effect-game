# Extending the game

`src/world.ts` owns the Phaser scene: locally drawn scenery, static collision bodies, directional character textures, acceleration, camera, nearby prompts, and pointer/touch-facing hooks. Scene events pass through a small hook interface; economics does not depend on Phaser. `Neighborhood.visit` provides direct-to-entrance travel for pointer and accessible-menu use.

`src/model.ts` owns typed resources, initial pathway differences, affordability/time/requirement rules, immutable decision consequences, clock formatting, and versioned local-storage persistence. It also owns daily choice scoping, the seven-day calendar, idempotent end-of-week housing settlement, daily advancement, and cash/savings/unpaid-balance ledger entries. Choice application rejects a second commitment at the same location on the same day; another day can offer new choices. Spending and savings are separate; transfers never create wealth.

`src/story.ts` is the graduation-day content catalog. Each location contains a speaker, short conversation, scarcity cue, and typed choices. Add or edit conversations here. A choice declares its time, cash change, next-best alternative, result, and optional skills, relationship, housing, transportation, income, rent, requirement, or deadline. Negative `money` means a cash cost. `choicesFor` demonstrates conditional content (Elena's housing help); `followup` provides callbacks to prior decisions.

`src/week.ts` supplies days 2–7 through `weekLocation(base, state)`. It reuses the existing five locations and speakers, resolves prior-choice callbacks, and includes Tuesday’s 90-minute bus penalty in the time shown before committing to work or learning. Scene travel still uses the normal five-minute visit cost.

`src/main.ts` coordinates the state and accessible DOM screens, dashboard, modal dialogue, reflection, journal, save notifications, touch input, and startup. Browser-native `<dialog>` provides modal keyboard containment and Escape support. Narration follows the visible panel's complete text. `src/narration.ts` isolates speech synthesis, replay, cancellation, and speed. `src/style.css` contains the responsive visual system and reduced-motion treatment.

## Adding a scenario

1. Add a graduation-day choice to `story.ts` or a later-day scenario to `week.ts`, with a concrete resource consequence and a clear next-best alternative. Use one or two sentences for dialogue; keep essential costs in the choice detail and extra context behind disclosure controls.
2. Add a typed effect in `Choice` and `decide` if needed. Avoid encoding financial consequences only in text.
3. For later callbacks, add a flag in the earlier choice, and resolve the later variation in `choicesFor` or `followup`.
4. Add a Playwright test exercising the actual buttons, saved resources, and relevant followup. Cover both affordable and unavailable conditions.
5. Run `npm run build` and `npm test`. Recheck the whole chapter before extending the simulation.

## Design boundaries

No student identity is requested. The single browser save is local, not synced, and can be unavailable under browser storage restrictions. The UI reports a save failure rather than falsely promising persistence. Story strings are developer-authored static data, not user HTML. Future free-text reflections must use text nodes or escaping before display.

Current portraits and world illustrations are original procedural prototype art. Replace draw calls/textures without changing economic rules. Use licensed assets and record attribution if assets are added.

The seven-day chapter has no long-term calendar simulation, medical treatment system, inventory of usable tools, or loan contracts. The clinic scenario concerns appointment time. A tool-bench scenario concerns shared access rather than owned items. Skills and relationships are simple tracked counters, not student grades. Accessibility is supported through HTML alternatives, but teacher/student testing with assistive technology remains necessary before broad classroom release.

## Save compatibility and weekly money

The storage key remains `butterfly-effect-v1`. Legacy saves default to day 1, an empty new ledger, and an unfinished week. Old decision records without `day` count as day-1 decisions. An old completed first chapter can advance to day 2. The game preserves its money, savings, flags, and choices rather than trying to reconstruct cash flows from prose. New records include both day and choice ID.

`finishDay` returns unchanged state when already ended. On day 7 it applies housing once: cash first, savings second, then the gap as an unpaid bill in `debt`. `nextDay` advances only ended days 1–6, resets the daily clock and position, and retains decisions and money. Temporary Tuesday rides restore the previous transport mode the next morning.

Daily wages are credited in `decide`, not at calendar advancement. `incomeSet` updates a schedule estimate without adding cash. The ledger labels every decision and the single weekly settlement. Savings transfers record opposite cash/savings effects. No interest or loan origination occurs in this chapter.

## Two-week expansion (v0.3)

`firstWeekBalance.ts` rebalances the existing first-week content without duplicating its rendering logic. Day 2 has a three-hour work meeting and a 2 PM advising deadline. Food choices differ in quantity and waiting time. Housing scenes cover quiet space, viewing access, and sharing maintenance responsibilities. Bike purchases stay available after the initial transport decision.

`secondWeek.ts` defines days 8–14. It resolves earlier skill, housing, relationship, food, and equipment decisions into later opportunities. `neighborhood.ts` owns the three discovery sites, seeded daily bulletins, shared choice factory, and fourteen distinct reflection prompts. `world.ts` renders and detects both the five original locations and the three discoveries; the HTML map provides equivalent access.

The save still uses the original key. New fields default safely for old saves: meals, parts, wellbeing, Alex connection, Jordan trust, calendar-read days, and a stable event seed. A completed day-7 save becomes an ended first week that can advance; its money and payment ledger are retained. `finishDay` settles housing on days 7 and 14, and only day 14 completes the current game. Each ledger entry records its actual day. Friday housing is `ceil(monthly rent / 4)` for a room or $40 with family; the smaller room is $88/week.

Food and parts are usable resources, not decorative counters. A packed meal saves $8 on an eligible work shift; repair practice or work consumes a part. An Alex connection of 2 permits a bike loan. Jordan trust opens shared housing and coordination options. Quiet housing saves 30 minutes on week-two learning; wellbeing of at least 4 saves another 15 minutes. The smaller room trades away the quiet-space saving. These supports are illustrative game rules, not measures of a student's worth.

Daily bulletins are derived from the saved seed and day. New stories vary; revisiting or reloading cannot reroll a donated part, paint availability, or weather notice. No money is randomly removed. Weather affects the trail and week-two city-bus commitments; costs appear before choosing. Future calendar entries list known deadlines; the current bulletin reveals that morning's change.
