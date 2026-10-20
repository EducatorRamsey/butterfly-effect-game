import { DAYS, housingDue, type Choice, type Place, type State } from "./model";
import type { Location } from "./story";
import { balanceFirstWeek } from "./firstWeekBalance";
import { secondWeekLocation, secondWeekPlans } from "./secondWeek";
import { dailyEvent } from "./neighborhood";
export const dayPlans = [
  {
    title: "Graduation weekend",
    note: "Meet your neighbors. Choose what matters today.",
    focus: "Training enrollment closes at 2 PM.",
  },
  {
    title: "Make a little room",
    note: "Set your schedule. Tomorrow brings new commitments.",
    focus:
      "The adviser closes at 2 PM; the work-planning meeting takes 3 hours.",
  },
  {
    title: "Promises become plans",
    note: "Your first choices start to matter.",
    focus: "Elena needs a clinic companion before noon.",
  },
  {
    title: "The route changes",
    note: "Bus service is reduced today. Time gets tighter.",
    focus: "Bus riders add 90 minutes to each work or learning commitment.",
  },
  {
    title: "Practice makes progress",
    note: "A shared tool is free this morning. Others need it too.",
    focus: "The tool bench closes at noon.",
  },
  {
    title: "An opening appears",
    note: "There is one paid project. It competes with study time.",
    focus: "The project must be finished by 3 PM.",
  },
  {
    title: "A week of ripples",
    note: "Earn, connect, or prepare for next week.",
    focus: "Housing is due when you finish today. You can use savings.",
  },
  ...secondWeekPlans,
];
export function dayLabel(s: State) {
  return `Day ${s.day} of 14 · ${DAYS[(s.day - 1) % 7]}`;
}
export function busDelay(s: State, place: Place) {
  if (s.transport !== "City bus" || !["work", "college"].includes(place))
    return 0;
  return s.day === 4 ? 90 : s.day > 7 && dailyEvent(s).id === "rain" ? 30 : 0;
}
function choice(
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
    detail: `${time >= 60 ? `${Math.floor(time / 60)}h${time % 60 ? ` ${time % 60}m` : ""}` : `${time}m`} · ${money === 0 ? "no cash cost" : money > 0 ? `earn $${money}` : `pay $${-money}`}`,
    ...extra,
  };
}
const rest = (id: string) =>
  choice(
    id,
    "Rest and keep the afternoon free",
    60,
    0,
    "Time to earn money or practice a skill.",
    "You protected time to recover. Your other plans remain open.",
    { wellbeing: 2 },
  );
