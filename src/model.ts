export type Place = "home" | "work" | "college" | "bus" | "apartment";
export type Path = "College" | "Employment" | "Trades" | "Independent work";
export interface RecordEntry {
  place: Place;
  title: string;
  cost: string;
  result: string;
}
export interface State {
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
}
export function unavailable(s: State, c: Choice): string | null {
  if (s.ended) return "This day has ended.";
  if (s.decisions.some((d) => d.place === "home") && c.id.startsWith("home"))
    return "You already made this commitment.";
  if (s.minutes + c.time > 18 * 60) return "Not enough time before 6 PM.";
  if (s.money + c.money < 0) return "Not enough money available.";
  if (c.deadline && s.minutes + c.time > c.deadline)
    return "This opportunity has closed for today.";
  if (c.requires && !s.flags.includes(c.requires))
    return "Requires the training reservation.";
  return null;
}
export function decide(s: State, place: Place, c: Choice): State {
  if (s.decisions.some((d) => d.place === place) || unavailable(s, c)) return s;
  return {
    ...s,
    minutes: s.minutes + c.time,
    money: s.money + c.money,
    savings: s.savings + (c.savings || 0),
    debt: s.debt + (c.debt || 0),
    skill: s.skill + (c.skill || 0),
    family: s.family + (c.family || 0),
    friends: s.friends + (c.friends || 0),
    income: s.income + (c.income || 0),
    rent: c.rent ?? s.rent,
    housing: c.housing ?? s.housing,
    transport: c.transport ?? s.transport,
    flags: c.flag ? [...s.flags, c.flag] : s.flags,
    decisions: [
      ...s.decisions,
      { place, title: c.label, cost: c.nextBest, result: c.result },
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
    return s as State;
  } catch {
    return null;
  }
}
