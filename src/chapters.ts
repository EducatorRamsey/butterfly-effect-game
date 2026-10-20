import type { Choice, State } from "./model";
import { stageForDay } from "./timeline";
import { makeChoice as c } from "./neighborhood";
import type { Location } from "./story";
export function chapterLocation(base: Location, s: State): Location {
  const stage = stageForDay(s.day)!,
    life = s.life!;
  const d = s.day;
  let text = "",
    scarcity = "Money, access, time & support · These are choices, not scores.";
  let choices: Choice[] = [];
  if (base.id === stage.required) {
    switch (d) {
      case 15: {
        const aid =
          s.flags.includes("aid-ready") || s.flags.includes("scholarship");
        const trained =
          s.flags.includes("attended") || s.flags.includes("lowrider-practice");
        text = `Mr. Chen remembers your ${s.path.toLowerCase()} interests. Which mix of work and learning fits your life now?`;
        choices = [
          c(
            "life-college",
            "Study at college and work part-time",
            180,
            0,
            "More paid hours and less tuition now.",
            aid
              ? "Your earlier aid preparation lowers modeled tuition to $150 a month."
              : "You plan college and paid work. Modeled tuition is $300 per month.",
            {
              path: "College",
              life: {
                monthlyIncome: 1100,
                tuition: aid ? 150 : 300,
                study: life.study + 1,
                variableIncome: false,
              },
              flag: "college-route",
              detail: `180m · $1,100/month take-home · tuition $${aid ? 150 : 300}/month`,
            },
          ),
          c(
            "life-college-loan",
            "Fund a college start with a small loan",
            180,
            600,
            "Starting without loan debt or waiting for more aid.",
            "You borrow $600 for the transition. The loan accrues 6% APR in modeled months; the budget previews interest and affordable payments.",
            {
              path: "College",
              loan: 600,
              life: {
                monthlyIncome: 1000,
                tuition: 200,
                payment: 50,
                study: life.study + 1,
                variableIncome: false,
              },
              detail:
                "180m · borrow $600 now · 6% APR · up to $50/month payment",
            },
          ),
          c(
            "life-employment",
            "Choose full-time employment",
            240,
            0,
            "Time for a longer education program.",
            "You choose a steady job. Workplace learning remains available.",
            {
              path: "Employment",
              life: { monthlyIncome: 1800, tuition: 0, variableIncome: false },
              flag: "employment-route",
              detail: "240m · $1,800/month take-home · no tuition",
            },
          ),
          c(
            "life-trades",
            trained
              ? "Continue with a paid apprenticeship"
              : "Start a supported trades course",
            180,
            0,
            "A higher wage before training.",
            trained
              ? "Your earlier workshop or lowrider practice helps you enter a paid apprenticeship."
              : "You start a training course while working. A later placement remains possible.",
            {
              path: "Trades",
              life: {
                monthlyIncome: trained ? 1500 : 1100,
                tuition: trained ? 0 : 100,
                study: life.study + 1,
                variableIncome: false,
              },
              flag: "trades-route",
              detail: `180m · $${trained ? 1500 : 1100}/month take-home · tuition $${trained ? 0 : 100}/month`,
            },
          ),
          c(
            "life-independent",
            "Build independent neighborhood work",
            180,
            0,
            "The predictability of a regular paycheck.",
            "You build on local demand. Income varies between modeled months; the budget preview shows the amount.",
            {
              path: "Independent work",
              life: {
                monthlyIncome: s.flags.includes("project") ? 1500 : 1200,
                tuition: 0,
                study: life.study + 1,
                variableIncome: true,
              },
              flag: "independent-route",
              detail:
                "180m · $1,200–$1,500 base monthly income · variable demand",
            },
          ),
        ];
        break;
      }
      case 16:
        text =
          "More paid hours can cover bills. Fewer hours can leave room for a class, family, or recovery.";
        choices = [
          c(
            "life-long-hours",
            "Take the longer paid schedule",
            360,
            0,
            "Evening study and time with people you care about.",
            "You commit more hours. Your modeled take-home income rises $300 per month.",
            {
              life: { monthlyIncome: life.monthlyIncome + 300 },
              detail: "360m · +$300/month take-home · less time today",
            },
          ),
          c(
            "life-protect-study",
            "Protect time for learning",
            180,
            0,
            "The extra $300 a month from longer hours.",
            "You keep the smaller work schedule and complete a learning milestone.",
            {
              skill: 2,
              life: { study: life.study + 1 },
              detail: "180m · current income unchanged · +1 learning milestone",
            },
          ),
          c(
            "life-flex-hours",
            "Negotiate flexible hours",
            180,
            0,
            "The larger paycheck from the long schedule.",
            "Your earlier work connection helps you arrange flexible hours and a modest raise.",
            {
              requires: "orientation",
              requiresLabel:
                "Requires the earlier paid orientation with Rivera.",
              life: {
                monthlyIncome: life.monthlyIncome + 100,
                study: life.study + 1,
              },
              detail: "180m · +$100/month · +1 learning milestone",
            },
          ),
        ];
        break;
      case 17:
        text =
          s.jordan >= 2
            ? "Jordan trusts you enough to discuss another housing arrangement. Each option changes privacy and bills."
            : "A rental opening offers privacy. Staying with family or sharing a room uses less cash.";
        scarcity = "Housing supply & cash · Privacy has value alongside rent.";
        choices = [
          c(
            "life-studio",
            "Move into a small studio",
            180,
            -350,
            "Keeping the deposit and sharing lower housing costs.",
            "You pay a one-time $350 deposit. Monthly rent becomes $850; a quiet space is available.",
            {
              housing: "Small studio",
              rent: 850,
              flag: "quiet-space",
              detail: "180m · $350 deposit now · $850/month rent",
            },
          ),
          c(
            "life-shared",
            "Share a smaller room with Jordan",
            180,
            -100,
            "More privacy and personal space.",
            "You pay a $100 room-change cost and share rent at $400 per month.",
            {
              housing: "Shared room with Jordan",
              rent: 400,
              friends: 1,
              detail: "180m · $100 room-change cost · $400/month rent",
            },
          ),
          c(
            "life-family",
            "Stay with family while learning or working",
            120,
            0,
            "The privacy of an independent home.",
            "You live with Aunt Elena. The modeled household contribution is $160 per month.",
            {
              housing: "With Aunt Elena",
              rent: 0,
              family: 1,
              detail: "120m · no deposit · $160/month contribution",
            },
          ),
        ];
        break;
      case 18:
        text =
          s.transport.includes("bicycle") || s.transport === "Bicycle"
            ? "Your bicycle needs work, and the route is changing. Transport still takes resources."
            : "The route is changing. A free fare does not guarantee a trip that fits your schedule.";
        scarcity =
          "Transport service, equipment & debt · Read future costs too.";
        choices = [
          c(
            "life-transit",
            "Replan around buses and walking",
            180,
            0,
            "The flexibility of a bicycle or car.",
            "You use buses and walking. Essentials, including food and travel, become $400 per month.",
            {
              transport: "City bus and walking",
              life: { essentials: 400 },
              detail: "180m · no fare · $400/month essentials",
            },
          ),
          c(
            "life-bike",
            "Buy or repair a practical bicycle",
            120,
            -100,
            "Keeping $100 for bills or learning.",
            "You pay $100 for a repair or refurbished bike. Essentials become $350 per month.",
            {
              transport: "Bicycle",
              life: { essentials: 350 },
              detail: "120m · $100 now · $350/month essentials",
            },
          ),
          c(
            "life-car",
            "Finance a modest used car",
            120,
            0,
            "Avoiding a loan and higher running costs.",
            "You take a $1,200 car loan. Essentials become $650 per month; the loan has 6% APR in modeled months.",
            {
              loan: 1200,
              transport: "Used car",
              life: { essentials: 650, payment: 100 },
              detail:
                "120m · $1,200 new loan · 6% APR · up to $100/month payment",
            },
          ),
          c(
            "life-support-ride",
            "Arrange a trusted shared ride",
            90,
            0,
            "The independence of owning transport.",
            "Your connection with Alex opens a shared ride. You share fuel costs through the modeled monthly budget.",
            {
              minAlex: 2,
              transport: "Shared ride with Alex",
              life: { essentials: 380 },
              alex: 1,
              detail: "90m · no purchase · $380/month essentials",
            },
          ),
        ];
        break;
      case 19:
        text =
          "Aunt Elena needs a follow-up visit. The clinic’s limited appointments overlap with paid work.";
        scarcity =
          "Care & appointment access · A schedule can constrain people without their choosing it.";
        choices = [
          c(
            "life-care",
            "Take unpaid time to accompany Elena",
            240,
            -80,
            "The $80 of wages and time you would keep.",
            "You give up $80 of pay to go with Elena. She has someone beside her at the visit.",
            {
              family: 2,
              wellbeing: 1,
              flag: "care-visit",
              detail: "240m · lose $80 pay · support Elena",
            },
          ),
          c(
            "life-care-network",
            "Coordinate a clinic support ride",
            180,
            0,
            "Going along yourself and hearing the visit firsthand.",
            "You contact a community ride service and a neighbor. Care happens through a wider support network.",
            {
              family: 1,
              flag: "care-network",
              detail: "180m · no cash cost · shared support",
            },
          ),
          c(
            "life-care-later",
            "Keep the shift and arrange a later visit",
            360,
            80,
            "The earlier appointment.",
            "You earn $80 and arrange a later clinic slot. Waiting for access is a real cost, even when you keep your wages.",
            {
              flag: "care-delayed",
              detail: "360m · earn $80 now · later appointment",
            },
          ),
        ];
        break;
      case 20:
        text = s.flags.includes("reference")
          ? "Rivera remembers your earlier reference request. A new position has opened."
          : "A new position opens, but not everyone can take the same opportunity.";
        scarcity =
          "Job openings, skills & uncertain demand · Earlier support can open a door.";
        choices = [
          c(
            "life-promotion",
            "Accept a supervisor position",
            300,
            0,
            "More time for learning or flexible work.",
            "You accept more responsibility with a modeled $2,100 monthly take-home income.",
            {
              minSkill: 4,
              life: {
                monthlyIncome: s.flags.includes("reference") ? 2200 : 2100,
                variableIncome: false,
              },
              flag: "supervisor",
              detail: `300m · $${s.flags.includes("reference") ? 2200 : 2100}/month · regular wages`,
            },
          ),
          c(
            "life-placement",
            "Take a skilled training placement",
            240,
            0,
            "Higher immediate pay without further learning.",
            "You combine paid practice and further learning. A credential is still something to complete, not a promise.",
            {
              minStudy: 1,
              skill: 2,
              life: {
                monthlyIncome: 1700,
                tuition: 0,
                study: life.study + 1,
                variableIncome: false,
              },
              flag: "placement",
              detail: "240m · $1,700/month · +1 learning milestone",
            },
          ),
          c(
            "life-business",
            "Invest in independent work",
            240,
            -150,
            "A steady paycheck and the $150 in equipment.",
            "You invest $150 in equipment. Local demand makes modeled income vary around $1,800 per month.",
            {
              path: "Independent work",
              life: { monthlyIncome: 1800, variableIncome: true },
              flag: "business",
              detail:
                "240m · $150 equipment · $1,800/month base, variable demand",
            },
          ),
          c(
            "life-keep-job",
            "Keep the current work arrangement",
            120,
            0,
            "The new opening or business expansion.",
            "You keep the arrangement you know. Stability can matter alongside advancement.",
            { wellbeing: 1 },
          ),
        ];
        break;
      case 21:
        text =
          "Local rents are rising. You can stay, share space, or move back with family while you reconsider.";
        scarcity =
          "Housing market & existing commitments · Costs can rise without a personal mistake.";
        choices = [
          c(
            "life-rent-rise",
            "Keep the home and accept the rent increase",
            120,
            0,
            "The lower cash cost of sharing or moving.",
            "Your monthly housing cost rises $100. The budget will show what that leaves for other needs.",
            {
              rent: s.rent ? s.rent + 100 : 0,
              life: s.rent
                ? {}
                : {
                    familyContribution: (life.familyContribution || 160) + 100,
                  },
              housing: s.housing,
              detail: `120m · housing becomes $${(s.rent || life.familyContribution || 160) + 100}/month`,
            },
          ),
          c(
            "life-share-rent",
            "Share a home with Jordan",
            180,
            -75,
            "The space and privacy of the current home.",
            "You pay $75 to move and share rent at $450 per month.",
            {
              minJordan: 2,
              housing: "Shared home with Jordan",
              rent: 450,
              friends: 1,
              detail: "180m · $75 moving cost · $450/month rent",
            },
          ),
          c(
            "life-return-family",
            "Make a new agreement with Aunt Elena",
            180,
            0,
            "Independent space and some privacy.",
            "You agree to a $160 monthly contribution at home. Returning is a change of plan, not a failure.",
            {
              housing: "With Aunt Elena",
              rent: 0,
              family: 1,
              detail: "180m · no moving charge · $160/month contribution",
            },
          ),
        ];
        break;
      case 22:
        text = `You have completed ${life.study} learning milestones while exploring ${s.path.toLowerCase()}. What should come next?`;
        scarcity =
          "Learning access & changing goals · Your earlier experience is still yours.";
        choices = [
          c(
            "life-finish-learning",
            "Complete the learning goal you prepared for",
            180,
            0,
            "Moving straight into more paid work.",
            "You complete the credential or portfolio you prepared across these years. It expands options without guaranteeing a job.",
            {
              minStudy: 3,
              life: {
                credential:
                  s.path === "College"
                    ? "Associate degree"
                    : s.path === "Trades"
                      ? "Career-training certificate"
                      : s.path === "Employment"
                        ? "Workplace development credential"
                        : "Independent-work portfolio",
                tuition: 0,
                study: life.study + 1,
              },
              skill: 2,
              flag: "credential",
              detail: "180m · needs 3 learning milestones · tuition ends",
            },
          ),
          c(
            "life-switch",
            "Change direction with a bridge course",
            180,
            -50,
            "Finishing the current goal on its original schedule.",
            "You use earlier skills in a bridge course. The $50 and time are a cost of changing direction; your experience is retained.",
            {
              path: (
                {
                  College: "Trades",
                  Trades: "Employment",
                  Employment: "Independent work",
                  "Independent work": "College",
                } as const
              )[s.path],
              life: {
                credential: "Bridge course and transferable experience",
                study: life.study + 1,
                tuition: 0,
              },
              skill: 1,
              flag: "changed-direction",
              detail: "180m · $50 bridge course · +1 learning milestone",
            },
          ),
          c(
            "life-experience",
            "Build on work and community experience",
            180,
            0,
            "A formal credential in this period.",
            "You document what you can do and who can speak to your experience. Formal study can remain a future option.",
            {
              life: {
                credential: "Documented work and community experience",
                tuition: 0,
              },
              skill: 1,
              wellbeing: 1,
              flag: "experience-route",
            },
          ),
        ];
        break;
      case 23:
        text =
          "Alex asks what you want to make room for next. Money is one resource; relationships, health, and purpose matter too.";
        scarcity = "Your priorities · No option is a winning score.";
        choices = [
          c(
            "life-priority-security",
            "Prioritize financial breathing room",
            90,
            0,
            "More flexible time or a new learning commitment.",
            "You plan to protect a buffer while keeping other possibilities open.",
            {
              flag: "priority-security",
              life: { payment: Math.min(100, s.loan) },
            },
          ),
          c(
            "life-priority-connection",
            "Protect time for people and wellbeing",
            90,
            0,
            "More paid hours or faster financial progress.",
            "You make connection part of your plan, not a reward you must earn first.",
            { alex: 1, wellbeing: 2, flag: "priority-connection" },
          ),
          c(
            "life-priority-learning",
            "Keep learning and changing direction",
            90,
            0,
            "The certainty of staying with one familiar plan.",
            "You leave room to learn again. Your choices so far are part of a beginning, not a final ranking.",
            { life: { study: life.study + 1 }, flag: "priority-learning" },
          ),
        ];
        break;
    }
    return withCommute(
      {
        ...base,
        text,
        scarcity,
        choices: choices.map((v) => ({ ...v, main: true })),
      },
      s,
    );
  }
  if (base.id === "college") {
    text = s.flags.includes("attended")
      ? "Mr. Chen remembers your first workshop. You can build on it without staying on the same pathway forever."
      : "Mr. Chen can help with study, aid, or a change of direction.";
    choices = [
      c(
        "life-optional-study",
        "Make time for a learning milestone",
        210,
        0,
        "Extra wages, rest, or family time.",
        "You complete a substantial piece of learning over this period.",
        { life: { study: life.study + 1 }, skill: 1 },
      ),
      c(
        "life-aid",
        "Apply for a local learning grant",
        120,
        0,
        "Using that time for a longer study session.",
        "You complete the aid process. The model lowers ongoing tuition by $75; access to funding changes a budget.",
        {
          life: { tuition: Math.max(0, life.tuition - 75) },
          flag: "life-aid",
          detail: "120m · no fee · tuition reduced by up to $75/month",
        },
      ),
    ];
  } else if (base.id === "work") {
    text =
      "Rivera has a paid shift for this representative day. The monthly budget is separate from this extra shift.";
    choices = [
      c(
        "life-extra-shift",
        "Take an extra paid shift",
        300,
        100,
        "A long study session or time with people.",
        "You earn $100 of extra cash beyond modeled regular income.",
        { skill: 1 },
      ),
      c(
        "life-work-talk",
        "Talk through a manageable schedule",
        90,
        0,
        "Today’s extra paycheck.",
        "You plan around what you need to sustain, not only what you can earn.",
        { wellbeing: 1 },
      ),
    ];
  } else if (base.id === "home") {
    text = s.flags.includes("care-visit")
      ? "Elena remembers that you accompanied her to the clinic. You can talk about how life has changed."
      : s.flags.includes("care-delayed")
        ? "Elena eventually got a later clinic visit. The wait was part of the cost of limited access."
        : "Elena wants to hear what you need, as well as what you can do for others.";
    choices = [
      c(
        "life-family-time",
        "Spend an afternoon with Elena",
        120,
        0,
        "Extra paid work.",
        "You keep a family connection through changing circumstances.",
        { family: 1, wellbeing: 2 },
      ),
      c(
        "life-family-plan",
        "Plan how to share family responsibilities",
        90,
        0,
        "Spontaneous time together.",
        "You make responsibilities visible so they can be shared.",
        { family: 1 },
      ),
    ];
  } else if (base.id === "apartment") {
    text =
      "Jordan is still making choices too. Bills, space, and support do not stay fixed forever.";
    const owed = Math.min(100, s.debt);
    choices = [
      c(
        "life-pay-balance",
        owed ? "Pay toward an unpaid bill" : "Move $100 into savings",
        60,
        -(owed || 100),
        owed
          ? "Keeping cash available for this month."
          : "Keeping $100 ready to spend.",
        owed
          ? "You reduce an unpaid balance without pretending the earlier shortfall never happened."
          : "You move $100 from spending to savings. Your total cash resources do not increase.",
        owed ? { debt: -owed } : { savings: 100 },
      ),
      c(
        "life-jordan",
        "Coordinate household responsibilities",
        120,
        0,
        "More time for paid work.",
        "You share information and build trust with Jordan.",
        { friends: 1, wellbeing: 1 },
      ),
    ];
  } else if (base.id === "bus") {
    text =
      "Transport still connects your plans. You can compare a change or keep a route that fits.";
    choices = [
      c(
        "life-ride-check",
        "Plan connections with Alex",
        90,
        0,
        "An extra paid hour.",
        "You make time for Alex and compare travel plans.",
        { alex: 1, friends: 1, wellbeing: 1 },
      ),
      c(
        "life-bus-plan",
        "Use buses and walking",
        90,
        0,
        "The convenience of an owned vehicle.",
        "You choose a lower-cost travel arrangement. Essentials become $400 per month.",
        { transport: "City bus and walking", life: { essentials: 400 } },
      ),
    ];
  } else if (base.id === "lowrider") {
    text =
      "Luis remembers the neighborhood builders who keep learning together. Tools and practice can connect generations.";
    choices = [
      c(
        "life-luis",
        "Practice a repair with Luis",
        120,
        0,
        "Paid work during these hours.",
        "You use a shared tool and practice a skill without buying a full workshop.",
        { skill: 1, parts: 1 },
      ),
      c(
        "life-luis-story",
        "Share the lowrider’s story with a new graduate",
        60,
        0,
        "A paid task.",
        "You pass on a piece of neighborhood knowledge.",
        { wellbeing: 2, friends: 1 },
      ),
    ];
  } else if (base.id === "mural") {
    text =
      "The mural has changed since graduation. Your place in the neighborhood can change too.";
    choices = [
      c(
        "life-mural",
        "Contribute to the community mural",
        90,
        -5,
        "Keeping $5 and time for another plan.",
        "You add something to a shared place.",
        { wellbeing: 2 },
      ),
      c(
        "life-mural-story",
        "Listen to a new neighbor’s story",
        60,
        0,
        "Time for paid work.",
        "You learn about someone’s different resources and choices.",
        { friends: 1, wellbeing: 1 },
      ),
    ];
  } else {
    text =
      s.alex >= 2
        ? "Your friendship with Alex has lasted through changes. A walk does not need to produce a paycheck."
        : "Alex would like to reconnect. It is possible to make room for friendship again.";
    choices = [
      c(
        "life-alex",
        "Walk and reconnect with Alex",
        90,
        0,
        "An extra paid task.",
        "You listen to each other and make plans to keep in touch.",
        { alex: 1, friends: 1, wellbeing: 2 },
      ),
      c(
        "life-rest",
        "Rest under the cottonwoods",
        60,
        0,
        "Another activity today.",
        "You protect time for recovery.",
        { wellbeing: 2 },
      ),
    ];
  }
  // Learning supports continue into later chapters, with the final cost visible.
  if (base.id === "college")
    choices = choices.map((v) => {
      const reduction =
        (s.flags.includes("quiet-space") && !s.flags.includes("smaller-room")
          ? 30
          : 0) + (s.wellbeing >= 4 ? 15 : 0);
      return {
        ...v,
        time: Math.max(30, v.time - reduction),
        detail: `${Math.max(30, v.time - reduction)}m total · ${v.id === "life-aid" ? "tuition support" : "no cash cost"}${reduction ? " · study support included" : ""}`,
      };
    });
  return withCommute({ ...base, text, scarcity, choices }, s);
}

function withCommute(location: Location, s: State): Location {
  const delay =
    ["work", "college"].includes(location.id) &&
    s.transport.toLowerCase().includes("bus")
      ? 60
      : 0;
  if (!delay) return location;
  return {
    ...location,
    choices: location.choices.map((v) => ({
      ...v,
      time: v.time + delay,
      detail: `${v.time + delay}m total · ${v.detail.replace(/^\d+m(?: total)? · /, "")} · includes 60m bus travel`,
    })),
  };
}
