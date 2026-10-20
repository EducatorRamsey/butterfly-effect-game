export type Place = "home" | "work" | "college" | "bus" | "apartment";
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
export interface State {
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
}
export function unavailable(s: State, c: Choice): string | null {
  if (s.ended) return "This day has ended.";
  if (s.minutes + c.time > 18 * 60) return "Not enough time before 6 PM.";
  if (c.upfront && s.money < c.upfront)
    return `Needs $${c.upfront} for supplies before starting.`;
  if (s.money + c.money < 0) return "Not enough money available.";
  if (c.deadline && s.minutes + c.time > c.deadline)
    return "This opportunity has closed for today.";
  if (c.requires && !s.flags.includes(c.requires))
    return "Requires the training reservation.";
  return null;
}
export function decide(s: State, place: Place, c: Choice): State {
  if (todayDecision(s, place) || unavailable(s, c)) return s;
  return {
    ...s,
    minutes: s.minutes + c.time,
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
      s.day === 4 && ["Shared ride", "Family ride"].includes(c.transport || "")
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
    s.day ??= 1;
    s.completed ??= false;
    s.ledger ??= [];
    if (
      !Number.isInteger(s.day) ||
      s.day < 1 ||
      s.day > 7 ||
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
          ["home", "work", "college", "bus", "apartment"].includes(d.place) &&
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
  return s.decisions.filter((d) => (d.day ?? 1) === s.day).length;
}
export function housingDue(s: State) {
  return s.rent > 0 ? 125 : 40;
}
export function finishDay(s: State): State {
  if (s.ended) return s;
  const next = { ...s, ended: true, completed: s.day === 7 };
  if (s.day !== 7) return next;
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
        day: 7,
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
  if (!s.ended || s.completed || s.day >= 7) return s;
  return {
    ...s,
    day: s.day + 1,
    transport: s.returnTransport ?? s.transport,
    returnTransport: undefined,
    ended: false,
    minutes: 540,
    walking: 0,
    x: 390,
    y: 520,
  };
}
