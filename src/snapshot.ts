import { momentLabel } from "./timeline";
import type { State } from "./model";
export function escapeHtml(value: unknown): string {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
const money = (n: number) => `$${n.toLocaleString()}`;
export function snapshotText(s: State): string {
  const last = s.life?.history.at(-1);
  const chosen =
    s.decisions[s.finalReflection?.chosen ?? s.decisions.length - 1];
  return [
    "THE BUTTERFLY EFFECT — LIFE SNAPSHOT AT AGE 22",
    `Direction: ${s.path}`,
    `Learning: ${s.life?.credential || "Experience in progress"}; ${s.life?.study || 0} learning milestones`,
    `Home: ${s.housing}; transport: ${s.transport}`,
    `Spending ${money(s.money)}; savings ${money(s.savings)}; unpaid bills ${money(s.debt)}; loan balance ${money(s.loan)}`,
    `Last modeled take-home income ${money(last?.income || 0)}; housing ${money(last?.rent || 0)}; essentials ${money(last?.essentials || 0)}; tuition ${money(last?.tuition || 0)}; loan payment ${money(last?.payment || 0)}`,
    `Family connection ${s.family}; Alex connection ${s.alex}; Jordan trust ${s.jordan}`,
    `Modeled months completed: ${s.life?.history.length || 0}. Intervening months were not charged or credited.`,
    chosen
      ? `An important choice: ${chosen.title}\nNext-best alternative given up: ${chosen.cost}`
      : "",
    "EARLIER CHOICES AND CHANGING OPTIONS",
    ...s.decisions
      .filter(
        (d) =>
          d.choiceId?.startsWith("life-") ||
          [
            "college-training",
            "home-help",
            "work-project",
            "apartment-room",
          ].includes(d.choiceId || ""),
      )
      .map(
        (d) =>
          `${momentLabel(d.day ?? 1)}: ${d.title}\n${d.result}\nOpportunity cost: ${d.cost}`,
      ),
    "CLASS REFLECTION",
    `What was scarce? ${s.finalReflection?.scarcity || ""}`,
    `What was your next-best alternative? ${s.finalReflection?.alternative || ""}`,
    `What support or barrier changed your options? ${s.finalReflection?.context || ""}`,
    "This is a fictional, representative-month classroom model. There is no success/failure score.",
  ].join("\n\n");
}
export function snapshotHtml(s: State): string {
  const last = s.life?.history.at(-1);
  const e = escapeHtml,
    chosenIndex =
      s.finalReflection?.chosen ?? Math.max(0, s.decisions.length - 1),
    chosen = s.decisions[chosenIndex];
  const primary = s.decisions.filter(
    (d) =>
      d.choiceId?.startsWith("life-") &&
      [
        "life-college",
        "life-employment",
        "life-trades",
        "life-independent",
        "life-protect-study",
        "life-long-hours",
        "life-studio",
        "life-family",
        "life-transit",
        "life-car",
        "life-care",
        "life-care-network",
        "life-care-later",
        "life-promotion",
        "life-placement",
        "life-business",
        "life-keep-job",
        "life-finish-learning",
        "life-switch",
        "life-experience",
      ].includes(d.choiceId),
  );
  return `<span class="eyebrow">CHAPTER 4 · AGE 22</span><h2 id="dialog-title">Your life is still unfolding.</h2><p>Your choices, available opportunities, and people around you shaped this chapter. There is no success/failure score.</p><div class="snapshot"><div><small>DIRECTION</small><strong>${e(s.path)}</strong></div><div><small>LEARNING & EXPERIENCE</small><strong>${e(s.life?.credential || "Experience in progress")}</strong></div><div><small>HOME</small><strong>${e(s.housing)}</strong></div><div><small>GETTING AROUND</small><strong>${e(s.transport)}</strong></div><div><small>CASH / SAVINGS</small><strong>${money(s.money)} / ${money(s.savings)}</strong></div><div><small>UNPAID BILLS / LOANS</small><strong>${money(s.debt)} / ${money(s.loan)}</strong></div><div><small>LAST MODELED MONTH · TAKE-HOME</small><strong>${money(last?.income || 0)}</strong></div><div><small>LAST MODELED MONTH · TOTAL COSTS</small><strong>${money((last?.rent || 0) + (last?.essentials || 0) + (last?.tuition || 0) + (last?.payment || 0))}</strong></div></div><div class="callout"><strong>People in your story</strong><p>${s.family > 0 ? "You made space for Aunt Elena through changing responsibilities." : "Family responsibilities stayed part of the choices available to you."} ${s.alex >= 2 ? "You built a connection with Alex that could make practical support possible." : "Alex remained someone you could reconnect with."} ${s.jordan >= 2 ? "Trust with Jordan opened ways to share housing responsibilities." : "Housing availability shaped how much space and privacy you could choose."}</p></div><h3>A significant opportunity cost</h3><label for="snapshot-choice">Choose the decision you want to reflect on</label><select id="snapshot-choice">${s.decisions.map((d, i) => `<option value="${i}" ${i === chosenIndex ? "selected" : ""}>${e(d.title)}</option>`).join("")}</select><p id="chosen-opportunity">${chosen ? `You chose <strong>${e(chosen.title)}</strong>. Your next-best alternative was: ${e(chosen.cost)}` : "Your decisions are recorded in the journal."}</p><details><summary>Your decisions made ripples</summary>${primary.map((d) => `<article class="journal-entry"><small>${momentLabel(d.day ?? 1)}</small><strong>${e(d.title)}</strong><p>${e(d.result)}</p><small>You gave up: ${e(d.cost)}</small></article>`).join("")}<p>${s.flags.includes("attended") ? "An early reserved workshop became later experience." : ""} ${s.flags.includes("aid-ready") || s.flags.includes("scholarship") ? "Earlier aid preparation changed what education could cost." : ""} ${s.flags.includes("care-delayed") ? "Limited clinic access meant waiting as well as lost or kept wages." : ""}</p></details><details><summary>What the financial model includes</summary><p>${s.life?.history.length || 0} representative months were modeled. Each included take-home income, housing, essentials, tuition, and any affordable planned loan payment. Months between moments were not charged or credited. Loans accrued 0.5% interest per modeled month (illustrative 6% APR).</p></details><h3>A reflection to take to class</h3><p>Use your own words. Do not include names or personal information. Answers stay on this device.</p><label for="reflect-scarcity">What resource was scarce in your chosen decision?</label><textarea id="reflect-scarcity" maxlength="600" rows="2">${e(s.finalReflection?.scarcity || "")}</textarea><label for="reflect-alternative">What was the next-best alternative you gave up?</label><textarea id="reflect-alternative" maxlength="600" rows="2">${e(s.finalReflection?.alternative || "")}</textarea><label for="reflect-context">What support or barrier changed your options?</label><textarea id="reflect-context" maxlength="600" rows="2">${e(s.finalReflection?.context || "")}</textarea><p id="reflection-status" role="status">Reflection saves as you write.</p><div class="actions"><button id="snapshot-download" class="primary">Download Life Snapshot</button><button id="snapshot-print" class="secondary">Print snapshot</button><button id="snapshot-journal" class="secondary">Decision journal</button><button id="snapshot-restart" class="secondary">Explore another story</button></div>`;
}
