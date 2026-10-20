import type { Choice, State } from "./model";
import type { Location } from "./story";
export const discoveries: Location[] = [
  {
    id: "lowrider",
    name: "Lowrider courtyard",
    person: "Luis · neighborhood builder",
    role: "Art, engineering & community",
    initials: "L",
    color: 0x5f8794,
    x: 80,
    y: 700,
    w: 230,
    h: 64,
    text: "",
    scarcity: "",
    choices: [],
  },
  {
    id: "mural",
    name: "Community mural",
    person: "Marisol · mural artist",
    role: "A neighborhood tells its story",
    initials: "M",
    color: 0xae6d51,
    x: 580,
    y: 940,
    w: 230,
    h: 45,
    text: "",
    scarcity: "",
    choices: [],
  },
  {
    id: "bosque",
    name: "Bosque trail corner",
    person: "Alex · your friend",
    role: "Make room for connection",
    initials: "A",
    color: 0x65876a,
    x: 100,
    y: 940,
    w: 230,
    h: 45,
    text: "",
    scarcity: "",
    choices: [],
  },
];
const eventTypes = [
  {
    id: "repair",
    title: "Co-op repair pop-up",
    text: "Luis has a donated repair part today. Look for the turquoise lowrider.",
    place: "lowrider",
  },
  {
    id: "mural",
    title: "Mural afternoon",
    text: "Donated paint is available at the mural today. Help leave a neighborhood mark.",
    place: "mural",
  },
  {
    id: "rain",
    title: "Monsoon watch",
    text: "An afternoon storm is forecast. Trail visits take longer; bus trips in week two add 30 minutes.",
    place: "bosque",
  },
];
export function dailyEvent(s: Pick<State, "seed" | "day">) {
  let n = (s.seed ^ Math.imul(s.day, 0x45d9f3b)) >>> 0;
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b) >>> 0;
  return eventTypes[((n ^ (n >>> 16)) >>> 0) % 3];
}
export function makeChoice(
  id: string,
  label: string,
  time: number,
  money: number,
  nextBest: string,
  result: string,
  extra: Partial<Choice> = {},
): Choice {
  return {
    id,
    label,
    time,
    money,
    nextBest,
    result,
    detail: `${time}m · ${money === 0 ? "no cash cost" : money > 0 ? `earn $${money}` : `pay $${-money}`}`,
    ...extra,
  };
}
export function discoveryLocation(base: Location, s: State): Location {
  const c = makeChoice,
    event = dailyEvent(s),
    visited = s.flags.includes(`${base.id}-story`);
  if (base.id === "lowrider")
    return {
      ...base,
      text: visited
        ? "Luis remembers your visit. Today you can practice a repair or hear another part of the car’s story."
        : "Luis built this lowrider with his family. Its paint tells a story; its suspension takes patient engineering.",
      scarcity:
        "Parts & shared tools · Practice needs equipment, not just time.",
      choices: [
        c(
          "lowrider-talk",
          "Ask about the lowrider’s story",
          30,
          0,
          "Time for a paid job.",
          "Luis explains how families pass down craft, music, and memories. You found a place to belong.",
          { wellbeing: 1, flag: "lowrider-story" },
        ),
        c(
          "lowrider-part",
          event.id === "repair"
            ? "Collect the donated repair part"
            : "Buy a co-op repair part",
          45,
          event.id === "repair" ? 0 : -15,
          "Keeping your cash or leaving the donated part for another person.",
          "You now have one repair part. The school or co-op can help you turn it into hands-on practice.",
          { parts: 1 },
        ),
        c(
          "lowrider-build",
          "Practice suspension design with Luis",
          120,
          0,
          "Paid work or a different learning activity.",
          "You used a shared workbench to study a real mechanism. The part was used in practice.",
          { partsCost: 1, skill: 2, flag: "lowrider-practice" },
        ),
      ],
    };
  if (base.id === "mural")
    return {
      ...base,
      text: "Marisol is painting a neighborhood mural. Choose whether to help paint or gather people’s stories.",
      scarcity:
        "Materials & expression · Donated paint is available only on pop-up days.",
      choices: [
        c(
          "mural-paint",
          "Paint a section of the community mural",
          90,
          event.id === "mural" ? 0 : -5,
          "Time to earn money and keeping the paint contribution.",
          "Your colors join a shared work of art. The mural remembers that you helped.",
          { wellbeing: 2, flag: "mural-story" },
        ),
        c(
          "mural-listen",
          "Listen to a neighbor’s story",
          30,
          0,
          "Painting your own section.",
          "You hear why this place matters to a neighbor. A life has value beyond earnings.",
          { wellbeing: 1, flag: "mural-listened" },
        ),
      ],
    };
  return {
    ...base,
    text:
      s.alex >= 2
        ? "Alex knows you make time for each other. You can talk, walk, or ask about borrowing a bike."
        : "Alex is your friend from school. A walk can be a chance to talk about more than money.",
    scarcity:
      "Connection & rest · Friendship matters on its own and can make support possible.",
    choices: [
      c(
        "bosque-walk",
        "Walk and talk with Alex",
        event.id === "rain" ? 90 : 60,
        0,
        "Time for paid work.",
        "You listened to each other. Your connection grew; Alex may be comfortable lending a bike when you know each other better.",
        { alex: 1, friends: 1, wellbeing: 2 },
      ),
      c(
        "bosque-bike",
        "Ask Alex to lend a bicycle",
        30,
        0,
        "The independence of owning a bike.",
        "Alex lends a spare bike for the rest of these two weeks. Agreeing when to return it is part of caring for a friendship.",
        { minAlex: 2, transport: "Borrowed bicycle", flag: "borrowed-bike" },
      ),
      c(
        "bosque-rest",
        "Rest under the cottonwoods",
        event.id === "rain" ? 60 : 30,
        0,
        "An extra activity today.",
        "You took time to breathe. Feeling rested can shorten learning activities when your wellbeing reaches 4.",
        { wellbeing: 1 },
      ),
    ],
  };
}
export function reflectionQuestion(day: number) {
  return [
    "Who helped you see an option you had not noticed?",
    "What did you commit to today, and what will it leave out tomorrow?",
    "How did a promise to someone else affect your plan?",
    "How did transport service change what was possible?",
    "Was money, food, or shared equipment harder to access today?",
    "When would you choose learning or connection over immediate pay?",
    "What did you value this week besides money? Name one trade-off.",
    "Which earlier choice opened a door in your second week?",
    "How did privacy or a shared space affect your learning?",
    "Who could use the available seat or tool, and who had to wait?",
    "What support did a friendship make possible? What makes that mutual?",
    "How did a limited part or a bill change your options?",
    "What uncertain outcome were you willing to accept?",
    "Which resource mattered most across both weeks? What would change with better services?",
  ][day - 1];
}
