import type { State } from "./model";
import type { Location } from "./story";
import { makeChoice as c } from "./neighborhood";
export function balanceFirstWeek(l: Location, s: State): Location {
  const d = s.day,
    shared = s.rent > 0;
  let { text, scarcity, choices } = l;
  if (d === 2) {
    if (l.id === "home")
      choices = [
        c(
          "home-plan",
          "Plan work and learning time",
          90,
          0,
          "A longer learning or work commitment.",
          "You set priorities rather than promising every hour.",
          { skill: 1 },
        ),
        c(
          "home-rest-week",
          "Rest and keep the afternoon free",
          60,
          0,
          "A longer planning session.",
          "You recover after graduation. Being rested can make learning easier later.",
          { wellbeing: 2 },
        ),
      ];
    if (l.id === "work")
      choices = choices.map((v) => ({
        ...v,
        time: v.id === "work-plan" ? 180 : 120,
        detail:
          v.id === "work-plan"
            ? "3 hours · set a schedule · no wages today"
            : "2 hours · earn $20",
      }));
    if (l.id === "college") {
      text =
        "Learning-plan appointments finish by 2 PM. The free library stays open later.";
      scarcity =
        "Appointments & time · A long work meeting competes with the adviser.";
      choices = [
        c(
          "college-prepare",
          "Prepare a learning plan",
          210,
          0,
          "The work-planning meeting during these hours.",
          "Your adviser helped you build a detailed plan.",
          { skill: 2, deadline: 840 },
        ),
        c(
          "college-library",
          "Use the free library resources",
          120,
          0,
          "Personal time with an adviser.",
          "You practiced with free materials, without an appointment.",
          { skill: 1, flag: "library" },
        ),
      ];
    }
    if (l.id === "apartment")
      choices = choices.map((v) => ({
        ...v,
        time: 90,
        detail: "90m · no cash cost",
        ...(v.id === "apartment-plan"
          ? {
              flag: "housing-search",
              skill: 1,
              result:
                "You compare listings and deposits. This research can lower a new-room deposit in week two.",
            }
          : { friends: 2 }),
      }));
  }
  if (l.id === "bus" && [3, 5, 6, 7].includes(d)) {
    const scenarios: Record<
      number,
      { text: string; label: string; result: string }
    > = {
      3: {
        text: "Alex is anxious about starting work. A visit can help you both feel less alone.",
        label: "Spend time with Alex",
        result: "You listen to each other. Alex remembers that you made time.",
      },
      5: {
        text: "Alex found a bike co-op and a mural project. Which would you like to explore?",
        label: "Visit the mural with Alex",
        result: "You share a neighborhood story and grow closer.",
      },
      6: {
        text: "Alex has a spare bike, but lending it means trusting someone to return it.",
        label: "Ask about Alex’s plans",
        result: "You make room for Alex’s goals as well as your own.",
      },
      7: {
        text: "Alex wants to mark the end of the week. It does not have to cost money.",
        label: "Celebrate the week with Alex",
        result: "You celebrate a friendship, not a balance sheet.",
      },
    };
    text = scenarios[d].text;
    scarcity = "Connection & transport · Support grows through time together.";
    choices = [
      c(
        `bus-social-${d}`,
        scenarios[d].label,
        60,
        0,
        "An hour for work or study.",
        scenarios[d].result,
        { alex: 1, friends: 1, wellbeing: 2 },
      ),
    ];
  }
  if (l.id === "bus" && d >= 2) {
    if (s.transport !== "Bicycle")
      choices.push(
        c(
          "bus-bike-open",
          "Buy a refurbished bike",
          45,
          -90,
          "Keeping $90 for rent or equipment.",
          "The bike is yours. You can avoid bus-service delays.",
          { transport: "Bicycle" },
        ),
      );
    if (s.transport !== "Bicycle" && s.transport !== "Borrowed bicycle")
      choices.push(
        c(
          "bus-loan-open",
          "Borrow Alex’s spare bike",
          30,
          0,
          "The independence of owning a bicycle.",
          "Alex lends a spare bike through day 14. A relationship opened this option.",
          { minAlex: 2, transport: "Borrowed bicycle", flag: "borrowed-bike" },
        ),
      );
    // A transport purchase must not leave a temporary ride queued for restoration.
    const seen = new Set<string>();
    choices = choices.filter((v) => {
      if (v.transport === "Bicycle") {
        if (seen.has("bike")) return false;
        seen.add("bike");
      }
      return true;
    });
  }
  if (l.id === "apartment" && d === 3) {
    text = shared
      ? "A shared room needs quiet hours. We both need space to study."
      : "Listings are limited. Research today can reduce a future deposit.";
    scarcity = "Privacy & availability · A room is more than its rent.";
    choices = [
      c(
        "apartment-space",
        shared ? "Agree on quiet hours" : "Research a new housing opening",
        120,
        0,
        "Time for paid work.",
        shared
          ? "You agree on quiet hours. From week two, learning sessions take 30 minutes less."
          : "Your research can reduce a new room’s deposit by $50.",
        { flag: shared ? "quiet-space" : "housing-search", friends: 1 },
      ),
      c(
        "apartment-checkin",
        "Make time for Jordan",
        60,
        0,
        "A longer housing-planning session.",
        "You listen without trying to solve everything. Trust can later open shared housing options.",
        { friends: 2, wellbeing: 1 },
      ),
    ];
  }
  if (l.id === "apartment" && d === 4) {
    text =
      "A rental viewing has one afternoon slot. You can explore a future option or help Jordan prepare.";
    scarcity = "Housing access · Finish the viewing before 3 PM.";
    choices = [
      c(
        "apartment-view",
        "Attend the rental viewing",
        120,
        0,
        "Paid work or training during these hours.",
        "You learn the real deposit and space limits. Your research can reduce a later deposit.",
        { flag: "housing-search", deadline: 900 },
      ),
      c(
        "apartment-questions",
        "Help Jordan prepare tenant questions",
        60,
        0,
        "Seeing the room in person.",
        "You help Jordan ask about repairs and charges. Trust grows.",
        { friends: 2, skill: 1 },
      ),
    ];
  }
  if (l.id === "apartment" && d === 5) {
    text =
      "Buying ingredients gives three packed meals. Free pickup has a longer wait and one meal available.";
    scarcity = "Food & access · Cash, quantity, and pickup time differ.";
    choices = [
      c(
        "apartment-food",
        "Buy shared groceries",
        60,
        -20,
        "Keeping $20 for the housing bill.",
        "You prepare three meals. Each meal can save $8 on a work shift in week two.",
        { meals: 3, friends: 2 },
      ),
      c(
        "apartment-pantry",
        "Find community food resources",
        120,
        0,
        "The quantity and quicker access of buying ingredients.",
        "You collect one available meal. Free resources still depend on opening hours and supply.",
        { meals: 1, skill: 1, deadline: 900 },
      ),
    ];
  }
  if (l.id === "apartment" && d === 6) {
    text =
      "Jordan needs a maintenance visit arranged. Waiting alone and coordinating take different resources.";
    scarcity = "Service & trust · Repairs require access to the home.";
    choices = [
      c(
        "apartment-wait-first",
        "Wait for the repair appointment",
        180,
        0,
        "A paid project or portfolio session.",
        "You make the space more comfortable.",
        { wellbeing: 2, friends: 1 },
      ),
      c(
        "apartment-coordinate",
        "Coordinate the visit with Jordan",
        60,
        0,
        "Handling the whole visit yourself.",
        "You share the responsibility because you have built trust.",
        { minJordan: 2, friends: 1 },
      ),
    ];
  }
  return { ...l, text, scarcity, choices };
}
