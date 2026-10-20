import Phaser from "phaser";
import "./style.css";
import {
  dailyCount,
  todayDecision,
  finishDay,
  nextDay,
  housingDue,
  DAYS,
  initial,
  load,
  save,
  decide,
  clock,
  unavailable,
  type State,
  type Place,
  type Path,
} from "./model";
import { locations, choicesFor, followup, type Location } from "./story";
import { dayPlans, dayLabel, weekLocation, calendarNote } from "./week";
import {
  discoveries,
  discoveryLocation,
  dailyEvent,
  reflectionQuestion,
} from "./neighborhood";
import { Neighborhood } from "./world";
import { Narrator } from "./narration";
const $ = <T extends HTMLElement = HTMLElement>(s: string) =>
  document.querySelector<T>(s)!;
const narrator = new Narrator();
let state: State = load() || initial("College");
let active = false;
let scene: Neighborhood;
let previousFocus: HTMLElement | null = null;
let resultMode = false;
const dollars = (n: number) => `$${n.toLocaleString()}`;
$("#app").innerHTML = `
<header class="masthead"><a class="brand" href="#" aria-label="The Butterfly Effect, title screen"><span class="butterfly">✦</span><span>THE BUTTERFLY EFFECT<small>THE COST OF EVERY CHOICE</small></span></a><span class="edition">A LIFE IN THE MAKING <i>·</i> YOUR FIRST TWO WEEKS</span><button id="help" class="quiet">How to play</button></header>
<main id="game-shell" hidden>
<section class="topline"><div><span class="eyebrow">ALBUQUERQUE, NEW MEXICO</span><h1>Your next chapter starts here.</h1><p>Two weeks. A neighborhood with stories to discover.</p></div><div class="day"><span id="day-label">DAY 1 · SATURDAY · AGE 18</span><strong id="clock"></strong><small>Today ends at 6:00 PM</small></div></section>
<section class="dashboard" aria-label="Your resources" aria-live="polite"><div><span>SPENDING MONEY</span><strong id="money"></strong></div><div><span>SAVINGS / UNPAID</span><strong id="savings"></strong></div><div><span>TIME LEFT</span><strong id="time-left"></strong></div><div><span>SKILLS</span><strong id="skill"></strong></div><div><span>YOUR PATH</span><button id="path" class="path-button"></button></div></section>
<section class="play-layout"><div class="world-card"><div class="world-top"><span><i class="live-dot"></i> JUNIPER NEIGHBORHOOD</span><span>Explore. Connect. Choose.</span></div><div id="world"></div><div class="world-bottom"><span id="prompt" role="status">Explore at your pace · Locations menu also works</span><button id="map" class="small-button">Locations →</button></div><div class="touch" aria-label="Touch movement"><button data-dir="up" aria-label="Move up">↑</button><div><button data-dir="left" aria-label="Move left">←</button><button data-dir="down" aria-label="Move down">↓</button><button data-dir="right" aria-label="Move right">→</button></div></div></div>
<aside class="sidebar"><span class="eyebrow">A LITTLE DIRECTION</span><h2>There’s no single<br>right way forward.</h2><p>You have limited time today. Discover what matters to you, and what each choice leaves behind.</p><div class="rule"></div><button id="calendar" class="wide secondary">Week calendar →</button><div id="today-plan" class="today-plan"></div><section id="supplies" class="supplies" aria-label="Supplies and support"></section><h3>YOUR NEIGHBORHOOD</h3><nav id="location-list" aria-label="Visit a location"></nav><h3>DISCOVER ALBUQUERQUE</h3><nav id="discoveries" aria-label="Explore Albuquerque"></nav><div class="note"><span>→ THE RIPPLE EFFECT</span><p id="ripple">Small choices can open unexpected doors. Start a conversation.</p></div><button id="summary" class="wide secondary">Decision journal <span id="count">0 / 5</span></button><button id="finish" class="wide primary">Finish the day →</button></aside></section>
<footer class="game-footer"><span><kbd>W A S D</kbd> / <kbd>↑ ↓ ← →</kbd> Move <b>·</b> <kbd>E</kbd> Talk <b>·</b> Click a building to visit</span><span id="save-status" role="status">Progress saves on this device</span></footer></main>
<section id="title" class="title-screen"><div class="title-art" aria-hidden="true"><div class="sun"></div><div class="mountain mountain-back"></div><div class="mountain"></div><span class="art-caption">35.0844° N &nbsp; 106.6504° W<br>ALBUQUERQUE, NEW MEXICO</span><div class="adobe a1"></div><div class="adobe a2"></div><div class="desert-road"></div><div class="desert-plant">✺</div></div><div class="title-copy"><span class="eyebrow">YOUR LIFE. YOUR CHOICES. THEIR RIPPLE EFFECTS.</span><h1>The Butterfly<br><em>Effect.</em></h1><p class="subtitle">The cost of every choice</p><p>School is over. What comes next is yours to explore.</p><p>Meet your neighbors. Make choices with limited time and money. See how choices unfold across two weeks.</p><label for="starting-path">Where are you thinking of starting?</label><select id="starting-path"><option>College</option><option>Employment</option><option>Trades</option><option>Independent work</option></select><p class="fine">A starting point, not a permanent track. You can change direction.</p><div class="title-actions"><button id="new" class="primary">Begin your story →</button><button id="continue" class="secondary" ${load() ? "" : "disabled"}>Continue saved story</button></div><span class="fine">FOURTEEN PLAYABLE DAYS · A LIFE IN THE MAKING</span></div></section>
<section class="access-bar" aria-label="Narration and accessibility"><span>READ IT YOUR WAY</span><button id="listen">Listen</button><button id="replay">Replay</button><button id="stop">Stop</button><label>Speed <select id="speed" aria-label="Narration speed"><option value="0.7">0.7×</option><option value="0.85">0.85×</option><option value="1" selected>1×</option><option value="1.15">1.15×</option><option value="1.3">1.3×</option></select></label><label class="check"><input id="auto-read" type="checkbox"> Auto-narrate</label><label class="check"><input id="reduce" type="checkbox"> Reduce motion</label><span id="speech-status" role="status"></span></section>
<dialog id="dialog" aria-labelledby="dialog-title"><div id="dialog-content"></div><div class="panel-narration" aria-label="Dialogue narration"><button id="panel-listen" aria-label="Listen to this panel">Listen</button><button id="panel-replay" aria-label="Replay this panel">Replay</button><button id="panel-stop" aria-label="Stop panel narration">Stop</button><label>Speed <select id="panel-speed" aria-label="Panel narration speed"><option value="0.7">0.7×</option><option value="0.85">0.85×</option><option value="1" selected>1×</option><option value="1.15">1.15×</option><option value="1.3">1.3×</option></select></label><span id="panel-speech-status" role="status"></span></div><button id="close-dialog" class="close" aria-label="Close dialogue">×</button></dialog>`;
const dialog = $<HTMLDialogElement>("#dialog");
function render() {
  $("#calendar").textContent = state.calendarChecked.includes(state.day)
    ? "Week calendar ✓"
    : "Week calendar · new updates";
  $("#supplies").innerHTML =
    `<strong>Meals ${state.meals} · Repair parts ${state.parts}</strong><small>Alex connection ${state.alex} · Jordan trust ${state.jordan}</small><small>Wellbeing ${state.wellbeing}/5${state.wellbeing >= 4 ? " · rested focus available" : ""}</small>`;
  $("#discoveries").innerHTML = discoveries
    .map((d) => `<button data-place="${d.id}">${d.name} →</button>`)
    .join("");
  $("#clock").textContent = clock(state.minutes);
  $("#day-label").textContent = dayLabel(state) + " · Age 18";
  $("#today-plan").innerHTML =
    `<span class="eyebrow">TODAY</span><p>${dayPlans[state.day - 1].focus}</p>`;
  $("#money").textContent = dollars(state.money);
  $("#savings").textContent =
    `${dollars(state.savings)} / ${dollars(state.debt)}`;
  $("#time-left").textContent =
    `${Math.floor((1080 - state.minutes) / 60)}h ${Math.floor((1080 - state.minutes) % 60)}m`;
  $("#skill").textContent =
    `${state.skill} ${state.skill === 1 ? "step" : "steps"} forward`;
  $("#path").textContent = state.path + " →";
  $("#count").textContent = `${dailyCount(state)} commitments today`;
  $("#location-list").innerHTML = locations
    .map(
      (l, i) =>
        `<button data-place="${l.id}"><span class="location-number">0${i + 1}</span><span>${l.name}<small>${l.person}</small></span><span class="visit-status">${todayDecision(state, l.id) ? "✓" : "→"}</span></button>`,
    )
    .join("");
  document
    .querySelectorAll<HTMLButtonElement>("[data-place]")
    .forEach((b) => (b.onclick = () => directVisit(b.dataset.place as Place)));
  $("#ripple").textContent = state.decisions.length
    ? state.decisions.at(-1)!.result
    : "Small choices can open unexpected doors. Start a conversation.";
  if (scene) scene.paused = !active || dialog.open || state.ended;
  persist();
}
function persist() {
  if (!active) return;
  $("#save-status").textContent = save(state)
    ? "✓ Progress saved on this device"
    : "Saving unavailable · keep this tab open";
}
function open(html: string, kind: string) {
  previousFocus = document.activeElement as HTMLElement;
  dialog.dataset.kind = kind;
  $("#dialog-content").innerHTML = html;
  if (!dialog.open) dialog.showModal();
  if (scene) scene.paused = true;
  narrator.update($("#dialog-content").innerText);
  queueMicrotask(() => {
    const first = $("#dialog-content").querySelector<HTMLElement>(
      "button,select,textarea",
    );
    (first || $("#close-dialog")).focus();
  });
}
function close() {
  narrator.stop();
  dialog.close();
  if (scene) scene.paused = !active || state.ended;
  if (active)
    document
      .querySelector<HTMLCanvasElement>("#world canvas")
      ?.focus({ preventScroll: true });
  else previousFocus?.focus();
}
$("#close-dialog").onclick = close;
dialog.addEventListener("cancel", (e) => {
  e.preventDefault();
  close();
});
dialog.addEventListener("close", () => {
  if (scene) scene.paused = !active || state.ended;
});
function start(fresh: boolean) {
  if (fresh)
    state = initial($<HTMLSelectElement>("#starting-path").value as Path);
  else state = load() || state;
  active = true;
  $("#title").hidden = true;
  $("#game-shell").hidden = false;
  if (!scene) boot();
  else {
    scene.resetPosition(state.x, state.y);
  }
  render();
  if (state.ended) summary();
  else if (fresh) intro();
  else if (state.day > 1) morning();
}
function boot() {
  scene = new Neighborhood(
    {
      enter: (id) => (state.ended ? dayComplete() : visit(id)),
      travel: (seconds, x, y) => {
        if (!active || state.ended) return;
        const previousMinutes = state.minutes;
        state.x = x;
        state.y = y;
        state.walking += seconds;
        while (state.walking >= 15) {
          state.minutes = Math.min(1080, state.minutes + 5);
          state.walking -= 15;
        }
        if (state.minutes !== previousMinutes) render();
        else persist();
        if (state.minutes >= 1080 && !dialog.open) {
          state = finishDay(state);
          render();
          dayComplete();
        }
      },
      prompt: (t) => ($("#prompt").textContent = t),
    },
    state.x,
    state.y,
  );
  scene.reduced = $<HTMLInputElement>("#reduce").checked;
  new Phaser.Game({
    type: Phaser.CANVAS,
    parent: "world",
    backgroundColor: "#e7d5b1",
    width: 960,
    height: 560,
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: "arcade", arcade: { debug: false } },
    render: { antialias: true, roundPixels: true },
    scene: [scene],
  });
}
function intro() {
  open(
    `<span class="eyebrow">DAY 1 · SATURDAY</span><h2 id="dialog-title">A day of possibilities.</h2><p>You’re exploring ${state.path.toLowerCase()}. You have ${dollars(state.money)} to spend and nine hours today. You can’t do everything—that’s <strong>scarcity</strong>.</p><div class="callout"><p>You live with your aunt, Elena. Help her, or use the shared laptop for a scholarship? The next-best choice you give up is your <strong>opportunity cost</strong>.</p></div><details><summary>Controls and travel time</summary><p>Walk with WASD or arrows. Press E near a person, or choose a location. Walking uses 5 game minutes per 15 seconds; menu travel takes 5 minutes.</p></details><button id="intro-next" class="primary">Explore my neighborhood →</button>`,
    "intro",
  );
  $("#intro-next").onclick = close;
}
function morning() {
  const plan = dayPlans[state.day - 1],
    event = dailyEvent(state);
  open(
    `<span class="eyebrow">${dayLabel(state)}</span><h2 id="dialog-title">${plan.title}</h2><p>${plan.note} Check the weekly calendar before choosing.</p><div class="callout"><strong>Today’s heads-up</strong><p>${plan.focus}</p><strong>${event.title}</strong><p>${event.text}</p></div><p class="cost-line">${dollars(state.money)} spending · ${dollars(state.savings)} saved · Friday housing: ${dollars(housingDue(state))}</p><button id="morning-go" class="primary">Start today →</button><button id="morning-calendar" class="secondary">Check the calendar</button>`,
    "morning",
  );
  $("#morning-go").onclick = close;
  $("#morning-calendar").onclick = calendar;
}
function advance() {
  const next = nextDay(state);
  if (next === state) return;
  state = next;
  close();
  scene.resetPosition(state.x, state.y);
  render();
  morning();
}
function calendar() {
  if (!state.calendarChecked.includes(state.day))
    state.calendarChecked.push(state.day);
  render();
  const event = dailyEvent(state);
  open(
    `<span class="eyebrow">YOUR FIRST TWO WEEKS</span><h2 id="dialog-title">Make room for what matters.</h2><p>${calendarNote(state)}</p><div class="callout"><strong>Today’s bulletin · ${event.title}</strong><p>${event.text}</p></div><ol class="calendar-grid">${dayPlans.map((p, i) => `<li ${i + 1 === state.day ? 'aria-current="date"' : ""}><strong>Day ${i + 1} · ${DAYS[i % 7]}</strong><span>${p.title}</span><small>${p.focus}</small><small>${i + 1 < state.day ? "Day finished" : i + 1 === state.day ? "You are here" : "Coming up"}</small></li>`).join("")}</ol><details><summary>How the money works</summary><p>Work pays after each completed shift. The weekly income number is a plan, not extra pay. Friday housing uses spending money first, then savings; any shortfall becomes an unpaid bill with no interest.</p><p>The $125 weekly room payment is a simplified four-week share of the $500 monthly rent. Family housing has a $40 weekly contribution. These are classroom examples.</p></details><button id="calendar-back" class="primary">Back to today →</button>`,
    "calendar",
  );
  $("#calendar-back").onclick = () => {
    if (state.ended) summary();
    else close();
  };
}
function visit(id: Place) {
  if (!active) return;
  const base = [...locations, ...discoveries].find((l) => l.id === id)!;
  const l = discoveries.some((d) => d.id === id)
    ? discoveryLocation(base, state)
    : weekLocation(base, state);
  if (!state.visited.includes(id)) state.visited.push(id);
  const p = scene?.position();
  if (p) {
    state.x = p.x;
    state.y = p.y;
  }
  render();
  resultMode = false;
  showLocation(l);
}
function showLocation(l: Location) {
  const done = todayDecision(state, l.id);
  const choices = choicesFor(l, state);
  open(
    `<div class="conversation-head"><div class="portrait" style="--portrait:#${l.color.toString(16)}" aria-hidden="true"><span class="portrait-hair"></span><span class="portrait-face">${l.initials}</span><span class="portrait-shirt"></span></div><div><span class="eyebrow">${l.name}</span><h2 id="dialog-title">${l.person}</h2><span class="muted">${l.role}</span></div></div><p class="dialogue-text">${done ? followup(l, state) : l.text}</p><div class="scarcity">◇ ${l.scarcity}</div>${
      done
        ? `<div class="callout"><strong>Your choice: ${done.title}</strong><p>You gave up: ${done.cost}</p></div><button id="back-world" class="primary">Back to the neighborhood →</button>`
        : state.ended
          ? "<p>Today is finished. Open your journal to start the next day.</p>"
          : `<p class="choice-hint">Choose one for today. You can leave and think first.</p><div class="choices">${choices
              .map((c, i) => {
                const reason = unavailable(state, c);
                return `<button data-choice="${i}" ${reason ? "disabled" : ""}><strong>${c.label}</strong><span>${c.detail}</span>${reason ? `<small>${reason}</small>` : ""}</button>`;
              })
              .join(
                "",
              )}</div><details><summary>Tell me more about the trade-offs</summary>${choices.map((c) => `<p><strong>${c.label}:</strong> You give up ${c.nextBest.charAt(0).toLowerCase() + c.nextBest.slice(1)}</p>`).join("")}</details>`
    }`,
    "location",
  );
  document.querySelectorAll<HTMLButtonElement>("[data-choice]").forEach(
    (b) =>
      (b.onclick = () => {
        if (resultMode) return;
        const c = choices[Number(b.dataset.choice)];
        const next = decide(state, l.id, c);
        if (next === state) return;
        state = next;
        resultMode = true;
        render();
        open(
          `<span class="eyebrow">A CHOICE. A RIPPLE.</span><h2 id="dialog-title">${c.label}</h2><p>${c.result}</p><div class="callout"><strong>What changed</strong><p>${c.time} minutes used · ${c.money >= 0 ? "+" : ""}${dollars(c.money)} spending money${c.savings ? ` · +$${c.savings} savings` : ""}${c.skill ? " · +" + c.skill + " skill" : ""}${c.meals ? ` · +${c.meals} packed meals` : ""}${c.mealCost ? ` · ${c.mealCost} meal used` : ""}${c.parts ? ` · +${c.parts} repair part` : ""}${c.partsCost ? ` · ${c.partsCost} part used` : ""}${c.alex ? ` · +${c.alex} Alex connection` : ""}${c.friends ? ` · +${c.friends} connection` : ""}${c.wellbeing ? ` · wellbeing ${state.wellbeing}/5` : ""}${c.income ? " · $" + c.income + "/week expected income" : ""}${c.rent ? " · $" + c.rent + "/month rent" : ""}</p><strong>Your opportunity cost</strong><p>${c.nextBest}</p></div><button id="result-next" class="primary">Continue →</button>`,
          "result",
        );
        $("#result-next").onclick = () => {
          if (state.minutes >= 1080) {
            state = finishDay(state);
            render();
            dayComplete();
            return;
          }
          if (
            state.decisions.length === 3 &&
            !state.flags.includes("reflection")
          )
            reflection();
          else close();
        };
      }),
  );
  const back = document.querySelector<HTMLButtonElement>("#back-world");
  if (back) back.onclick = close;
}
function reflection() {
  state.flags.push("reflection");
  persist();
  open(
    `<span class="eyebrow">PAUSE & NOTICE · REFLECTION 1</span><h2 id="dialog-title">What was hardest to make room for?</h2><p>You have made three commitments. Which scarce resource shaped your choices most?</p><div class="choices">${["Time in the day", "Money available", "Seats, housing, or services"].map((t) => `<button data-reflection="${t}">${t}</button>`).join("")}</div>`,
    "reflection",
  );
  document.querySelectorAll<HTMLButtonElement>("[data-reflection]").forEach(
    (b) =>
      (b.onclick = () => {
        state.flags.push("reflection: " + b.dataset.reflection);
        persist();
        open(
          `<h2 id="dialog-title">More than one answer can fit.</h2><p>You noticed ${b.dataset.reflection?.toLowerCase()}. For your last decision, the next-best alternative was: ${state.decisions.at(-1)!.cost}</p><p>Scarcity can mean limited space or service—not just a price.</p><button id="reflect-next" class="primary">Keep exploring →</button>`,
          "reflection",
        );
        $("#reflect-next").onclick = close;
      }),
  );
}
function directVisit(id: Place) {
  if (state.ended) {
    visit(id);
    return;
  }
  if (dialog.open) close();
  scene.visit(id);
}
function map() {
  open(
    `<span class="eyebrow">ACCESSIBLE NEIGHBORHOOD MAP</span><h2 id="dialog-title">Where would you like to go?</h2><p>Each visit takes 5 minutes. Discoveries are real places to visit too. Walking is always available too.</p><div class="choices">${[...locations, ...discoveries].map((l) => `<button data-travel="${l.id}"><strong>${l.name}</strong><span>Talk to ${l.person} · ${todayDecision(state, l.id) ? "choice recorded" : "opportunity to explore"}</span></button>`).join("")}</div>`,
    "map",
  );
  document.querySelectorAll<HTMLButtonElement>("[data-travel]").forEach(
    (b) =>
      (b.onclick = () => {
        directVisit(b.dataset.travel as Place);
      }),
  );
}
function dayComplete() {
  if (
    state.day % 7 === 0 &&
    state.ended &&
    !state.flags.includes(
      state.day === 7 ? "week-reflection" : "week-reflection-2",
    )
  )
    weekReflection();
  else summary();
}
function weekReflection() {
  open(
    `<span class="eyebrow">REFLECTION 2 · YOUR FIRST TWO WEEKS</span><h2 id="dialog-title">What changed your options?</h2><p>${reflectionQuestion(state.day)}</p><div class="choices">${["My available time", "Money and housing costs", "Transport, services, or support"].map((t) => `<button data-week-reflection="${t}">${t}</button>`).join("")}</div>`,
    "week-reflection",
  );
  document
    .querySelectorAll<HTMLButtonElement>("[data-week-reflection]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          state.flags.push(
            state.day === 7 ? "week-reflection" : "week-reflection-2",
            "Week reflection: " + b.dataset.weekReflection,
          );
          persist();
          summary();
        }),
    );
}
function summary() {
  const bills = state.ledger.filter(
    (e) =>
      e.label === "Weekly room payment" ||
      e.label === "Weekly household contribution",
  );
  const bill = bills.at(-1);
  const earned = state.ledger.reduce((n, e) => n + Math.max(0, e.money), 0);
  const spent = -state.ledger.reduce((n, e) => n + Math.min(0, e.money), 0);
  const heading = state.completed
    ? "YOUR FIRST TWO WEEKS · COMPLETE"
    : state.day === 7 && state.ended
      ? "YOUR FIRST WEEK · COMPLETE"
      : state.ended
        ? `DAY ${state.day} · COMPLETE`
        : "YOUR DECISION JOURNAL";
  open(
    `<span class="eyebrow">${heading}</span><h2 id="dialog-title">${state.completed ? "Two weeks. Many possible next steps." : "A snapshot of your next chapter."}</h2><p>You are 18. Your choices and the support around you shape what comes next.</p><div class="snapshot"><div><small>SPENDING / SAVINGS / UNPAID BALANCE</small><strong>${dollars(state.money)} / ${dollars(state.savings)} / ${dollars(state.debt)}</strong></div><div><small>HOME</small><strong>${state.housing}</strong></div><div><small>GETTING AROUND</small><strong>${state.transport}</strong></div><div><small>PLANNED INCOME / MONTHLY RENT</small><strong>${dollars(state.income)}/week expected income · ${dollars(state.rent)}/month rent</strong></div><div><small>CONNECTIONS & SKILLS</small><strong>Family support ${state.family} · Friendship ${state.friends} · Skills ${state.skill}</strong></div><div><small>PATHWAY</small><strong>${state.path} · open to change</strong></div></div>${bills.length ? `<div class="callout"><strong>Latest housing payment</strong><p>${dollars(-bill!.money)} from spending · ${dollars(-bill!.savings)} from savings · ${dollars(bill!.debt)} left unpaid.</p><p>That balance is an unpaid bill, not a new loan. There is no failure score.</p></div>` : `<p class="cost-line">Due Friday: ${dollars(housingDue(state))} for housing. Wages arrive only when you work.</p>`}<div class="actions">${state.ended && !state.completed ? '<button id="next-day" class="primary">Start the next day →</button>' : ""}${state.completed ? '<button id="week-reflect" class="secondary">Reflect on this week</button>' : ""}<button id="journal-back" class="secondary">${state.ended ? "Return to neighborhood" : "Keep exploring"}</button><button id="download" class="secondary">Download reflection</button></div><div class="daily-reflection"><strong>Today’s reflection</strong><p>${reflectionQuestion(state.day)}</p></div><h3>One choice to remember</h3>${state.decisions.length ? `<div class="callout"><strong>${state.decisions.at(-1)!.title}</strong><p>You gave up: ${state.decisions.at(-1)!.cost}</p></div>` : "<p>Your first decision will appear here.</p>"}<details><summary>Choices and money history (${state.decisions.length} choices)</summary><p>Recorded cash in: ${dollars(earned)} · cash out: ${dollars(spent)}. Transfers to savings are included in cash out, not total spending.</p>${state.decisions.map((d) => `<article class="journal-entry"><small>DAY ${d.day ?? 1}</small><strong>${d.title}</strong><p>${d.result}</p><small>You gave up: ${d.cost}</small></article>`).join("")}<h3>Money history</h3>${state.ledger.length ? state.ledger.map((e) => `<p class="ledger-row">Day ${e.day} · ${e.label}<br>Spending ${e.money >= 0 ? "+" : ""}${dollars(e.money)} · savings ${e.savings >= 0 ? "+" : ""}${dollars(e.savings)} · unpaid ${dollars(e.debt)}</p>`).join("") : "<p>Older saves begin their money history when continued in this version.</p>"}</details><details><summary>Class reflection · Day ${state.day}</summary><p>${reflectionQuestion(state.day)}</p><p>${state.decisions.filter((d) => (d.day ?? 1) === state.day).at(-1) ? `Consider today’s choice: ${state.decisions.filter((d) => (d.day ?? 1) === state.day).at(-1)!.title}` : "You can reflect on the choices you left open today, too."}</p>${state.flags
      .filter((f) => f.startsWith("Week reflection:"))
      .map((f) => `<p>${f}</p>`)
      .join(
        "",
      )}</details><button id="restart" class="secondary">Explore another story</button>`,
    "summary",
  );
  const next = document.querySelector<HTMLButtonElement>("#next-day");
  if (next) next.onclick = advance;
  const reflect = document.querySelector<HTMLButtonElement>("#week-reflect");
  if (reflect) reflect.onclick = weekReflection;
  $("#journal-back").onclick = close;
  $("#restart").onclick = restart;
  $("#download").onclick = () => {
    const text = [
      `The Butterfly Effect — Day ${state.day} of 14`,
      `Money ${dollars(state.money)}; savings ${dollars(state.savings)}; unpaid ${dollars(state.debt)}`,
      `Housing: ${state.housing}; travel: ${state.transport}`,
      ...state.decisions.map(
        (d) =>
          `Day ${d.day ?? 1}: ${d.title}\n${d.result}\nNext-best alternative: ${d.cost}`,
      ),
      ...state.flags.filter((f) => f.startsWith("Week reflection:")),
      `Day ${state.day} reflection: ${reflectionQuestion(state.day)}`,
    ].join("\n\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = "my-butterfly-effect-reflection.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };
}
function restart() {
  open(
    `<h2 id="dialog-title">Make room for another possibility?</h2><p>Starting a new story replaces the save on this device. You can download your reflection from the decision journal first.</p><button id="confirm-restart" class="primary">Start a new story</button><button id="cancel-restart" class="secondary">Keep this story</button>`,
    "restart",
  );
  $("#confirm-restart").onclick = () => {
    close();
    active = false;
    $("#game-shell").hidden = true;
    $("#title").hidden = false;
    $("#continue").removeAttribute("disabled");
    $("#new").focus();
    narrator.update($("#title").innerText);
  };
  $("#cancel-restart").onclick = close;
}
$("#new").onclick = () => {
  if (load()) {
    open(
      '<h2 id="dialog-title">Begin a fresh story?</h2><p>This replaces the story saved on this device.</p><button id="fresh-confirm" class="primary">Begin new game</button>',
      "confirm",
    );
    $("#fresh-confirm").onclick = () => {
      close();
      start(true);
    };
  } else start(true);
};
$("#continue").onclick = () => start(false);
$("#map").onclick = map;
$("#summary").onclick = summary;
$("#calendar").onclick = calendar;
$("#finish").onclick = () => {
  if (state.ended) {
    summary();
    return;
  }
  open(
    `<h2 id="dialog-title">Call it a day?</h2><p>You made ${dailyCount(state)} commitments today. You don’t have to do everything.</p>${state.day % 7 === 0 ? `<div class="callout"><strong>Housing due now: ${dollars(housingDue(state))}</strong><p>Spending money pays first, then savings. Any amount left becomes an unpaid bill.</p></div>` : "<p>Finish now, or keep exploring until 6 PM.</p>"}<button id="confirm-finish" class="primary">Finish and reflect</button><button id="keep-going" class="secondary">Keep exploring</button>`,
    "finish",
  );
  $("#confirm-finish").onclick = () => {
    state = finishDay(state);
    render();
    dayComplete();
  };
  $("#keep-going").onclick = close;
};
$("#path").onclick = () => {
  open(
    `<h2 id="dialog-title">Your direction can change.</h2><p>Choose what you want to explore next. Your resources and earlier commitments remain; this changes your focus, not your history.</p><div class="choices">${(["College", "Employment", "Trades", "Independent work"] as Path[]).map((p) => `<button data-path="${p}">${p}</button>`).join("")}</div>`,
    "path",
  );
  document.querySelectorAll<HTMLButtonElement>("[data-path]").forEach(
    (b) =>
      (b.onclick = () => {
        state.path = b.dataset.path as Path;
        render();
        close();
      }),
  );
};
$("#help").onclick = () =>
  open(
    `<span class="eyebrow">HOW TO PLAY</span><h2 id="dialog-title">Explore. Choose. Try tomorrow.</h2><p>Walk with WASD or arrows. Press E or Enter near a person, or use Locations.</p><p>Choose one commitment per location each day. Costs appear before you choose.</p><details><summary>Time and saving</summary><p>Walking uses 5 game minutes per 15 seconds. Menu travel takes 5 minutes. Talking is free. Finish the day to move forward; your choices stay saved on this browser.</p></details><details><summary>Money and narration</summary><p>Completed work pays wages. Housing is due Friday. Listen reads the current panel and every choice. Replay repeats it; Stop cancels speech.</p></details><button id="help-done" class="primary">Got it</button>`,
    "help",
  );
dialog.addEventListener("click", (e) => {
  if ((e.target as HTMLElement).id === "help-done") close();
});
$(".brand").onclick = (e) => {
  e.preventDefault();
  if (active) restart();
};
$("#listen").onclick = () => {
  const ok = narrator.read(
    dialog.open
      ? $("#dialog-content").innerText
      : active
        ? $("#game-shell").innerText
        : $("#title").innerText,
  );
  $("#speech-status").textContent = ok
    ? "Narration requested"
    : "Speech is unavailable in this browser";
};
$("#replay").onclick = () => narrator.read();
$("#stop").onclick = () => {
  narrator.stop();
  $("#speech-status").textContent = "Narration stopped";
};
$("#speed").onchange = () => {
  narrator.rate = Number($<HTMLSelectElement>("#speed").value);
  $<HTMLSelectElement>("#panel-speed").value = String(narrator.rate);
  if (window.speechSynthesis?.speaking) narrator.read();
};
$("#auto-read").onchange = () => {
  narrator.enabled = $<HTMLInputElement>("#auto-read").checked;
};
$("#reduce").onchange = () => {
  const reduced = $<HTMLInputElement>("#reduce").checked;
  document.body.classList.toggle("reduced", reduced);
  if (scene) scene.reduced = reduced;
};
document.querySelectorAll<HTMLButtonElement>("[data-dir]").forEach((b) => {
  const end = () => {
    if (scene) scene.touch = { x: 0, y: 0 };
  };
  b.onpointerdown = (e) => {
    if (!scene) return;
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    $("#world canvas").focus();
    scene.touch = {
      x: b.dataset.dir === "left" ? -1 : b.dataset.dir === "right" ? 1 : 0,
      y: b.dataset.dir === "up" ? -1 : b.dataset.dir === "down" ? 1 : 0,
    };
  };
  b.onpointerup = end;
  b.onpointercancel = end;
  b.onlostpointercapture = end;
});
window.addEventListener("blur", () => {
  if (scene) scene.touch = { x: 0, y: 0 };
});
window.addEventListener("beforeunload", () => {
  if (scene && active) {
    Object.assign(state, scene.position());
    persist();
  }
  narrator.stop();
});
narrator.update($("#title").innerText);

$("#panel-listen").onclick = () => {
  $("#panel-speech-status").textContent = narrator.read(
    $("#dialog-content").innerText,
  )
    ? "Narration requested"
    : "Speech is unavailable in this browser";
};
$("#panel-replay").onclick = () =>
  narrator.read($("#dialog-content").innerText);
$("#panel-stop").onclick = () => {
  narrator.stop();
  $("#panel-speech-status").textContent = "Narration stopped";
};
$("#panel-speed").onchange = () => {
  narrator.rate = Number($<HTMLSelectElement>("#panel-speed").value);
  $<HTMLSelectElement>("#speed").value = String(narrator.rate);
  if (window.speechSynthesis?.speaking) narrator.read();
};
