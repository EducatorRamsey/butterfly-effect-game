import type { State } from "./model";
import type { Location } from "./story";
import { makeChoice as c, dailyEvent } from "./neighborhood";
export const secondWeekPlans = [
  {
    title: "Doors you opened",
    note: "Bring what you learned into a new week.",
    focus: "A new room and career appointments open. Check the calendar.",
  },
  {
    title: "Space to focus",
    note: "Privacy, study, and interviews compete.",
    focus: "The interview closes at 2 PM. Quiet housing can save study time.",
  },
  {
    title: "One tool, many plans",
    note: "Equipment is shared. A seat is not the same as a tool.",
    focus: "A supervised bench closes at noon; repair parts are limited.",
  },
  {
    title: "People in your corner",
    note: "Support can change an option without deciding for you.",
    focus: "A job reference or Alex’s bike loan may now be available.",
  },
  {
    title: "Making ends meet",
    note: "Food, parts, and money each have a use.",
    focus: "Packed meals save $8 on a shift. Friday housing is approaching.",
  },
  {
    title: "An uncertain next step",
    note: "No application can promise an outcome.",
    focus: "A career application closes at 2 PM. Choose what you can prepare.",
  },
  {
    title: "More than a balance",
    note: "Look at your work, relationships, and possibilities.",
    focus: "Second housing payment is due tonight; review both weeks.",
  },
];
export function secondWeekLocation(base: Location, s: State): Location {
  const d = s.day,
    event = dailyEvent(s),
    shared = s.rent > 0;
  let text = "",
    scarcity =
      "Money, equipment & support · Different resources open different options.";
  let choices: Location["choices"] = [];
  if (base.id === "home") {
    const stories = [
      "Two weeks of decisions need some breathing room. What would help today?",
      "A quiet space can be hard to share. Let’s agree on a plan.",
      "The laptop has one long booking slot today. We can share it.",
      "You’ve been showing up for others. It’s okay to ask for help too.",
      "There are errands and meals to plan. We can share the load.",
      "Your next step may change. I want to hear what matters to you.",
      "Aunt Elena asks what you learned about the support around you.",
    ];
    text = stories[d - 8];
    choices =
      d === 9
        ? [
            c(
              "home-quiet",
              "Arrange quiet study hours",
              90,
              0,
              "Keeping the shared room available for everyone.",
              "You agree on quiet hours. Learning commitments now take 30 minutes less.",
              { flag: "quiet-space", family: 1 },
            ),
            c(
              "home-library",
              "Reserve a free library study room",
              60,
              0,
              "Studying at home without a reservation.",
              "You reserve a quiet room for your next studies.",
              { flag: "quiet-space" },
            ),
          ]
        : d === 10
          ? [
              c(
                "home-laptop-two",
                "Use the afternoon laptop slot",
                180,
                0,
                "A job or tool-bench visit.",
                "You finish a draft without buying a computer.",
                { skill: 2, deadline: 1020 },
              ),
              c(
                "home-paper",
                "Prepare an application on paper",
                60,
                0,
                "Finishing the online application today.",
                "Your outline is ready for a future computer slot.",
                { skill: 1 },
              ),
            ]
          : d === 12
            ? [
                c(
                  "home-meals",
                  "Prepare three packed meals together",
                  120,
                  -12,
                  "Buying fewer prepared meals with less time.",
                  "You used shared ingredients and made three meals for later commitments.",
                  { meals: 3, family: 1 },
                ),
                c(
                  "home-errand",
                  "Help with a family errand",
                  120,
                  0,
                  "Preparing your own meals.",
                  "You helped Elena get what she needed.",
                  { family: 2, wellbeing: 1 },
                ),
              ]
            : [
                c(
                  `home-talk-${d}`,
                  "Talk and recharge with Aunt Elena",
                  90,
                  0,
                  "More time for paid work.",
                  "You feel heard. Rest and connection matter, even without a paycheck.",
                  { family: 1, wellbeing: 2 },
                ),
                c(
                  `home-practice-${d}`,
                  "Practice a next-step skill at home",
                  120,
                  0,
                  "Time spent with family.",
                  "You practiced without paying for a course.",
                  { skill: 1 },
                ),
              ];
  }
  if (base.id === "work") {
    if (d === 9) {
      text =
        "A better-paid job has an interview today. It overlaps with a regular shift.";
      scarcity = "Access · An interview is an opening, not guaranteed work.";
      choices = [
        c(
          "work-interview",
          "Attend the job interview",
          180,
          0,
          "Today’s $96 shift.",
          "Rivera’s reference helps you get an interview. A longer-commute trial opens Tuesday.",
          { flag: "interview", deadline: 840 },
        ),
        c(
          "work-stay",
          "Keep today’s paid shift",
          240,
          96,
          "The interview opening.",
          "You chose income you can use now.",
          { skill: 1 },
        ),
      ];
    } else if (d === 11) {
      text = s.flags.includes("interview")
        ? "Your interview opened a trial at the new job. Travel takes an extra hour."
        : "There is a regular shift and a neighborhood repair job. Tools matter for the repair.";
      choices = [
        c(
          "work-trial",
          s.flags.includes("interview")
            ? "Try the higher-paid job"
            : "Work a regular shift",
          s.flags.includes("interview") ? 300 : 240,
          s.flags.includes("interview") ? 112 : 96,
          "A shorter commute and more time nearby.",
          "You completed paid work. More pay still came with a time cost.",
        ),
        c(
          "work-repair",
          "Complete a paid co-op repair",
          180,
          80,
          "The guaranteed regular shift.",
          "Your practice and one repair part made this job possible.",
          { partsCost: 1, minSkill: 3, skill: 1 },
        ),
      ];
    } else if (d === 13) {
      text = "There is paid work today, but applications close this afternoon.";
      choices = [
        c(
          "work-final-shift",
          "Work before the weekend",
          240,
          96,
          "Preparing a career application before 2 PM.",
          "You earned money you can use toward housing.",
        ),
        c(
          "work-reference",
          "Ask Rivera for a reference",
          60,
          0,
          "Today’s larger paycheck.",
          "Rivera writes about your reliability. Your application now has a reference.",
          { flag: "reference" },
        ),
      ];
    } else {
      text =
        d === 12 && event.id === "rain"
          ? "A storm shortened today’s work offer. There is a two-hour indoor shift."
          : "A paid shift includes a meal break. A packed meal saves the $8 cafeteria cost.";
      const hours = d === 12 && event.id === "rain" ? 120 : 240,
        wage = hours === 120 ? 48 : 96;
      choices = [
        c(
          `work-packed-${d}`,
          "Work and bring a packed meal",
          hours,
          wage,
          "Saving that meal for another day.",
          "You earned wages and used one meal. No cafeteria cost was deducted.",
          { mealCost: 1, skill: 1 },
        ),
        c(
          `work-cafe-${d}`,
          "Work and buy the cafeteria meal",
          hours,
          wage - 8,
          "Keeping the $8 or using a prepared meal.",
          "Your net pay already subtracts $8 for the meal.",
          { skill: 1 },
        ),
      ];
    }
  }
  if (base.id === "college") {
    if (d === 8) {
      text = `You’re exploring ${s.path.toLowerCase()}. Your earlier skills can open a new appointment.`;
      choices = [
        c(
          "college-career",
          "Reserve a career mentoring appointment",
          120,
          0,
          "Earning money during these hours.",
          "You reserve one of the limited appointments. The application opens on Thursday.",
          { flag: "career-slot", skill: 1 },
        ),
        c(
          "college-open-two",
          "Explore a different pathway",
          150,
          0,
          "Taking the limited appointment now.",
          "You compare another route. Changing direction does not erase your experience.",
          { skill: 2 },
        ),
      ];
    } else if (d === 10) {
      text =
        "One supervised bench is available before noon. Bring a repair part.";
      scarcity = "Equipment · A place and a usable part are both needed.";
      choices = [
        c(
          "college-bench",
          "Use the supervised tool bench",
          120,
          0,
          "Keeping the part for paid repair work.",
          "You used your part and learned with shared equipment.",
          { partsCost: 1, skill: 3, deadline: 720 },
        ),
        c(
          "college-observe",
          "Observe the safety demonstration",
          90,
          0,
          "Hands-on practice with a part.",
          "You learned safety steps, though watching does not replace using the tools.",
          { skill: 1 },
        ),
      ];
    } else if (d === 13) {
      text = s.flags.includes("career-slot")
        ? "Your mentoring appointment is ready. Complete an application before 2 PM."
        : "Walk-in application help is open, but the mentoring seats are full.";
      scarcity =
        "Opportunity · Applications need preparation; places are limited.";
      choices = [
        c(
          "college-apply",
          s.path === "Trades"
            ? "Apply for an apprenticeship"
            : "Submit a career or college application",
          180,
          0,
          "Today’s paid work.",
          "You submit with the experience you have. No acceptance is promised in this chapter.",
          { minSkill: 4, flag: "applied", deadline: 840 },
        ),
        c(
          "college-prepare-two",
          "Build the skills for a later application",
          120,
          0,
          "Applying in the current round.",
          "You prepare for a later round without calling the delay a failure.",
          { skill: 2 },
        ),
      ];
    } else if (d === 14) {
      text = s.flags.includes("applied")
        ? "Your application is in. We can plan a next step while you wait."
        : "There is more than one next step. What do you want to practice next?";
      choices = [
        c(
          "college-next-two",
          "Plan a next step with Mr. Chen",
          90,
          0,
          "Another paid shift.",
          "You leave with a plan and a question to ask—not a winner or loser label.",
          { skill: 1, wellbeing: 1 },
        ),
        c(
          "college-peer",
          "Help another graduate find resources",
          90,
          0,
          "Time for your own paid work.",
          "You shared knowledge and learned from another person.",
          { friends: 1, wellbeing: 2 },
        ),
      ];
    } else {
      text =
        d === 9
          ? "A focused study session can build skills. A quiet space or feeling rested can shorten it."
          : d === 11
            ? "Some lessons need tools; others need practice and feedback."
            : "Choose whether to build a portfolio or prepare aid documents.";
      choices = [
        c(
          `college-focus-${d}`,
          "Complete a focused learning session",
          210,
          0,
          "Paid work or a social afternoon.",
          "You developed a skill you can use for applications and repair opportunities.",
          { skill: 2 },
        ),
        c(
          `college-aid-${d}`,
          "Prepare aid and training documents",
          120,
          0,
          "A longer hands-on session.",
          "Your documents are ready to discuss with an adviser.",
          { skill: 1, flag: "aid-ready" },
        ),
      ];
    }
  }
  if (base.id === "bus") {
    const texts = [
      "Alex has news about a community repair meet. You can also change your transport plan.",
      "The co-op can fit a bicycle today. Owning and borrowing have different costs.",
      "Alex wants to show you the mural. Keeping in touch can grow trust.",
      "A bike loan is possible when you and Alex have built trust.",
      "A route detour was posted this morning. Alex can help compare alternatives.",
      "Alex is nervous about a next step too. There is room to listen.",
      "Alex asks what you want to do together beyond graduation.",
    ];
    text = texts[d - 8];
    choices = [
      c(
        `bus-social-${d}`,
        (
          {
            8: "Visit the lowrider meet with Alex",
            9: "Plan a co-op ride with Alex",
            10: "Visit the mural with Alex",
            11: "Talk about asking for help",
            12: "Compare the detour with Alex",
            13: "Listen to Alex’s plans",
            14: "Make plans to see Alex again",
          } as Record<number, string>
        )[d],
        90,
        0,
        "Time for work or learning.",
        "You made room for your friend. Your connection grew, and Alex may offer practical support as well.",
        { alex: 1, friends: 1, wellbeing: 2 },
      ),
      c(
        "bus-buy-later",
        "Buy a refurbished bicycle",
        45,
        -90,
        "Keeping $90 for housing or equipment.",
        "You own a bicycle and can avoid bus delays.",
        { transport: "Bicycle" },
      ),
      c(
        "bus-borrow-later",
        "Borrow Alex’s spare bicycle",
        30,
        0,
        "Owning your transport without a return commitment.",
        "Alex lends you the spare bike through day 14.",
        { minAlex: 2, transport: "Borrowed bicycle", flag: "borrowed-bike" },
      ),
    ];
    if (s.transport === "Bicycle" || s.transport === "Borrowed bicycle")
      choices = choices.filter((v) => !v.transport);
  }
  if (base.id === "apartment") {
    if (d === 8) {
      text = shared
        ? "You have a room. We need to plan shared space and bills."
        : "A different shared room opened. Your housing research can reduce the deposit.";
      scarcity = "Housing supply & privacy · One room is available today.";
      choices = shared
        ? [
            c(
              "apartment-quiet-two",
              "Agree on quiet hours with Jordan",
              90,
              0,
              "Using the room freely at any hour.",
              "You both agree on quiet hours. Learning sessions now take 30 minutes less.",
              { flag: "quiet-space", friends: 1 },
            ),
            c(
              "apartment-chores",
              "Take a shared cleaning turn",
              120,
              0,
              "Time for paid work.",
              "You make the room easier to share and build trust.",
              { friends: 2, wellbeing: 1 },
            ),
          ]
        : [
            c(
              "apartment-room-two",
              "Apply for the newly available room",
              120,
              s.flags.includes("housing-search") ? -200 : -250,
              "Keeping the deposit available while living with family.",
              "You secure a shared room. Weekly housing is $125 and you gain a quiet study space.",
              {
                housing: "Shared room with Jordan",
                rent: 500,
                flag: "quiet-space",
                friends: 1,
              },
            ),
            c(
              "apartment-family-two",
              "Stay with family and share a meal",
              90,
              -10,
              "The privacy of the available room.",
              "You stay with family and share food instead of paying a deposit.",
              { meals: 2, wellbeing: 1 },
            ),
          ];
    } else if (d === 9) {
      text = "We can save money on a smaller room, but it offers less privacy.";
      choices = [
        c(
          "apartment-smaller",
          "Apply for the smaller shared room",
          150,
          shared ? 0 : -150,
          "Keeping more personal space.",
          "You agree to a smaller room at $350 per month, or $88 per week. It gives up the quiet-space study saving.",
          {
            minJordan: 2,
            rent: 350,
            housing: "Smaller shared room with Jordan",
            flag: "smaller-room",
          },
        ),
        c(
          "apartment-current",
          "Keep your current housing",
          60,
          0,
          "The lower-cost room if available.",
          "You keep the housing arrangement that fits your current needs.",
          { wellbeing: 1 },
        ),
      ];
    } else if (d === 10) {
      text =
        "Groceries give more meals; community food pickup is free but takes longer.";
      choices = [
        c(
          "apartment-food-two",
          "Buy ingredients for four packed meals",
          90,
          -24,
          "Keeping $24 for the housing bill.",
          "You prepare four meals. Each can save $8 on a paid shift.",
          { meals: 4, friends: 1 },
        ),
        c(
          "apartment-pantry-two",
          "Collect one community meal",
          150,
          0,
          "The convenience and quantity of buying ingredients.",
          "You collect one available meal during the pickup window.",
          { meals: 1, deadline: 900 },
        ),
      ];
    } else if (d === 11) {
      text =
        "A maintenance appointment needs someone home. Could you wait or split the task?";
      choices = [
        c(
          "apartment-wait",
          "Wait for the maintenance visit",
          180,
          0,
          "A paid shift during the same hours.",
          "You get the repair handled and make the space more comfortable.",
          { wellbeing: 2, friends: 1 },
        ),
        c(
          "apartment-split",
          "Coordinate the visit with Jordan",
          60,
          0,
          "Handling the visit entirely on your own.",
          "Trust lets you share the appointment instead of waiting all afternoon.",
          { minJordan: 2, friends: 1 },
        ),
      ];
    } else if (d === 12) {
      text =
        "We can put money toward an overdue bill, or prepare for Friday’s housing payment.";
      choices = [
        c(
          "apartment-pay-old",
          "Pay $20 toward an unpaid balance",
          30,
          -Math.min(20, s.debt),
          "Keeping that cash for Friday.",
          "Your earlier unpaid balance shrinks by the amount you paid.",
          { debt: -Math.min(20, s.debt) },
        ),
        c(
          "apartment-budget-two",
          "Plan Friday’s payment together",
          90,
          0,
          "An extra paid hour.",
          "You compare the bill and your savings without moving money.",
          { friends: 1, skill: 1 },
        ),
      ];
    } else if (d === 13) {
      text =
        "There is a free tenant-rights session today. Information can change your options.";
      choices = [
        c(
          "apartment-rights",
          "Attend the tenant-rights session",
          120,
          0,
          "Time for paid work or an application.",
          "You learn how to request repairs and question a fee.",
          { flag: "tenant-rights", skill: 1 },
        ),
        c(
          "apartment-neighbor",
          "Check on a neighbor",
          60,
          0,
          "Attending the rights session.",
          "You and Jordan make a connection that is not about a bill.",
          { friends: 1, wellbeing: 1 },
        ),
      ];
    } else {
      text =
        "Another housing payment is due today. A budget is only one part of a life.";
      choices = [
        c(
          "apartment-review-two",
          "Review the bill with Jordan",
          60,
          0,
          "An extra hour to earn wages.",
          "You understand what is due and what remains possible.",
          { friends: 1 },
        ),
        c(
          "apartment-celebrate",
          "Share a simple end-of-week meal",
          90,
          -12,
          "Keeping $12 available after the bill.",
          "You celebrate getting through changes together.",
          { meals: 2, wellbeing: 2 },
        ),
      ];
    }
  }
  const quiet =
    s.flags.includes("quiet-space") && !s.flags.includes("smaller-room");
  if (base.id === "apartment" && d === 12 && s.debt === 0)
    choices[0] = c(
      "apartment-food-swap",
      "Prepare a meal to share",
      60,
      -6,
      "Keeping $6 available for Friday.",
      "You share ingredients and make two packed meals.",
      { meals: 2, wellbeing: 1 },
    );
  choices = choices.map((v) =>
    base.id === "college" && v.time >= 120
      ? {
          ...v,
          time: v.time - (quiet ? 30 : 0) - (s.wellbeing >= 4 ? 15 : 0),
          detail: `${v.time - (quiet ? 30 : 0) - (s.wellbeing >= 4 ? 15 : 0)}m total · no cash cost${quiet ? " · quiet space saves 30m" : ""}${s.wellbeing >= 4 ? " · rested focus saves 15m" : ""}`,
        }
      : v,
  );
  return { ...base, text, scarcity, choices };
}
