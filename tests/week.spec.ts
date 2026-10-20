import { test, expect, type Page } from "@playwright/test";
const KEY = "butterfly-effect-v1";
const failures = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  failures.set(page, errors);
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
});
test.afterEach(async ({ page }) => expect(failures.get(page)).toEqual([]));
async function begin(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin your story" }).click();
  await page.getByRole("button", { name: "Explore my neighborhood" }).click();
  await expect(page.locator("canvas")).toBeVisible();
  await page.waitForTimeout(250);
}
async function visit(page: Page, id: string) {
  await page.locator(`[data-place="${id}"]`).click();
  await expect(page.locator("dialog")).toBeVisible();
}
async function choose(page: Page, label: string) {
  await page.getByRole("button", { name: label }).click();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  if (
    await page
      .getByRole("heading", { name: "What was hardest to make room for?" })
      .isVisible()
  ) {
    await page
      .getByRole("button", { name: "Time in the day", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Keep exploring →", exact: true })
      .click();
  }
}
async function finish(page: Page) {
  await page.getByRole("button", { name: "Finish the day" }).click();
  await page.getByRole("button", { name: "Finish and reflect" }).click();
}
async function advance(page: Page) {
  await finish(page);
  await page.getByRole("button", { name: "Start the next day" }).click();
  await page
    .getByRole("button", { name: "Start today →", exact: true })
    .click();
}
async function state(page: Page) {
  return page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), KEY);
}
async function close(page: Page) {
  await page.getByRole("button", { name: "Close dialogue" }).click();
}

