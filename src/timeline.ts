export const lifeStages = [
  {
    day: 15,
    chapter: 2,
    age: 19,
    season: "First autumn",
    title: "Finding a rhythm",
    required: "college",
    focus: "Choose how work and learning fit together.",
    context:
      "A year after graduation, your first choices have become habits. There is still time to change direction.",
    reflection:
      "Which resource limits your pathway: money, available places, or time?",
  },
  {
    day: 16,
    chapter: 2,
    age: 19,
    season: "First winter",
    title: "The hours between",
    required: "work",
    focus: "Choose between a longer paid schedule and time to study.",
    context:
      "Rivera can offer more hours. Mr. Chen has evening support, but the hours must fit around work.",
    reflection: "What is the next-best use of the hours you committed to work?",
  },
  {
    day: 17,
    chapter: 2,
    age: 20,
    season: "Second spring",
    title: "A place to keep going",
    required: "apartment",
    focus: "Choose housing as education and work continue.",
    context:
      "A new rental opening brings more privacy and a higher monthly bill. Shared space remains a real constraint.",
    reflection:
      "How did your housing choice affect money, privacy, and your ability to learn?",
  },
  {
    day: 18,
    chapter: 3,
    age: 20,
    season: "Second summer",
    title: "When plans meet setbacks",
    required: "bus",
    focus: "Respond to a transport setback without losing your next step.",
    context:
      "A route change and rising travel costs affect the neighborhood. People with different resources face different options.",
    reflection:
      "How much of this setback came from your choices, and how much came from the services available?",
  },
  {
    day: 19,
    chapter: 3,
    age: 20,
    season: "Second autumn",
    title: "Care has a cost",
    required: "home",
    focus: "A medical appointment and paid work compete.",
    context:
      "Aunt Elena has a follow-up appointment. You have your own work and learning commitments too.",
    reflection:
      "What made care possible? Name a cost that was not measured in dollars.",
  },
  {
    day: 20,
    chapter: 3,
    age: 21,
    season: "Third spring",
    title: "An opening, not a promise",
    required: "work",
    focus: "Choose a promotion, a skilled placement, or independent work.",
    context:
      "A vacancy opens while local demand is uneven. Your experience and relationships can open doors, but do not remove uncertainty.",
    reflection:
      "Which earlier decision or source of support changed the options you had today?",
  },
  {
    day: 21,
    chapter: 4,
    age: 21,
    season: "Third autumn",
    title: "A budget with history",
    required: "apartment",
    focus: "Respond to rising housing costs and earlier financial commitments.",
    context:
      "Rent is rising across the area. Saving, sharing a home, and paying an old balance all leave something else out.",
    reflection:
      "How did market conditions and past commitments shape your budget?",
  },
  {
    day: 22,
    chapter: 4,
    age: 21,
    season: "Fourth spring",
    title: "Changing direction",
    required: "college",
    focus: "Finish a learning goal or deliberately change your next step.",
    context:
      "Mr. Chen asks what you want now, rather than what you thought you wanted at 18. Skills and experience can transfer.",
    reflection:
      "What did you keep from your earlier pathway, and what did changing direction cost?",
  },
  {
    day: 23,
    chapter: 4,
    age: 22,
    season: "Looking ahead",
    title: "The life you are making",
    required: "bosque",
    focus: "Choose a priority, then create your Life Snapshot at 22.",
    context:
      "You meet Alex near the bosque. There is no finish-line score—only a life, its trade-offs, and possibilities still open.",
    reflection:
      "Choose one important decision. What was your next-best alternative, and what support or barrier shaped it?",
  },
] as const;
export function stageForDay(day: number) {
  return lifeStages.find((s) => s.day === day);
}
export const LAST_DAY = 23;

export function momentLabel(day: number) {
  const stage = stageForDay(day);
  return stage
    ? `Chapter ${stage.chapter} · Age ${stage.age} · ${stage.season}`
    : `Day ${day}`;
}
