import { LAST_DAY, stageForDay } from "./timeline";
import { startingLife, settleMonth } from "./finance";
export type Place =
  | "home"
  | "work"
  | "college"
  | "bus"
  | "apartment"
  | "lowrider"
  | "mural"
  | "bosque";
export type Path = "College" | "Employment" | "Trades" | "Independent work";
export interface RecordEntry {
  day?: number;
  choiceId?: string;
  place: Place;
  title: string;
  cost: string;
  result: string;
}
export interface LedgerEntry {
  day: number;
  label: string;
  money: number;
  savings: number;
  debt: number;
}
export interface BudgetMonth {
  day: number;
  age: number;
  income: number;
  rent: number;
  essentials: number;
  tuition: number;
  payment: number;
  interest: number;
  cashAfter: number;
  savingsUsed: number;
  unpaid: number;
}
export interface LifeProfile {
  familyContribution?: number;
  variableIncome?: boolean;
  monthlyIncome: number;
  essentials: number;
  tuition: number;
  payment: number;
  study: number;
  credential: string;
  history: BudgetMonth[];
}
export interface FinalReflection {
  chosen: number;
  scarcity: string;
  alternative: string;
  context: string;
}
export interface State {
  loan: number;
  life: LifeProfile | null;
  finalReflection?: FinalReflection;
  seed: number;
  meals: number;
  parts: number;
  wellbeing: number;
  alex: number;
  jordan: number;
  calendarChecked: number[];
  day: number;
  completed: boolean;
  ledger: LedgerEntry[];
  version: 1;
  path: Path;
  money: number;
  savings: number;
  debt: number;
  minutes: number;
  skill: number;
  family: number;
  friends: number;
  income: number;
  rent: number;
  housing: string;
  transport: string;
  returnTransport?: string;
  decisions: RecordEntry[];
  visited: Place[];
  flags: string[];
  x: number;
  y: number;
  walking: number;
  ended: boolean;
}
export const SAVE_KEY = "butterfly-effect-v1";
export function initial(path: Path): State {
  return {
    loan: 0,
    life: null,
    seed: Math.floor(Math.random() * 1000000),
    meals: 0,
    parts: 0,
    wellbeing: 2,
    alex: 0,
    jordan: 0,
    calendarChecked: [],
    version: 1,
    day: 1,
    completed: false,
    ledger: [],
    path,
    money: path === "Employment" ? 480 : 320,
    savings: 150,
    debt: 0,
    minutes: 9 * 60,
    skill: path === "Trades" ? 1 : 0,
    family: 0,
    friends: 0,
    income: 0,
    rent: 0,
    housing: "With Aunt Elena",
    transport: "Walking",
    decisions: [],
    visited: [],
    flags: [],
    x: 390,
    y: 520,
    walking: 0,
    ended: false,
  };
}
export function clock(minutes: number) {
  const hour = Math.floor(minutes / 60);
  return `${hour > 12 ? hour - 12 : hour}:${String(Math.floor(minutes % 60)).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}
export interface Choice {
  id: string;
  label: string;
  detail: string;
  time: number;
  money: number;
  nextBest: string;
  result: string;
  skill?: number;
  family?: number;
  friends?: number;
  debt?: number;
  savings?: number;
  income?: number;
  rent?: number;
  housing?: string;
  transport?: string;
  flag?: string;
  requires?: string;
  deadline?: number;
  incomeSet?: number;
  upfront?: number;
  meals?: number;
  mealCost?: number;
  parts?: number;
  partsCost?: number;
  wellbeing?: number;
  alex?: number;
  minAlex?: number;
  minJordan?: number;
  minSkill?: number;
  requiresLabel?: string;
  life?: Partial<Omit<LifeProfile, "history">>;
  path?: Path;
  loan?: number;
  loanPaid?: number;
  minStudy?: number;
  main?: boolean;
}
export function unavailable(s: State, c: Choice): string | null {
  const stage = stageForDay(s.day);
  if (stage && !todayDecision(s, stage.required) && !c.main)
    return `Make the main decision at ${stage.required === "college" ? "Mesa Training Center" : stage.required === "work" ? "Rivera Market" : stage.required === "apartment" ? "Juniper Apartments" : stage.required === "home" ? "Family home" : stage.required === "bus" ? "the bus stop" : "the bosque"} first. Travel time is reserved until then.`;
  if (c.minStudy && (s.life?.study || 0) < c.minStudy)
    return `Needs ${c.minStudy} learning milestones; you have ${s.life?.study || 0}.`;
  if (c.minAlex && s.alex < c.minAlex)
    return `Spend time with Alex first (connection ${s.alex}/${c.minAlex}).`;
  if (c.minJordan && s.jordan < c.minJordan)
    return `Build trust with Jordan first (${s.jordan}/${c.minJordan}).`;
  if (c.minSkill && s.skill < c.minSkill)
    return `Needs ${c.minSkill} skill steps; you have ${s.skill}.`;
  if (c.mealCost && s.meals < c.mealCost)
    return `Needs ${c.mealCost} packed meal; groceries or the pantry can help.`;
  if (c.partsCost && s.parts < c.partsCost)
    return `Needs ${c.partsCost} repair part; find one at the lowrider or co-op.`;
  if (s.ended) return "This day has ended.";
  if (s.minutes + c.time > 18 * 60) return "Not enough time before 6 PM.";
  if (c.upfront && s.money < c.upfront)
    return `Needs $${c.upfront} for supplies before starting.`;
  if (s.money + c.money < 0) return "Not enough money available.";
  if (c.deadline && s.minutes + c.time > c.deadline)
    return "This opportunity has closed for today.";
  if (c.requires && !s.flags.includes(c.requires))
    return c.requiresLabel || "Requires the training reservation.";
  return null;
}
export function decide(s: State, place: Place, c: Choice): State {
  if (todayDecision(s, place) || unavailable(s, c)) return s;
  return {
    ...s,
    minutes: s.minutes + c.time,
    path: c.path ?? s.path,
    loan: s.loan + (c.loan || 0) - (c.loanPaid || 0),
    life: s.life ? { ...s.life, ...c.life } : null,
    meals: s.meals + (c.meals || 0) - (c.mealCost || 0),
    parts: s.parts + (c.parts || 0) - (c.partsCost || 0),
    wellbeing: Math.max(0, Math.min(5, s.wellbeing + (c.wellbeing || 0))),
    alex: s.alex + (c.alex || 0),
    jordan: s.jordan + (place === "apartment" ? c.friends || 0 : 0),
    money: s.money + c.money,
    savings: s.savings + (c.savings || 0),
    debt: s.debt + (c.debt || 0),
    skill: s.skill + (c.skill || 0),
    family: s.family + (c.family || 0),
    friends: s.friends + (c.friends || 0),
    income: c.incomeSet ?? s.income + (c.income || 0),
    rent: c.rent ?? s.rent,
    housing: c.housing ?? s.housing,
    transport: c.transport ?? s.transport,
    returnTransport:
      c.transport && !["Shared ride", "Family ride"].includes(c.transport)
        ? undefined
        : s.day === 4 &&
            ["Shared ride", "Family ride"].includes(c.transport || "")
          ? (s.returnTransport ?? s.transport)
          : s.returnTransport,
    flags: c.flag ? [...new Set([...s.flags, c.flag])] : s.flags,
    ledger: [
      ...s.ledger,
      {
        day: s.day,
        label: c.label,
        money: c.money,
        savings: c.savings || 0,
        debt: c.debt || 0,
      },
    ],
    decisions: [
      ...s.decisions,
      {
        day: s.day,
        choiceId: c.id,
        place,
        title: c.label,
        cost: c.nextBest,
        result: c.result,
      },
    ],
  };
}
export function save(s: State): boolean {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
}
export function load(): State | null {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    if (
      !s ||
      s.version !== 1 ||
      !["College", "Employment", "Trades", "Independent work"].includes(s.path)
    )
      return null;
    for (const key of [
      "money",
      "savings",
      "debt",
      "minutes",
      "skill",
      "family",
      "friends",
      "income",
      "rent",
      "x",
      "y",
      "walking",
    ])
      if (!Number.isFinite(s[key])) return null;
    for (const key of ["flags", "decisions", "visited"])
      if (!Array.isArray(s[key])) return null;
    if (
      typeof s.housing !== "string" ||
      typeof s.transport !== "string" ||
      typeof s.ended !== "boolean"
    )
      return null;
    // Preserve graduation-weekend saves; no student loses their earlier choices.
    s.loan ??= 0;
    s.life ??= null;
    if (!Number.isFinite(s.loan) || s.loan < 0) return null;
    s.seed ??= 104729;
    s.meals ??= 0;
    s.parts ??= 0;
    s.wellbeing ??= 2;
    s.alex ??= s.decisions.filter(
      (d: RecordEntry) =>
        d.place === "bus" && d.title === "Spend time with Alex",
    ).length;
    s.jordan ??= s.decisions.filter(
      (d: RecordEntry) => d.place === "apartment",
    ).length;
    s.calendarChecked ??= [];
    if (
      !["seed", "meals", "parts", "wellbeing", "alex", "jordan"].every(
        (k) => Number.isFinite(s[k]) && s[k] >= 0,
      ) ||
      !Array.isArray(s.calendarChecked) ||
      !s.calendarChecked.every(
        (d: number) => Number.isInteger(d) && d >= 1 && d <= LAST_DAY,
      )
    )
      return null;
    s.day ??= 1;
    s.completed ??= false;
    s.ledger ??= [];
    if (
      !Number.isInteger(s.day) ||
      s.day < 1 ||
      s.day > LAST_DAY ||
      typeof s.completed !== "boolean" ||
      !Array.isArray(s.ledger)
    )
      return null;
    if (
      s.minutes < 540 ||
      s.minutes > 1080 ||
      s.money < 0 ||
      s.savings < 0 ||
      s.debt < 0
    )
      return null;
    if (
      !s.decisions.every(
        (d: RecordEntry) =>
          d &&
          [
            "home",
            "work",
            "college",
            "bus",
            "apartment",
            "lowrider",
            "mural",
            "bosque",
          ].includes(d.place) &&
          typeof d.title === "string" &&
          typeof d.cost === "string" &&
          typeof d.result === "string" &&
          (d.day === undefined ||
            (Number.isInteger(d.day) && d.day >= 1 && d.day <= s.day)),
      )
    )
      return null;
    if (!s.flags.every((f: unknown) => typeof f === "string")) return null;
    if (
      !s.ledger.every(
        (e: LedgerEntry) =>
          e &&
          Number.isInteger(e.day) &&
          e.day >= 1 &&
          e.day <= s.day &&
          typeof e.label === "string" &&
          [e.money, e.savings, e.debt].every(Number.isFinite),
      )
    )
      return null;
    if (s.day > 14) {
      if (
        !s.life ||
        !["monthlyIncome", "essentials", "tuition", "payment", "study"].every(
          (k) => Number.isFinite(s.life[k]) && s.life[k] >= 0,
        ) ||
        (s.life.familyContribution !== undefined &&
          (!Number.isFinite(s.life.familyContribution) ||
            s.life.familyContribution < 0)) ||
        typeof s.life.credential !== "string" ||
        !Array.isArray(s.life.history)
      )
        return null;
      if (
        !s.life.history.every(
          (m: BudgetMonth) =>
            m &&
            Number.isInteger(m.day) &&
            m.day >= 15 &&
            m.day <= s.day &&
            [
              "age",
              "income",
              "rent",
              "essentials",
              "tuition",
              "payment",
              "interest",
              "cashAfter",
              "savingsUsed",
              "unpaid",
            ].every(
              (k) =>
                Number.isFinite((m as unknown as Record<string, number>)[k]) &&
                (m as unknown as Record<string, number>)[k] >= 0,
            ),
        )
      )
        return null;
    }
    if (
      s.finalReflection &&
      (!Number.isInteger(s.finalReflection.chosen) ||
        s.finalReflection.chosen < 0 ||
        s.finalReflection.chosen >= s.decisions.length ||
        !["scarcity", "alternative", "context"].every(
          (k) =>
            typeof s.finalReflection[k] === "string" &&
            s.finalReflection[k].length <= 600,
        ))
    )
      return null;
    if ((s.day === 7 || s.day === 14) && s.completed) s.completed = false;
    return s as State;
  } catch {
    return null;
  }
}

export const DAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];
export function todayDecision(s: State, place: Place) {
  return s.decisions.find((d) => (d.day ?? 1) === s.day && d.place === place);
}
export function dailyCount(s: State) {
  return s.decisions.filter(
    (d) =>
      (d.day ?? 1) === s.day &&
      ["home", "work", "college", "bus", "apartment"].includes(d.place),
  ).length;
}
export function housingDue(s: State) {
  return s.rent > 0 ? Math.ceil(s.rent / 4) : 40;
}
export function finishDay(s: State): State {
  if (s.ended) return s;
  const stage = stageForDay(s.day);
  if (stage && !todayDecision(s, stage.required)) return s;
  const next = { ...s, ended: true, completed: s.day === LAST_DAY };
  if (stage) return settleMonth(next);
  if (s.day % 7 !== 0) return next;
  // Weekly housing is charged once. Any shortfall is an unpaid bill, not a fabricated loan.
  const due = housingDue(s),
    cash = Math.min(s.money, due),
    reserve = Math.min(s.savings, due - cash),
    gap = due - cash - reserve;
  return {
    ...next,
    money: s.money - cash,
    savings: s.savings - reserve,
    debt: s.debt + gap,
    ledger: [
      ...s.ledger,
      {
        day: s.day,
        label:
          s.rent > 0 ? "Weekly room payment" : "Weekly household contribution",
        money: -cash,
        savings: -reserve,
        debt: gap,
      },
    ],
  };
}
export function nextDay(s: State): State {
  if (!s.ended || s.completed || s.day >= LAST_DAY) return s;
  return {
    ...s,
    day: s.day + 1,
    life: s.day === 14 ? startingLife(s) : s.life,
    meals: s.day >= 14 ? 0 : s.meals,
    transport:
      s.day === 14 && s.transport === "Borrowed bicycle"
        ? "City bus"
        : (s.returnTransport ?? s.transport),
    returnTransport: undefined,
    ended: false,
    minutes: 540,
    walking: 0,
    x: 390,
    y: 520,
  };
}
