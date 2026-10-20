import type { State, LifeProfile, BudgetMonth } from "./model";
import { stageForDay } from "./timeline";
export function startingLife(s: State): LifeProfile {
  return {
    monthlyIncome: Math.max(0, s.income * 4),
    essentials: 450,
    tuition: 0,
    payment: 0,
    study: s.flags.includes("attended") ? 1 : 0,
    credential: "Experience in progress",
    history: [],
  };
}
export function forecast(s: State): BudgetMonth {
  const life = s.life || startingLife(s),
    stage = stageForDay(s.day)!;
  const rent = s.rent || life.familyContribution || 160,
    interest = Math.round(s.loan * 0.005);
  const realizedIncome = Math.round(
    life.monthlyIncome *
      (life.variableIncome ? [0.75, 1, 1.15][(s.seed + s.day) % 3] : 1),
  );
  const payment = Math.min(
    life.payment,
    s.loan + interest,
    Math.max(
      0,
      s.money +
        s.savings +
        realizedIncome -
        rent -
        life.essentials -
        life.tuition,
    ),
  );
  const expense = rent + life.essentials + life.tuition + payment;
  const available = s.money + realizedIncome;
  const cashUsed = Math.min(available, expense),
    reserve = Math.min(s.savings, Math.max(0, expense - cashUsed)),
    unpaid = Math.max(0, expense - cashUsed - reserve);
  return {
    day: s.day,
    age: stage.age,
    income: realizedIncome,
    rent,
    essentials: life.essentials,
    tuition: life.tuition,
    payment,
    interest,
    cashAfter: available - cashUsed,
    savingsUsed: reserve,
    unpaid,
  };
}
export function settleMonth(s: State): State {
  const month = forecast(s),
    life = s.life!;
  return {
    ...s,
    money: month.cashAfter,
    savings: s.savings - month.savingsUsed,
    debt: s.debt + month.unpaid,
    loan: Math.max(0, s.loan + month.interest - month.payment),
    life: { ...life, history: [...life.history, month] },
    ledger: [
      ...s.ledger,
      {
        day: s.day,
        label: `Age ${month.age} representative month: take-home income`,
        money: month.income,
        savings: 0,
        debt: 0,
      },
      {
        day: s.day,
        label:
          "Representative month: housing, essentials, tuition and loan payment",
        money: -(month.income + s.money - month.cashAfter),
        savings: -month.savingsUsed,
        debt: month.unpaid,
      },
    ],
  };
}
