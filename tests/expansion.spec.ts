import { test, expect, type Page } from "@playwright/test";
const KEY = "butterfly-effect-v1";
const errors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const list: string[] = [];
  errors.set(page, list);
  page.on("pageerror", (e) => list.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) list.push(`${r.status()} ${r.url()}`);
  });
});
test.afterEach(({ page }) => expect(errors.get(page)).toEqual([]));
async function read(page: Page) {
  return page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), KEY);
}
async function start(page: Page) {
  await page.goto("/");
  await page.locator("#starting-path").selectOption("Trades");
  await page.getByRole("button", { name: "Begin your story" }).click();
  await expect(page.locator("#dialog-content")).toContainText(
    "your aunt, Elena",
  );
  await page.getByRole("button", { name: "Explore my neighborhood" }).click();
  await page.waitForTimeout(300);
}
async function visit(page: Page, id: string) {
  await page.locator(`[data-place="${id}"]`).click();
  await expect(page.locator("dialog")).toBeVisible();
}
async function close(page: Page) {
  await page.getByRole("button", { name: "Close dialogue" }).click();
}
async function choose(page: Page, label: string) {
  await page.getByRole("button", { name: label }).click();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  if (
    await page
      .getByRole("button", { name: "Time in the day", exact: true })
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
  if (
    await page
      .getByRole("button", { name: "Money and housing costs", exact: true })
      .isVisible()
  )
    await page
      .getByRole("button", { name: "Money and housing costs", exact: true })
      .click();
}
async function next(page: Page) {
  await finish(page);
  await page.getByRole("button", { name: "Start the next day" }).click();
  await page
    .getByRole("button", { name: "Start today →", exact: true })
    .click();
}
async function fixture(page: Page, patch: Record<string, unknown>) {
  const s = { ...(await read(page)), ...patch };
  await page.addInitScript(
    ({ key, saved }) => {
      if (!sessionStorage.getItem("fixture-used")) {
        localStorage.setItem(key, JSON.stringify(saved));
        sessionStorage.setItem("fixture-used", "yes");
      }
    },
    { key: KEY, saved: s },
  );
  await page.reload();
  await page.getByRole("button", { name: "Continue saved story" }).click();
  if (
    await page
      .getByRole("button", { name: "Start today →", exact: true })
      .isVisible()
  )
    await page
      .getByRole("button", { name: "Start today →", exact: true })
      .click();
}

test("day 2 choices compete with the adviser deadline and calendar updates clear when read", async ({
  page,
}) => {
  await start(page);
  await next(page);
  await expect(page.locator("#calendar")).toContainText("new updates");
  await page.locator("#calendar").click();
  await expect(page.locator(".calendar-grid li")).toHaveCount(14);
  await expect(
    page.getByText("Today’s bulletin", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back to today" }).click();
  await expect(page.locator("#calendar")).toContainText("✓");
  await visit(page, "work");
  await choose(page, "Agree to a flexible work schedule");
  await visit(page, "college");
  await expect(
    page.getByRole("button", { name: "Prepare a learning plan" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Prepare a learning plan" }),
  ).toContainText("closed for today");
  await expect(
    page.getByRole("button", { name: "Use the free library resources" }),
  ).toBeEnabled();
});

test("lowrider, mural and bosque are playable and daily events persist across reload", async ({
  page,
}) => {
  await start(page);
  await page.locator("#calendar").click();
  const bulletin = await page.locator("#dialog-content .callout").innerText();
  await close(page);
  await visit(page, "lowrider");
  await choose(page, "Ask about the lowrider’s story");
  expect((await read(page)).flags).toContain("lowrider-story");
  await visit(page, "mural");
  await choose(page, "Listen to a neighbor’s story");
  await visit(page, "bosque");
  await choose(page, "Walk and talk with Alex");
  expect((await read(page)).alex).toBe(1);
  expect((await read(page)).wellbeing).toBe(5);
  await page.reload();
  await page.getByRole("button", { name: "Continue saved story" }).click();
  await page.locator("#calendar").click();
  expect(await page.locator("#dialog-content .callout").innerText()).toBe(
    bulletin,
  );
  expect((await read(page)).decisions).toHaveLength(3);
});

test("Alex connection unlocks support and a purchased bike remains available after the route change", async ({
  page,
}) => {
  await start(page);
  await fixture(page, { day: 4, transport: "City bus", alex: 0, money: 200 });
  await visit(page, "bus");
  await expect(
    page.getByRole("button", { name: "Borrow Alex’s spare bike" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Buy a refurbished bike" }),
  ).toBeEnabled();
  await close(page);
  await visit(page, "bosque");
  await choose(page, "Walk and talk with Alex");
  await next(page);
  await visit(page, "bus");
  await choose(page, "Visit the mural with Alex");
  expect((await read(page)).alex).toBe(2);
  await visit(page, "bosque");
  await expect(
    page.getByRole("button", { name: "Ask Alex to lend a bicycle" }),
  ).toBeEnabled();
  await choose(page, "Ask Alex to lend a bicycle");
  expect((await read(page)).transport).toBe("Borrowed bicycle");
});

test("food choices differ in cost, quantity and time; meals save real cash on a shift", async ({
  page,
}) => {
  await start(page);
  await fixture(page, { day: 5, money: 100 });
  await visit(page, "apartment");
  await expect(
    page.getByRole("button", { name: "Buy shared groceries" }),
  ).toContainText("60m");
  await expect(
    page.getByRole("button", { name: "Find community food resources" }),
  ).toContainText("120m");
  await choose(page, "Buy shared groceries");
  let s = await read(page);
  expect(s.money).toBe(80);
  expect(s.meals).toBe(3);
  await next(page);
  await next(page);
  await next(page);
  await visit(page, "work");
  await choose(page, "Work and bring a packed meal");
  s = await read(page);
  expect(s.meals).toBe(2);
  expect(s.money).toBe(136); // $80 minus $40 family bill plus $96 pay
});

test("completed old week saves enter week 2, and both weekly bills settle only once", async ({
  page,
}) => {
  await start(page);
  const legacy = await read(page);
  Object.assign(legacy, {
    day: 7,
    completed: true,
    ended: true,
    money: 240,
    savings: 100,
    flags: ["week-reflection"],
    ledger: [
      {
        day: 7,
        label: "Weekly household contribution",
        money: -40,
        savings: 0,
        debt: 0,
      },
    ],
  });
  for (const field of [
    "seed",
    "meals",
    "parts",
    "wellbeing",
    "alex",
    "jordan",
    "calendarChecked",
  ])
    delete legacy[field];
  await fixture(page, legacy);
  await expect(
    page.getByText("YOUR FIRST WEEK · COMPLETE", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start the next day" }).click();
  await page
    .getByRole("button", { name: "Start today →", exact: true })
    .click();
  await expect(page.locator("#day-label")).toContainText("Day 8 of 14");
  expect((await read(page)).money).toBe(240);
  for (let day = 8; day < 14; day++) await next(page);
  await finish(page);
  await expect(
    page.getByText("YOUR FIRST TWO WEEKS · COMPLETE", { exact: true }),
  ).toBeVisible();
  let s = await read(page);
  expect(s.money).toBe(200);
  expect(s.completed).toBe(true);
  expect(
    s.ledger.filter(
      (e: { label: string }) => e.label === "Weekly household contribution",
    ),
  ).toHaveLength(2);
  await page.reload();
  await page.getByRole("button", { name: "Continue saved story" }).click();
  s = await read(page);
  expect(s.money).toBe(200);
  await expect(
    page.getByRole("button", { name: "Start the next day" }),
  ).toHaveCount(0);
});

test("week 2 combines parts, skills, housing privacy and a career application", async ({
  page,
}) => {
  await start(page);
  await fixture(page, { day: 8, money: 400, skill: 4, parts: 1, jordan: 3 });
  await visit(page, "apartment");
  await choose(page, "Apply for the newly available room");
  expect((await read(page)).flags).toContain("quiet-space");
  await next(page);
  await visit(page, "college");
  await expect(
    page.getByRole("button", { name: "Complete a focused learning session" }),
  ).toContainText("180m total");
  await choose(page, "Complete a focused learning session");
  await next(page);
  await visit(page, "college");
  await choose(page, "Use the supervised tool bench");
  expect((await read(page)).parts).toBe(0);
  await next(page);
  await visit(page, "work");
  await expect(
    page.getByRole("button", { name: "Complete a paid co-op repair" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Complete a paid co-op repair" }),
  ).toContainText("Needs 1 repair part");
  await close(page);
  await next(page);
  await next(page);
  await visit(page, "college");
  await choose(page, "Apply for an apprenticeship");
  expect((await read(page)).flags).toContain("applied");
  await next(page);
  await finish(page);
  await expect(
    page.getByText("YOUR FIRST TWO WEEKS · COMPLETE", { exact: true }),
  ).toBeVisible();
});

test("different days ask different reflections and lower-rent housing changes the bill", async ({
  page,
}) => {
  await start(page);
  await fixture(page, { day: 9, jordan: 3, money: 400, transport: "Bicycle" });
  await visit(page, "apartment");
  await choose(page, "Apply for the smaller shared room");
  expect((await read(page)).rent).toBe(350);
  await finish(page);
  const first = await page.locator(".daily-reflection p").innerText();
  await page.getByRole("button", { name: "Start the next day" }).click();
  await page
    .getByRole("button", { name: "Start today →", exact: true })
    .click();
  await finish(page);
  expect(await page.locator(".daily-reflection p").innerText()).not.toBe(first);
  await close(page);
  await page.locator("#calendar").click();
  await expect(page.locator("#dialog-content")).toContainText(
    "Friday housing: $88",
  );
});

test("HTML controls cannot activate a building underneath their mouse coordinates", async ({
  page,
}) => {
  await start(page);
  const bounds = (await page.locator("canvas").boundingBox())!;
  await page
    .locator("#finish")
    .dispatchEvent("mousedown", {
      button: 0,
      buttons: 1,
      clientX: bounds.x + 285,
      clientY: bounds.y + 100,
    });
  await page.waitForTimeout(200);
  await expect(page.locator("dialog")).not.toBeVisible();
  await page.locator("#finish").click();
  await expect(
    page.getByRole("heading", { name: "Call it a day?" }),
  ).toBeVisible();
});
