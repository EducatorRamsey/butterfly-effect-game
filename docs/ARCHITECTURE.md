# Extending the game

`src/world.ts` owns the Phaser scene: locally drawn scenery, static collision bodies, directional character textures, acceleration, camera, nearby prompts, and pointer/touch-facing hooks. Scene events pass through a small hook interface; economics does not depend on Phaser. `Neighborhood.visit` provides direct-to-entrance travel for pointer and accessible-menu use.

`src/model.ts` owns typed resources, initial pathway differences, affordability/time/requirement rules, immutable decision consequences, clock formatting, and versioned local-storage persistence. Choice application rejects repeated location commitments. Spending and savings are separate; transfers never create wealth.

`src/story.ts` is the content catalog. Each location contains a speaker, short conversation, scarcity cue, and typed choices. Add or edit conversations here. A choice declares its time, cash change, next-best alternative, result, and optional skills, relationship, housing, transportation, income, rent, requirement, or deadline. Negative `money` means a cash cost. `choicesFor` demonstrates conditional content (Elena's housing help); `followup` provides callbacks to prior decisions.

`src/main.ts` coordinates the state and accessible DOM screens, dashboard, modal dialogue, reflection, journal, save notifications, touch input, and startup. Browser-native `<dialog>` provides modal keyboard containment and Escape support. Narration follows the visible panel's complete text. `src/narration.ts` isolates speech synthesis, replay, cancellation, and speed. `src/style.css` contains the responsive visual system and reduced-motion treatment.

## Adding a scenario

1. Add a choice to the relevant `locations` entry in `story.ts`, with a concrete resource consequence and a clear next-best alternative.
2. Add a typed effect in `Choice` and `decide` if needed. Avoid encoding financial consequences only in text.
3. For later callbacks, add a flag in the earlier choice, and resolve the later variation in `choicesFor` or `followup`.
4. Add a Playwright test exercising the actual buttons, saved resources, and relevant followup. Cover both affordable and unavailable conditions.
5. Run `npm run build` and `npm test`. Recheck the whole chapter before extending the simulation.

## Design boundaries

No student identity is requested. The single browser save is local, not synced, and can be unavailable under browser storage restrictions. The UI reports a save failure rather than falsely promising persistence. Story strings are developer-authored static data, not user HTML. Future free-text reflections must use text nodes or escaping before display.

Current portraits and world illustrations are original procedural prototype art. Replace draw calls/textures without changing economic rules. Use licensed assets and record attribution if assets are added.

The one-day chapter has no passive calendar simulation, medical system, inventory of usable tools, or loan contracts. Skills and relationships are simple tracked counters, not student grades. Accessibility is supported through HTML alternatives, but teacher/student testing with assistive technology remains necessary before broad classroom release.
