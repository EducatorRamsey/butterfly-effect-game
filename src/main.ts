import Phaser from "phaser";
import "./style.css";
import {
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
<header class="masthead"><a class="brand" href="#" aria-label="The Butterfly Effect, title screen"><span class="butterfly">✦</span><span>THE BUTTERFLY EFFECT<small>THE COST OF EVERY CHOICE</small></span></a><span class="edition">A LIFE IN THE MAKING <i>·</i> CHAPTER 01</span><button id="help" class="quiet">How to play</button></header>
<main id="game-shell" hidden>
<section class="topline"><div><span class="eyebrow">ALBUQUERQUE, NEW MEXICO</span><h1>Your next chapter starts here.</h1><p>Graduation weekend. A neighborhood full of possibilities.</p></div><div class="day"><span>SATURDAY · AGE 18</span><strong id="clock"></strong><small>Today ends at 6:00 PM</small></div></section>
<section class="dashboard" aria-label="Your resources" aria-live="polite"><div><span>SPENDING MONEY</span><strong id="money"></strong></div><div><span>SAVINGS / DEBT</span><strong id="savings"></strong></div><div><span>TIME LEFT</span><strong id="time-left"></strong></div><div><span>SKILLS</span><strong id="skill"></strong></div><div><span>YOUR PATH</span><button id="path" class="path-button"></button></div></section>
<section class="play-layout"><div class="world-card"><div class="world-top"><span><i class="live-dot"></i> JUNIPER NEIGHBORHOOD</span><span>Explore. Connect. Choose.</span></div><div id="world"></div><div class="world-bottom"><span id="prompt" role="status">Explore at your pace · Locations menu also works</span><button id="map" class="small-button">Locations →</button></div><div class="touch" aria-label="Touch movement"><button data-dir="up" aria-label="Move up">↑</button><div><button data-dir="left" aria-label="Move left">←</button><button data-dir="down" aria-label="Move down">↓</button><button data-dir="right" aria-label="Move right">→</button></div></div></div>
<aside class="sidebar"><span class="eyebrow">A LITTLE DIRECTION</span><h2>There’s no single<br>right way forward.</h2><p>You have limited time today. Discover what matters to you, and what each choice leaves behind.</p><div class="rule"></div><h3>YOUR NEIGHBORHOOD</h3><nav id="location-list" aria-label="Visit a location"></nav><div class="note"><span>→ THE RIPPLE EFFECT</span><p id="ripple">Small choices can open unexpected doors. Start a conversation.</p></div><button id="summary" class="wide secondary">Decision journal <span id="count">0 / 5</span></button><button id="finish" class="wide primary">Finish the day →</button></aside></section>
<footer class="game-footer"><span><kbd>W A S D</kbd> / <kbd>↑ ↓ ← →</kbd> Move <b>·</b> <kbd>E</kbd> Talk <b>·</b> Click a building to visit</span><span id="save-status" role="status">Progress saves on this device</span></footer></main>
<section id="title" class="title-screen"><div class="title-art" aria-hidden="true"><div class="sun"></div><div class="mountain mountain-back"></div><div class="mountain"></div><span class="art-caption">35.0844° N &nbsp; 106.6504° W<br>ALBUQUERQUE, NEW MEXICO</span><div class="adobe a1"></div><div class="adobe a2"></div><div class="desert-road"></div><div class="desert-plant">✺</div></div><div class="title-copy"><span class="eyebrow">YOUR LIFE. YOUR CHOICES. THEIR RIPPLE EFFECTS.</span><h1>The Butterfly<br><em>Effect.</em></h1><p class="subtitle">The cost of every choice</p><p>School is over. What comes next is yours to explore.</p><p>Walk your neighborhood, meet the people in your corner, and make room for what matters—with the time and resources you have.</p><label for="starting-path">Where are you thinking of starting?</label><select id="starting-path"><option>College</option><option>Employment</option><option>Trades</option><option>Independent work</option></select><p class="fine">A starting point, not a permanent track. You can change direction.</p><div class="title-actions"><button id="new" class="primary">Begin your story →</button><button id="continue" class="secondary" ${load() ? "" : "disabled"}>Continue saved story</button></div><span class="fine">CHAPTER 01 · GRADUATION WEEKEND · A PLAYABLE FIRST CHAPTER</span></div></section>
<section class="access-bar" aria-label="Narration and accessibility"><span>READ IT YOUR WAY</span><button id="listen">Listen</button><button id="replay">Replay</button><button id="stop">Stop</button><label>Speed <select id="speed" aria-label="Narration speed"><option value="0.7">0.7×</option><option value="0.85">0.85×</option><option value="1" selected>1×</option><option value="1.15">1.15×</option><option value="1.3">1.3×</option></select></label><label class="check"><input id="auto-read" type="checkbox"> Auto-narrate</label><label class="check"><input id="reduce" type="checkbox"> Reduce motion</label><span id="speech-status" role="status"></span></section>
<dialog id="dialog" aria-labelledby="dialog-title"><div id="dialog-content"></div><div class="panel-narration" aria-label="Dialogue narration"><button id="panel-listen" aria-label="Listen to this panel">Listen</button><button id="panel-replay" aria-label="Replay this panel">Replay</button><button id="panel-stop" aria-label="Stop panel narration">Stop</button><label>Speed <select id="panel-speed" aria-label="Panel narration speed"><option value="0.7">0.7×</option><option value="0.85">0.85×</option><option value="1" selected>1×</option><option value="1.15">1.15×</option><option value="1.3">1.3×</option></select></label><span id="panel-speech-status" role="status"></span></div><button id="close-dialog" class="close" aria-label="Close dialogue">×</button></dialog>`;
const dialog = $<HTMLDialogElement>("#dialog");
function render() {
  $("#clock").textContent = clock(state.minutes);
  $("#money").textContent = dollars(state.money);
  $("#savings").textContent =
    `${dollars(state.savings)} / ${dollars(state.debt)}`;
  $("#time-left").textContent =
    `${Math.floor((1080 - state.minutes) / 60)}h ${Math.floor((1080 - state.minutes) % 60)}m`;
  $("#skill").textContent =
    `${state.skill} ${state.skill === 1 ? "step" : "steps"} forward`;
  $("#path").textContent = state.path + " →";
  $("#count").textContent = `${state.decisions.length} / 5`;
  $("#location-list").innerHTML = locations
    .map(
      (l, i) =>
        `<button data-place="${l.id}"><span class="location-number">0${i + 1}</span><span>${l.name}<small>${l.person}</small></span><span class="visit-status">${state.decisions.some((d) => d.place === l.id) ? "✓" : "→"}</span></button>`,
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
    const p = scene.children;
    if (p.list.length) {
      const player = p.list.find(
        (c) => c instanceof Phaser.Physics.Arcade.Sprite,
      ) as Phaser.Physics.Arcade.Sprite;
      player?.setPosition(state.x, state.y);
    }
  }
  render();
  if (state.ended) summary();
  else if (fresh) intro();
}
function boot() {
  scene = new Neighborhood(
    {
      enter: (id) => (state.ended ? summary() : visit(id)),
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
          state.ended = true;
          render();
          summary();
        }
      },
      prompt: (t) => ($("#prompt").textContent = t),
    },
    state.x,
    state.y,
  );
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
    `<span class="eyebrow">SATURDAY · 9:00 AM</span><h2 id="dialog-title">A whole day. A few real limits.</h2><p>You’re 18, and graduation was yesterday. You have ${dollars(state.money)} to spend, ${dollars(state.savings)} saved, and nine hours before evening.</p><div class="callout"><strong>Scarcity means you can’t do everything.</strong><p>Time, money, seats in a class, and shared tools are limited. That’s true for everyone, though people have different resources.</p></div><p>If you spend two hours helping Elena, you can’t use those same hours for a scholarship. The next-best option you give up is your <strong>opportunity cost</strong>.</p><p>Walk with WASD or arrows. Press E or Enter near a person. Or select a location in the menu. Walking costs 5 game minutes per 15 seconds of movement; menu travel costs 5 minutes.</p><button id="intro-next" class="primary">Explore my neighborhood →</button>`,
    "intro",
  );
  $("#intro-next").onclick = close;
}
function visit(id: Place) {
  if (!active) return;
  const l = locations.find((l) => l.id === id)!;
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
  const done = state.decisions.find((d) => d.place === l.id);
  const choices = choicesFor(l, state);
  open(
    `<div class="conversation-head"><div class="portrait" style="--portrait:#${l.color.toString(16)}" aria-hidden="true"><span class="portrait-hair"></span><span class="portrait-face">${l.initials}</span><span class="portrait-shirt"></span></div><div><span class="eyebrow">${l.name}</span><h2 id="dialog-title">${l.person}</h2><span class="muted">${l.role}</span></div></div><p class="dialogue-text">${done ? followup(l, state) : l.text}</p><div class="scarcity">◇ ${l.scarcity}</div>${
      done
        ? `<div class="callout"><strong>Your choice: ${done.title}</strong><p>Next-best alternative given up: ${done.cost}</p></div><button id="back-world" class="primary">Back to the neighborhood →</button>`
        : state.ended
          ? "<p>The day has ended. Start another story to explore other choices.</p>"
          : `<p class="choice-hint">Choose one. You can leave and think before committing.</p><div class="choices">${choices
              .map((c, i) => {
                const reason = unavailable(state, c);
                return `<button data-choice="${i}" ${reason ? "disabled" : ""}><strong>${c.label}</strong><span>${c.detail}</span><small>${reason || "Next-best alternative: " + c.nextBest}</small></button>`;
              })
              .join("")}</div>`
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
          `<span class="eyebrow">A CHOICE. A RIPPLE.</span><h2 id="dialog-title">${c.label}</h2><p>${c.result}</p><div class="callout"><strong>What changed</strong><p>${c.time} minutes used · ${c.money >= 0 ? "+" : ""}${dollars(c.money)} spending money${c.savings ? " · +$60 savings" : ""}${c.skill ? " · +" + c.skill + " skill" : ""}${c.income ? " · $" + c.income + "/week expected income" : ""}${c.rent ? " · $" + c.rent + "/month rent" : ""}</p><strong>Your opportunity cost</strong><p>${c.nextBest}</p></div><p class="muted">These are trade-offs, not a score. Housing, schedules, and access shape what is possible.</p><button id="result-next" class="primary">Continue →</button>`,
          "result",
        );
        $("#result-next").onclick = () => {
          if (state.minutes >= 1080) {
            state.ended = true;
            render();
            summary();
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
    `<span class="eyebrow">ACCESSIBLE NEIGHBORHOOD MAP</span><h2 id="dialog-title">Where would you like to go?</h2><p>Each visit travels directly to the entrance and uses 5 minutes. Walking is always available too.</p><div class="choices">${locations.map((l) => `<button data-travel="${l.id}"><strong>${l.name}</strong><span>Talk to ${l.person} · ${state.decisions.some((d) => d.place === l.id) ? "choice recorded" : "opportunity to explore"}</span></button>`).join("")}</div>`,
    "map",
  );
  document.querySelectorAll<HTMLButtonElement>("[data-travel]").forEach(
    (b) =>
      (b.onclick = () => {
        directVisit(b.dataset.travel as Place);
      }),
  );
}
function summary() {
  open(
    `<span class="eyebrow">${state.ended ? "GRADUATION WEEKEND · CHAPTER COMPLETE" : "YOUR DECISION JOURNAL"}</span><h2 id="dialog-title">A snapshot of your next chapter.</h2><p>You are 18. Your story is still taking shape. This first chapter does not simulate age 22 yet.</p><div class="snapshot"><div><small>MONEY / SAVINGS / DEBT</small><strong>${dollars(state.money)} / ${dollars(state.savings)} / ${dollars(state.debt)}</strong></div><div><small>HOME</small><strong>${state.housing}</strong></div><div><small>GETTING AROUND</small><strong>${state.transport}</strong></div><div><small>FUTURE COMMITMENTS</small><strong>${dollars(state.income)}/week expected income · ${dollars(state.rent)}/month rent</strong></div><div><small>CONNECTIONS & SKILLS</small><strong>Family support ${state.family} · Friendship ${state.friends} · Skills ${state.skill}</strong></div><div><small>PATHWAY</small><strong>${state.path} · open to change</strong></div></div><p class="fine">Weekly income and monthly rent are future estimates, not paid during this day. Savings transfers move existing money; deposits are spent. No loan has been taken, so debt stays at $0.</p><h3>Choices that made ripples</h3>${state.decisions.length ? state.decisions.map((d) => `<article class="journal-entry"><strong>${d.title}</strong><p>${d.result}</p><small>Next-best alternative given up: ${d.cost}</small></article>`).join("") : "<p>Your journal is waiting for your first decision.</p>"}<div class="callout"><strong>Take this question to class</strong><p>Choose one decision. What scarce resource shaped it? What was your next-best alternative? How might a different bus schedule, income, or support network change your options?</p></div><div class="actions"><button id="journal-back" class="secondary">${state.ended ? "Return to neighborhood" : "Keep exploring"}</button><button id="restart" class="primary">Explore another story</button><button id="download" class="secondary">Download reflection</button></div>`,
    "summary",
  );
  $("#journal-back").onclick = close;
  $("#restart").onclick = restart;
  $("#download").onclick = () => {
    const text = $("#dialog-content").innerText;
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
$("#finish").onclick = () => {
  open(
    `<h2 id="dialog-title">Call it a day?</h2><p>You made ${state.decisions.length} of five possible commitments. You don’t need to do everything. Finish now to reflect, or keep exploring until 6 PM.</p><button id="confirm-finish" class="primary">Finish and reflect</button><button id="keep-going" class="secondary">Keep exploring</button>`,
    "finish",
  );
  $("#confirm-finish").onclick = () => {
    state.ended = true;
    render();
    summary();
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
    `<span class="eyebrow">HOW TO PLAY</span><h2 id="dialog-title">A neighborhood of possibilities.</h2><p>Move with WASD, arrows, or the on-screen directional buttons. Near an entrance, press E or Enter. Click a building or use Locations to travel directly. Sidebar locations also travel directly.</p><p>Walking uses 5 game minutes per 15 seconds of movement. Direct travel takes 5 minutes. Talking is free; commitments use the time and money shown. The day ends at 6 PM.</p><p>Each location offers one commitment for today. Choices are final for this story. Keep track in your decision journal and finish the day whenever you are ready.</p><p>Listen reads all current dialogue and choices. Replay repeats it; Stop cancels speech. Auto-narrate reads each new panel. Your browser supplies available voices.</p><p>Saves stay in this browser on this device. No accounts, names, or student information are collected.</p><button id="help-done" class="primary">Got it</button>`,
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