test("play all seven days with work, a reserved workshop, housing and two reflections", async ({
  page,
}) => {
  await begin(page);
  await visit(page, "home");
  await choose(page, "Help Elena with the delivery");
  await visit(page, "college");
  await choose(page, "Reserve the funded training seat");
  await visit(page, "work");
  await choose(page, "Choose a short paid orientation");
  await visit(page, "apartment");
  await choose(page, "Apply for the shared room");
  expect((await state(page)).money).toBe(60);
  await advance(page);
  await expect(page.locator("#day-label")).toContainText("Day 2 of 7");
  await expect(page.locator("#count")).toHaveText("0 / 5 today");
  await page.getByRole("button", { name: "Week calendar" }).click();
  await expect(page.locator(".calendar-grid li")).toHaveCount(7);
  await expect(
    page.getByText("Friday housing: $125.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back to today" }).click();
  await visit(page, "work");
  await choose(page, "Agree to a flexible work schedule");
  expect((await state(page)).money).toBe(60); // scheduling is not wages
  await advance(page);
  await visit(page, "work");
  await choose(page, "Work a scheduled shift");
  expect((await state(page)).money).toBe(156);
  await visit(page, "home");
  await expect(
    page.getByRole("button", { name: "Go with Elena to the clinic" }),
  ).toBeDisabled();
  await choose(page, "Arrange another ride for Elena");
  await advance(page);
  await visit(page, "college");
  await expect(
    page.getByText("Your reserved seat is ready.", { exact: false }),
  ).toBeVisible();
  await choose(page, "Attend your reserved workshop");
  expect((await state(page)).flags).toContain("attended");
  await visit(page, "work");
  await choose(page, "Work the four-hour shift");
  expect((await state(page)).money).toBe(252);
  await advance(page);
  await visit(page, "college");
  await choose(page, "Practice at the shared tool bench");
  await visit(page, "apartment");
  await choose(page, "Buy shared groceries");
  expect((await state(page)).money).toBe(232);
  await page.reload();
  await page.getByRole("button", { name: "Continue saved story" }).click();
  await page
    .getByRole("button", { name: "Start today →", exact: true })
    .click();
  await expect(page.locator("#day-label")).toContainText("Day 5 of 7");
  await expect(page.locator("#count")).toHaveText("2 / 5 today");
  await advance(page);
  await visit(page, "work");
  await choose(page, "Complete the neighborhood project");
  expect((await state(page)).money).toBe(277);
  await advance(page);
  await visit(page, "college");
  await expect(
    page.getByText("You attended the workshop.", { exact: false }),
  ).toBeVisible();
  await choose(page, "Meet a mentor for next week");
  await finish(page);
  await expect(
    page.getByRole("heading", { name: "What changed your options?" }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Transport, services, or support",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("YOUR FIRST WEEK · COMPLETE", { exact: true }),
  ).toBeVisible();
  const done = await state(page);
  expect(done.day).toBe(7);
  expect(done.completed).toBe(true);
  expect(done.money).toBe(152);
  expect(done.savings).toBe(150);
  expect(done.debt).toBe(0);
  expect(
    done.ledger.filter(
      (e: { label: string }) => e.label === "Weekly room payment",
    ),
  ).toHaveLength(1);
  await expect(
    page.getByText("$125 from spending · $0 from savings · $0 left unpaid.", {
      exact: true,
    }),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download reflection" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(
    "my-butterfly-effect-reflection.txt",
  );
  await page.reload();
  await page.getByRole("button", { name: "Continue saved story" }).click();
  expect((await state(page)).money).toBe(152);
  await expect(
    page.getByRole("button", { name: "Start the next day" }),
  ).toHaveCount(0);
});

test("bus service change creates a conflict that a late ride cannot undo", async ({
  page,
}) => {
  await begin(page);
  await visit(page, "college");
  await choose(page, "Reserve the funded training seat");
  await advance(page);
  await visit(page, "bus");
  await choose(page, "Use the city bus this week");
  await advance(page);
  await advance(page);
  await visit(page, "work");
  await expect(
    page.getByRole("button", { name: "Work the four-hour shift" }),
  ).toContainText("+90m bus wait included");
  await choose(page, "Work the four-hour shift");
  await visit(page, "college");
  await expect(
    page.getByRole("button", { name: "Attend your reserved workshop" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Attend your reserved workshop" }),
  ).toContainText("Not enough time");
  await close(page);
  await visit(page, "bus");
  await choose(page, "Share a ride for today");
  await visit(page, "college");
  // A new ride cannot recover time already spent on the earlier commute.
  await expect(
    page.getByRole("button", { name: "Attend your reserved workshop" }),
  ).toBeDisabled();
  await close(page);
  await advance(page);
  expect((await state(page)).transport).toBe("City bus");
});

test("a completed legacy chapter continues without resetting resources or decisions", async ({
  page,
}) => {
  await begin(page);
  await visit(page, "home");
  await choose(page, "Help Elena with the delivery");
  await finish(page);
  const legacy = await state(page);
  delete legacy.day;
  delete legacy.completed;
  delete legacy.ledger;
  legacy.decisions.forEach((d: Record<string, unknown>) => {
    delete d.day;
    delete d.choiceId;
  });
  await page.addInitScript(
    ({ key, saved }) => localStorage.setItem(key, JSON.stringify(saved)),
    { key: KEY, saved: legacy },
  );
  await page.reload();
  await page.getByRole("button", { name: "Continue saved story" }).click();
  await expect(
    page.getByText("DAY 1 · COMPLETE", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start the next day" }).click();
  await page
    .getByRole("button", { name: "Start today →", exact: true })
    .click();
  const continued = await state(page);
  expect(continued.day).toBe(2);
  expect(continued.money).toBe(320);
  expect(continued.flags).toContain("family");
  expect(continued.decisions).toHaveLength(1);
  await visit(page, "home");
  await choose(page, "Plan work and learning time");
  expect((await state(page)).decisions).toHaveLength(2);
  await visit(page, "home");
  await expect(
    page.getByText("Your choice: Plan work and learning time", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("[data-choice]")).toHaveCount(0);
});

test("Friday shortfall draws savings once and records the unpaid balance", async ({
  page,
}) => {
  await begin(page);
  // Boundary fixture: a late-week save with limited funds. All settlement uses real UI.
  const lowFunds = {
    ...(await state(page)),
    day: 7,
    money: 10,
    savings: 20,
    rent: 500,
    housing: "Shared room with Jordan",
  };
  await page.addInitScript(
    ({ key, saved }) => localStorage.setItem(key, JSON.stringify(saved)),
    { key: KEY, saved: lowFunds },
  );
  await page.reload();
  await page.getByRole("button", { name: "Continue saved story" }).click();
  await page
    .getByRole("button", { name: "Start today →", exact: true })
    .click();
  await finish(page);
  await page
    .getByRole("button", { name: "Money and housing costs", exact: true })
    .click();
  await expect(
    page.getByText("$10 from spending · $20 from savings · $95 left unpaid.", {
      exact: true,
    }),
  ).toBeVisible();
  let s = await state(page);
  expect(s.money).toBe(0);
  expect(s.savings).toBe(0);
  expect(s.debt).toBe(95);
  await close(page);
  await page.getByRole("button", { name: "Finish the day" }).click();
  s = await state(page);
  expect(s.debt).toBe(95);
  expect(s.ledger).toHaveLength(1);
});

test("later opportunity deadlines and narration respect optional reading", async ({
  page,
}) => {
  await begin(page);
  await advance(page);
  await advance(page);
  await advance(page);
  await advance(page);
  await visit(page, "work");
  await choose(page, "Take the paid trial"); // no prior job connection
  await visit(page, "college");
  await expect(
    page.getByRole("button", { name: "Practice at the shared tool bench" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Practice at the shared tool bench" }),
  ).toContainText("closed for today");
  await expect(
    page.getByText("hands-on time with the shared tools.", { exact: false }),
  ).not.toBeVisible();
  await page
    .getByText("Tell me more about the trade-offs", { exact: true })
    .click();
  await expect(
    page.getByText("hands-on time with the shared tools.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Listen to this panel" }).click();
  await page.getByRole("button", { name: "Stop panel narration" }).click();
  await page
    .getByLabel("Panel narration speed", { exact: true })
    .selectOption("0.7");
  await expect(
    page.getByLabel("Panel narration speed", { exact: true }),
  ).toHaveValue("0.7");
});

test("an earlier carpool preserves time for both work and training", async ({
  page,
}) => {
  await begin(page);
  await visit(page, "college");
  await choose(page, "Reserve the funded training seat");
  await visit(page, "bus");
  await choose(page, "Coordinate a workshop carpool");
  await advance(page);
  await advance(page);
  await advance(page);
  await visit(page, "work");
  await expect(
    page.getByRole("button", { name: "Work the four-hour shift" }),
  ).not.toContainText("bus wait");
  await choose(page, "Work the four-hour shift");
  await visit(page, "college");
  await expect(
    page.getByRole("button", { name: "Attend your reserved workshop" }),
  ).toBeEnabled();
  await choose(page, "Attend your reserved workshop");
  expect((await state(page)).flags).toContain("attended");
});