export function weekLocation(base: Location, s: State): Location {
  if (s.day === 1) return base;
  if (s.day > 7) {
    const next = secondWeekLocation(base, s),
      delay = busDelay(s, base.id);
    return {
      ...next,
      choices: next.choices.map((v) =>
        delay
          ? {
              ...v,
              time: v.time + delay,
              detail: `${v.detail} · +${delay}m bus wait included`,
            }
          : v,
      ),
    };
  }
  const d = s.day;
  let text = "";
  let scarcity = "Time · Choose one commitment here today.";
  let choices: Choice[] = [];
  if (base.id === "home") {
    if (d === 2) {
      text = "Let’s plan the week. You don’t have to fill every hour.";
      choices = [
        choice(
          "home-plan",
          "Plan work and learning time",
          60,
          0,
          "An hour to rest.",
          "You marked your deadlines. Plans can change.",
          { skill: 1 },
        ),
        rest("home-rest-week"),
      ];
    } else if (d === 3) {
      text = "My clinic visit is this morning. Can you come with me?";
      scarcity = "Time · Finish the clinic visit by noon.";
      choices = [
        choice(
          "home-clinic",
          "Go with Elena to the clinic",
          120,
          0,
          "Two hours for paid work or study.",
          "You helped Elena ask questions at her visit.",
          { family: 1, deadline: 720, flag: "clinic" },
        ),
        choice(
          "home-call",
          "Arrange another ride for Elena",
          30,
          0,
          "Going along and spending time together.",
          "A neighbor can take Elena. Asking for help kept her appointment.",
          { family: 1 },
        ),
      ];
    } else if (d === 4) {
      text =
        "The bus schedule changed. We can share one ride, but it takes planning.";
      choices = [
        choice(
          "home-ride",
          "Arrange a family ride",
          60,
          -10,
          "Keeping $10 and an hour for another plan.",
          "You share fuel costs. A family ride avoids today’s bus delay.",
          { transport: "Family ride" },
        ),
        rest("home-rest-route"),
      ];
    } else if (d === 5) {
      text = "We have one laptop again today. Would you like the morning slot?";
      choices = [
        choice(
          "home-laptop",
          "Practice a college application",
          90,
          0,
          "Time with family.",
          "You practiced the form and listed what aid documents you need.",
          { skill: 1 },
        ),
        choice(
          "home-time",
          "Spend time with Elena",
          60,
          0,
          "Using the shared laptop.",
          "A quiet visit helps you stay connected.",
          { family: 1 },
        ),
      ];
    } else if (d === 6) {
      text =
        "You’ve been busy. Is there something you want to change for next week?";
      choices = [
        choice(
          "home-budget",
          "Review the week’s budget",
          60,
          0,
          "An hour for paid work.",
          "You compared what you expected with what you actually spent.",
          { skill: 1 },
        ),
        rest("home-rest-budget"),
      ];
    } else {
      text = `Our household contribution is $40 this week. Your ${s.rent ? "room payment is $125 instead" : "contribution is due this evening"}.`;
      choices = [
        choice(
          "home-reflect",
          "Talk through the week with Elena",
          60,
          0,
          "An extra hour to earn money.",
          "Elena sees the effort behind your choices, including the things you could not fit in.",
          { family: 1 },
        ),
        choice(
          "home-save",
          "Move $30 into savings",
          30,
          -30,
          "Keeping that $30 available to spend.",
          "The money moved from your wallet to savings. Your total did not change.",
          { savings: 30 },
        ),
      ];
    }
  }
  if (base.id === "work") {
    const connected = s.flags.some((f) =>
      ["orientation", "shift", "work-plan"].includes(f),
    );
    if (d === 2) {
      text = connected
        ? "You’ve already met the team. Let’s agree on hours you can manage."
        : "You can try an orientation. A schedule is a commitment, not a guarantee.";
      choices = [
        choice(
          "work-plan",
          "Agree to a flexible work schedule",
          60,
          0,
          "Keeping every day open for learning.",
          "Rivera offers paid shifts this week. You only earn wages when you work.",
          { flag: "work-plan", incomeSet: 192 },
        ),
        choice(
          "work-orient-week",
          "Try a paid orientation",
          60,
          20,
          "Time to plan education.",
          "You learn the register and earn $20.",
          { flag: "orientation" },
        ),
      ];
    } else if (d === 4) {
      text = "We have a four-hour shift today. Training is happening too.";
      choices = [
        choice(
          "work-route",
          "Work the four-hour shift",
          240,
          96,
          "Today’s training session if travel leaves too little time.",
          "You completed the shift and earned $96.",
        ),
        choice(
          "work-flex",
          "Ask for a short shift",
          120,
          40,
          "The extra $56 from a longer shift.",
          "Rivera can offer two hours today. You earn $40 and keep more time.",
          { flag: "flexible" },
        ),
      ];
    } else if (d === 6) {
      text = s.flags.includes("enterprise")
        ? "That neighborhood lead became a paid project. Can you finish it today?"
        : "There is a paid delivery project. You need time and $15 in supplies.";
      scarcity = "Time & demand · Finish by 3 PM.";
      choices = [
        choice(
          "work-project",
          "Complete the neighborhood project",
          180,
          s.flags.includes("enterprise") ? 65 : 45,
          "Three hours for study or friends.",
          "The client pays after the project. Your net earnings already subtract $15 in supplies.",
          {
            deadline: 900,
            skill: 1,
            flag: "project",
            upfront: 15,
            detail: `3h · earn $${s.flags.includes("enterprise") ? 65 : 45} net · $15 needed upfront · by 3 PM`,
          },
        ),
        choice(
          "work-practice",
          "Build a sample for future clients",
          120,
          -15,
          "Guaranteed pay from today’s project.",
          "You made a sample, but no sale is promised.",
          { skill: 2 },
        ),
      ];
    } else {
      text = connected
        ? "Your earlier work connection opens a shift today. Choose hours that fit."
        : "The regular shifts are full. A short paid trial is still open.";
      choices = [
        choice(
          "work-paid",
          connected ? "Work a scheduled shift" : "Take the paid trial",
          connected ? 240 : 120,
          connected ? 96 : 40,
          connected
            ? "A shorter shift and more time to learn."
            : "Time for learning or family.",
          connected
            ? "You worked four hours and earned $96."
            : "You earned $40. Limited staffing, not your effort, set the available hours.",
          { skill: 1 },
        ),
        choice(
          "work-short",
          "Work a short shift",
          120,
          40,
          "The longer shift if available.",
          "You earned $40 and kept the afternoon open.",
        ),
      ];
    }
  }
  if (base.id === "college") {
    if (d === 2) {
      text = s.flags.includes("training")
        ? "Your reserved workshop is Tuesday. Bring your equipment."
        : "Today is open advising. The funded workshop seat is already taken.";
      choices = [
        choice(
          "college-prepare",
          "Prepare a learning plan",
          90,
          0,
          "Time for a paid orientation.",
          "Chen helps you plan a next step without locking you into one path.",
          { skill: 1 },
        ),
        choice(
          "college-library",
          "Use the free library resources",
          60,
          0,
          "More time with an adviser.",
          "You find free practice materials.",
          { flag: "library" },
        ),
      ];
    } else if (d === 4) {
      text = s.flags.includes("training")
        ? "Your reserved seat is ready. The session takes three hours."
        : "The workshop is full. We still have free college advising.";
      scarcity = "Seats & travel time · A reservation opens the workshop.";
      choices = [
        choice(
          "college-attend",
          "Attend your reserved workshop",
          180,
          0,
          "Paid work during the same hours.",
          "You used the seat you reserved and practiced a trade skill.",
          { requires: "training", skill: 3, flag: "attended" },
        ),
        choice(
          "college-open",
          "Attend free college advising",
          120,
          0,
          "The workshop if you reserved a seat.",
          "You compare costs, aid, and part-time options.",
          { skill: 1, flag: "advising" },
        ),
      ];
    } else if (d === 5) {
      text = "One shared tool bench is free this morning. It closes at noon.";
      scarcity = "Shared equipment · Finish by noon.";
      choices = [
        choice(
          "college-tools",
          "Practice at the shared tool bench",
          120,
          0,
          "A paid work shift this morning.",
          "You practiced with tools you did not need to buy.",
          { skill: 2, deadline: 720, flag: "tools" },
        ),
        choice(
          "college-video",
          "Practice with free lesson materials",
          60,
          0,
          "Hands-on time with the shared tools.",
          "You learned the safety steps. Tool access still matters.",
          { skill: 1 },
        ),
      ];
    } else if (d === 6) {
      text =
        "A project can earn money now. Practice can build options for later.";
      choices = [
        choice(
          "college-portfolio",
          "Build a college or training portfolio",
          180,
          0,
          "Today’s paid neighborhood project.",
          "Your work is ready to show an adviser or future employer.",
          { skill: 2, flag: "portfolio" },
        ),
        choice(
          "college-ask",
          "Ask about changing direction",
          60,
          0,
          "A longer practice session.",
          "Chen helps you compare paths. Changing your focus is allowed.",
          { skill: 1 },
        ),
      ];
    } else if (d === 7) {
      text = s.flags.includes("attended")
        ? "You attended the workshop. A mentor can help plan the next course."
        : "A week can teach you what fits. Let’s choose a next step.";
      choices = [
        choice(
          "college-next",
          "Meet a mentor for next week",
          90,
          0,
          "Time to earn money today.",
          "You leave with a next step, not a guaranteed outcome.",
          { skill: 1 },
        ),
        rest("college-rest"),
      ];
    } else {
      text = "Aid forms take time. The library has a free computer today.";
      choices = [
        choice(
          "college-aid",
          "Prepare financial-aid documents",
          120,
          0,
          "A paid shift during these hours.",
          "Your documents are ready. An aid award is not guaranteed.",
          { skill: 1, flag: "aid-ready" },
        ),
        choice(
          "college-practice",
          "Practice a career skill",
          90,
          0,
          "Time to prepare aid documents.",
          "You practiced and found one question to ask a mentor.",
          { skill: 1 },
        ),
      ];
    }
  }
  if (base.id === "bus") {
    if (d === 4) {
      text =
        s.transport === "City bus"
          ? "Our route lost service today. Each work or learning commitment adds 90 minutes."
          : "Service is reduced today. Your current travel plan avoids the bus delay.";
      scarcity = "Service · Free fare does not remove a long wait.";
      choices = [
        choice(
          "bus-keep",
          "Keep the current travel plan",
          30,
          0,
          "Spending money on a faster option.",
          "You checked the schedule before making another commitment.",
        ),
        choice(
          "bus-shared",
          "Share a ride for today",
          30,
          -15,
          "Keeping $15 for other needs.",
          "A shared ride avoids the extra bus wait today.",
          { transport: "Shared ride" },
        ),
      ];
    } else if (d === 2) {
      text =
        s.transport === "Workshop carpool"
          ? "Your training connection gave us a carpool. It’s ready for Tuesday."
          : "Let’s choose a travel plan before the week gets busy.";
      choices = [
        choice(
          "bus-week",
          "Use the city bus this week",
          30,
          0,
          "The flexibility of cycling or sharing a ride.",
          "You choose the free-fare bus. Service changes can still cost time.",
          { transport: "City bus" },
        ),
        choice(
          "bus-bike-week",
          "Buy a refurbished bike",
          30,
          -90,
          "Keeping $90 for housing.",
          "The bike gives you another way to travel.",
          { transport: "Bicycle" },
        ),
      ];
      choices.push(
        choice(
          "bus-keep-week",
          "Keep my current travel plan",
          30,
          0,
          "Trying a different way to travel.",
          "You checked your route and kept the plan that fits you.",
        ),
      );
    } else {
      text =
        "Getting there is part of the plan. We can check the route together.";
      choices = [
        choice(
          "bus-check",
          "Check tomorrow’s connections",
          30,
          0,
          "Half an hour with friends or at work.",
          "You checked the route. No fare or wage was charged.",
        ),
        choice(
          "bus-friend",
          "Spend time with Alex",
          60,
          0,
          "Time for work or study.",
          "You catch up without spending money.",
          { friends: 1 },
        ),
      ];
    }
  }
  if (base.id === "apartment") {
    const shared = s.rent > 0;
    if (d === 2) {
      text = shared
        ? "The deposit held your room. Your first weekly payment is $125 on Friday."
        : "The room went to another applicant. We can still compare future options.";
      choices = [
        choice(
          "apartment-plan",
          "Plan Friday’s housing payment",
          60,
          0,
          "Time to look for paid work.",
          "You mark the bill on your calendar. No money is charged yet.",
        ),
        choice(
          "apartment-visit",
          "Check in with Jordan",
          60,
          0,
          "An hour to plan your own budget.",
          "You make time to hear how Jordan is doing.",
          { friends: 1 },
        ),
      ];
    } else if (d === 7) {
      text = `${shared ? "Your $125 room payment" : "Your $40 household contribution"} is due when you finish today. Savings cover a cash gap; anything left becomes an unpaid balance.`;
      scarcity = "Housing · Due today; no hidden second charge.";
      choices = [
        choice(
          "apartment-check",
          "Review the housing bill",
          30,
          0,
          "Half an hour for another activity.",
          "You checked the amount. The day summary will show the payment.",
        ),
        choice(
          "apartment-support",
          "Ask about housing support",
          60,
          0,
          "An extra hour to earn money.",
          "Jordan shares a tenant-support contact. Help is available, but funds are not guaranteed.",
          { friends: 1 },
        ),
      ];
    } else if (d === 5) {
      text = shared
        ? "Our room needs a shared meal plan. We can split groceries."
        : "I’m comparing food and housing costs. Want to plan a low-cost meal?";
      choices = [
        choice(
          "apartment-food",
          "Buy shared groceries",
          60,
          -20,
          "Keeping $20 for other needs.",
          "You share a meal and the cost with Jordan.",
          { friends: 1 },
        ),
        choice(
          "apartment-pantry",
          "Find community food resources",
          60,
          0,
          "The convenience of shopping together.",
          "You learn the pantry hours. Access depends on time and transport.",
          { skill: 1 },
        ),
      ];
    } else {
      text = shared
        ? "Sharing a home means sharing plans. What needs to change?"
        : "I’m still working through housing costs. We can compare options together.";
      choices = [
        choice(
          "apartment-talk",
          "Talk through housing plans",
          60,
          0,
          "Time for paid work.",
          "You hear Jordan’s needs and explain your own.",
          { friends: 1 },
        ),
        choice(
          "apartment-save-week",
          "Move $20 into savings",
          30,
          -20,
          "Keeping that money ready to spend.",
          "You moved money into savings. It is still yours.",
          { savings: 20 },
        ),
      ];
    }
  }
  ({ text, scarcity, choices } = balanceFirstWeek(
    { ...base, text, scarcity, choices },
    s,
  ));
  const delay = busDelay(s, base.id);
  choices = choices.map((c) =>
    delay
      ? {
          ...c,
          time: c.time + delay,
          detail: `${c.detail} · +${delay}m bus wait included`,
        }
      : c,
  );
  return { ...base, text, scarcity, choices };
}
export function calendarNote(s: State) {
  return `Friday housing: $${housingDue(s)}. Wages arrive only after completed work. Savings can cover the bill; any shortfall stays as an unpaid balance.`;
}
