import type { Choice, Place, State } from "./model";
export interface Location {
  id: Place;
  name: string;
  person: string;
  role: string;
  initials: string;
  color: number;
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  scarcity: string;
  choices: Choice[];
}
export const locations: Location[] = [
  {
    id: "home",
    name: "Family home",
    person: "Aunt Elena",
    role: "A place to begin",
    initials: "E",
    color: 0xc8866d,
    x: 175,
    y: 285,
    w: 220,
    h: 150,
    text: "We have one shared laptop, and I need help with a delivery today. You also have your own plans. What can we make room for?",
    scarcity: "Time & shared equipment · Choose one commitment today.",
    choices: [
      {
        id: "home-help",
        label: "Help Elena with the delivery",
        detail: "2 hours · + family support",
        time: 120,
        money: 0,
        family: 2,
        flag: "family",
        nextBest:
          "Two hours to use the shared laptop for a scholarship application.",
        result:
          "Elena feels supported. She can help with a housing deposit later today.",
      },
      {
        id: "home-study",
        label: "Use the laptop for a scholarship",
        detail: "2 hours · submit by noon · $120 award",
        time: 120,
        money: 120,
        deadline: 720,
        flag: "scholarship",
        nextBest: "Helping Elena with her delivery during this time.",
        result:
          "A local graduation microgrant covers $120 of your next step. Elena finds another helper.",
      },
      {
        id: "home-rest",
        label: "Rest and plan your next step",
        detail: "1 hour · + confidence and skill",
        time: 60,
        money: 0,
        skill: 1,
        nextBest: "Helping Elena with the delivery.",
        result:
          "You practice a budget and make space to recover after graduation. Rest is a real need.",
      },
    ],
  },
  {
    id: "work",
    name: "Rivera Market",
    person: "Ms. Rivera",
    role: "Work & possibility",
    initials: "R",
    color: 0xd49b4e,
    x: 665,
    y: 285,
    w: 250,
    h: 150,
    text: "A coworker is out today. I can offer a longer shift, or a short paid orientation. The long shift overlaps with the training center’s enrollment hours.",
    scarcity: "Time · Paid work competes with enrollment before 2 PM.",
    choices: [
      {
        id: "work-shift",
        label: "Take the longer shift",
        detail: "4 hours · earn $96 · $240/week expected",
        time: 240,
        money: 96,
        income: 240,
        flag: "shift",
        nextBest:
          "Visiting the training center while today’s seats are available.",
        result:
          "You earn $96 and gain a regular schedule. Enrollment may have to wait.",
      },
      {
        id: "work-orientation",
        label: "Choose a short paid orientation",
        detail: "1 hour · earn $20 · $120/week expected",
        time: 60,
        money: 20,
        income: 120,
        flag: "orientation",
        nextBest: "The $96 long shift and its steadier hours.",
        result:
          "You learn the register and keep time for another opportunity. Rivera remembers your interest.",
      },
      {
        id: "work-network",
        label: "Discuss independent work",
        detail: "1 hour · + skill · flexible leads",
        time: 60,
        money: 0,
        skill: 1,
        flag: "enterprise",
        nextBest: "Guaranteed pay from today’s orientation.",
        result:
          "Rivera shares a neighborhood repair-and-delivery lead. Demand is uncertain; flexibility has value.",
      },
    ],
  },
  {
    id: "college",
    name: "Mesa Training Center",
    person: "Mr. Chen",
    role: "More than one way forward",
    initials: "C",
    color: 0x728f8d,
    x: 1135,
    y: 285,
    w: 270,
    h: 150,
    text: "There is one funded seat left in our introductory trades workshop. Enrollment closes at 2 PM. College advising is free, and you can change direction later.",
    scarcity:
      "Limited seats & equipment · A funded seat cannot serve everyone.",
    choices: [
      {
        id: "college-training",
        label: "Reserve the funded training seat",
        detail: "2 hours · $80 equipment · closes 2 PM",
        time: 120,
        money: -80,
        skill: 2,
        deadline: 840,
        flag: "training",
        nextBest: "Keeping $80 and time available for paid work.",
        result:
          "You reserve today’s last funded seat. The bus stop now offers a workshop travel plan.",
      },
      {
        id: "college-advice",
        label: "Explore college and financial aid",
        detail: "1 hour · free · + skill",
        time: 60,
        money: 0,
        skill: 1,
        flag: "advising",
        nextBest: "The remaining funded trades seat.",
        result:
          "Chen helps you compare college costs and aid. You can revisit your pathway without calling it failure.",
      },
      {
        id: "college-wait",
        label: "Join the next workshop waitlist",
        detail: "30 minutes · free · no seat guaranteed",
        time: 30,
        money: 0,
        flag: "waitlist",
        nextBest: "A guaranteed place in today’s workshop.",
        result:
          "You keep your money and join next month’s waitlist. Limited instructors, not your effort, constrain access.",
      },
    ],
  },
  {
    id: "bus",
    name: "Central Avenue bus stop",
    person: "Alex",
    role: "Getting there takes resources",
    initials: "A",
    color: 0x75a2a6,
    x: 660,
    y: 740,
    w: 240,
    h: 100,
    text: "The bus fare is free on this city route, but reduced evening service means a longer wait. We still pay with our time. How will you get around this week?",
    scarcity: "Service & time · Free fare does not mean unlimited access.",
    choices: [
      {
        id: "bus-plan",
        label: "Plan around the reduced bus schedule",
        detail: "1 hour planning and waiting · no fare",
        time: 60,
        money: 0,
        transport: "City bus",
        nextBest: "An hour with friends or at paid work.",
        result:
          "You build in waiting time. Public transit saves cash, but limited service still affects your options.",
      },
      {
        id: "bus-bike",
        label: "Buy a refurbished bicycle",
        detail: "30 minutes · $90 · more flexibility",
        time: 30,
        money: -90,
        transport: "Bicycle",
        nextBest: "Keeping $90 for housing or education.",
        result:
          "A neighborhood co-op fits your bike. Longer trips and desert heat still need planning.",
      },
      {
        id: "bus-training",
        label: "Coordinate a workshop carpool",
        detail: "30 minutes · $15 shared fuel · requires seat",
        time: 30,
        money: -15,
        requires: "training",
        transport: "Workshop carpool",
        friends: 1,
        nextBest: "Keeping $15 and relying on the bus.",
        result:
          "Your training reservation connects you with a classmate. That earlier choice opens a travel option.",
      },
    ],
  },
  {
    id: "apartment",
    name: "Juniper Apartments",
    person: "Jordan",
    role: "Independence, together",
    initials: "J",
    color: 0xb78686,
    x: 1125,
    y: 705,
    w: 280,
    h: 170,
    text: "Only one affordable shared room is open. The deposit is $300 and your share would be $500 each month. Moving out buys privacy, but brings new commitments.",
    scarcity: "Housing availability · One room, several applicants.",
    choices: [
      {
        id: "apartment-room",
        label: "Apply for the shared room",
        detail: "1 hour · $300 deposit · $500/month",
        time: 60,
        money: -300,
        rent: 500,
        housing: "Shared room with Jordan",
        friends: 2,
        flag: "room",
        nextBest: "Keeping your deposit available while staying with family.",
        result:
          "You secure the available room with Jordan. The monthly commitment will compete with future goals.",
      },
      {
        id: "apartment-family",
        label: "Stay with family and build savings",
        detail: "1 hour · transfer $60 to savings",
        time: 60,
        money: -60,
        savings: 60,
        housing: "With Aunt Elena",
        nextBest: "The available room and more privacy now.",
        result:
          "You move $60 from spending money to savings. Family housing helps, though space and privacy remain limited.",
      },
      {
        id: "apartment-list",
        label: "Research future housing with Jordan",
        detail: "1 hour · free · + friendship",
        time: 60,
        money: 0,
        friends: 1,
        flag: "housing-list",
        nextBest: "Applying for the one room available today.",
        result:
          "You compare rents and tenant resources together. High rents reflect the housing market, not a personal failure.",
      },
    ],
  },
];
export function choicesFor(location: Location, s: State): Choice[] {
  return location.choices.map((c) =>
    c.id === "apartment-room" && s.flags.includes("family")
      ? {
          ...c,
          money: -200,
          detail: "1 hour · $200 deposit after Elena’s $100 help · $500/month",
          result:
            c.result +
            " Elena contributes $100 because you helped with the delivery.",
        }
      : c,
  );
}
export function followup(location: Location, s: State): string {
  if (location.id === "work" && s.flags.includes("training"))
    return "You mention the workshop. Rivera offers to discuss a schedule around your training next week. Your options are beginning to connect.";
  if (location.id === "home" && s.flags.includes("shift"))
    return "Elena knows the shift was important. She still wishes there had been more time together. Both needs mattered.";
  return (
    s.decisions.find((d) => d.place === location.id)?.result || location.text
  );
}
