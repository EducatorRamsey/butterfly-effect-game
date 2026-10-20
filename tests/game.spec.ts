import { test, expect, type Page } from "@playwright/test";
const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()} ${response.url()}`);
  });
});
test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page)).toEqual([]);
});
const key = "butterfly-effect-v1";
async function start(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin your story" }).click();
  await page.getByRole("button", { name: "Explore my neighborhood" }).click();
  await expect(page.locator("canvas")).toBeVisible();
  await page.waitForTimeout(300);
}
async function visit(page: Page, name: string) {
  await page
    .getByRole("navigation", { name: "Visit a location" })
    .getByRole("button", { name })
    .click();
  await expect(page.locator("dialog")).toBeVisible();
}
async function close(page: Page) {
  await page.getByRole("button", { name: "Close dialogue" }).click();
}
async function saved(page: Page) {
  return page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), key);
}
test("complete connected chapter, narration, saves and restart", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  await start(page);
  await expect(page.locator("#money")).toHaveText("$320");
  await visit(page, "Family home");
  await expect(page.getByRole("heading", { name: "Aunt Elena" })).toBeVisible();
  await page
    .getByRole("button", { name: "Help Elena with the delivery" })
    .click();
  await expect(page.locator("#clock")).toHaveText("11:05 AM");
  await expect(
    page.getByText("Elena feels supported.", { exact: false }).first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await visit(page, "Mesa Training Center");
  await page
    .getByRole("button", { name: "Reserve the funded training seat" })
    .click();
  await expect(page.locator("#money")).toHaveText("$240");
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await visit(page, "Central Avenue bus stop");
  await expect(
    page.getByRole("button", { name: "Coordinate a workshop carpool" }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Coordinate a workshop carpool" })
    .click();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await page
    .getByRole("button", { name: "Time in the day", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Keep exploring →", exact: true })
    .click();
  await visit(page, "Rivera Market");
  await page
    .getByRole("button", { name: "Choose a short paid orientation" })
    .click();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await visit(page, "Juniper Apartments");
  await expect(
    page.getByRole("button", { name: "Apply for the shared room" }),
  ).toContainText("$200 deposit after Elena");
  await page.getByRole("button", { name: "Apply for the shared room" }).click();
  await expect(page.locator("#money")).toHaveText("$45");
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await page.getByRole("button", { name: "Decision journal" }).click();
  await expect(
    page.getByText("Shared room with Jordan", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("$120/week expected income · $500/month rent", {
      exact: true,
    }),
  ).toBeVisible();
  await close(page);
  await page.getByRole("button", { name: "Listen", exact: true }).click();
  await page.locator("#speed").selectOption("0.85");
  await expect(page.locator("#speed")).toHaveValue("0.85");
  await page.getByRole("button", { name: "Replay", exact: true }).click();
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await page.getByLabel("Auto-narrate").check();
  await page.getByLabel("Auto-narrate").uncheck();
  await page.reload();
  await page.getByRole("button", { name: "Continue saved story" }).click();
  await expect(page.locator("#money")).toHaveText("$45");
  await expect(page.locator("#count")).toHaveText("5 commitments today");
  await page.getByRole("button", { name: "Finish the day" }).click();
  await page.getByRole("button", { name: "Finish and reflect" }).click();
  await expect(page.getByText("DAY 1 · COMPLETE")).toBeVisible();
  expect((await saved(page)).ended).toBe(true);
  await page.getByRole("button", { name: "Explore another story" }).click();
  await page
    .getByRole("button", { name: "Start a new story", exact: true })
    .click();
  await page.locator("#starting-path").selectOption("Employment");
  await page.getByRole("button", { name: "Begin your story" }).click();
  await page
    .getByRole("button", { name: "Begin new game", exact: true })
    .click();
  await page.getByRole("button", { name: "Explore my neighborhood" }).click();
  await expect(page.locator("#money")).toHaveText("$480");
  await expect(page.locator("#count")).toHaveText("0 commitments today");
  expect(errors).toEqual([]);
});
test("movement, collision, nearby keyboard interaction, map and touch", async ({
  page,
}) => {
  await start(page);
  const canvas = page.locator("canvas");
  await canvas.focus();
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(700);
  await page.keyboard.up("ArrowRight");
  await page.waitForTimeout(1200);
  const moved = await saved(page);
  expect(moved.x).toBeGreaterThan(430);
  // Travel to a doorway, close dialogue and walk into the building. Collision keeps feet outside.
  await visit(page, "Family home");
  await close(page);
  await canvas.focus();
  await page.keyboard.down("ArrowUp");
  await page.waitForTimeout(1300);
  await page.keyboard.up("ArrowUp");
  await page.waitForTimeout(200);
  expect((await saved(page)).y).toBeGreaterThanOrEqual(430);
  await page.keyboard.press("e");
  await expect(page.getByRole("heading", { name: "Aunt Elena" })).toBeVisible();
  await close(page);
  await page.getByRole("button", { name: "Locations →" }).click();
  await page.locator('[data-travel="college"]').click();
  await expect(page.getByRole("heading", { name: "Mr. Chen" })).toBeVisible();
  await close(page);
  const touchButton = page.getByRole("button", {
    name: "Move right",
    exact: true,
  });
  await touchButton.scrollIntoViewIfNeeded();
  const box = (await touchButton.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();
  await page.getByLabel("Reduce motion").check();
  await expect(page.locator("body")).toHaveClass("reduced");
});
test("time scarcity closes opportunities and preserves unavailable choices", async ({
  page,
}) => {
  await start(page);
  await visit(page, "Rivera Market");
  await page.getByRole("button", { name: "Take the longer shift" }).click();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await visit(page, "Mesa Training Center");
  const training = page.getByRole("button", {
    name: "Reserve the funded training seat",
  });
  await expect(training).toBeDisabled();
  await expect(training).toContainText("closed for today");
  await page
    .getByRole("button", { name: "Join the next workshop waitlist" })
    .click();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await visit(page, "Central Avenue bus stop");
  await expect(
    page.getByRole("button", { name: "Coordinate a workshop carpool" }),
  ).toBeDisabled();
  expect((await saved(page)).money).toBe(416);
});
test("modal keyboard trap, pathway change, insufficient funds and narrow display", async ({
  page,
}) => {
  await start(page);
  await page.getByRole("button", { name: "College →", exact: true }).click();
  await page.getByRole("button", { name: "Trades", exact: true }).click();
  await expect(page.locator("#path")).toContainText("Trades");
  await visit(page, "Central Avenue bus stop");
  await page.getByRole("button", { name: "Buy a refurbished bicycle" }).click();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await visit(page, "Juniper Apartments");
  await expect(
    page.getByRole("button", { name: "Apply for the shared room" }),
  ).toBeDisabled();
  await page.keyboard.press("Tab");
  expect(
    await page.evaluate(() => !!document.activeElement?.closest("dialog")),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).not.toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("button", { name: "Locations →" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("narration includes the whole conversation and choices at the selected speed", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const records: { text: string; rate: number }[] = [];
    Object.defineProperty(window, "__spoken", { value: records });
    Object.defineProperty(window.speechSynthesis, "speak", {
      value: (u: SpeechSynthesisUtterance) =>
        records.push({ text: u.text, rate: u.rate }),
    });
    Object.defineProperty(window.speechSynthesis, "cancel", {
      value: () => {},
    });
  });
  await start(page);
  await page.locator("#speed").selectOption("1.3");
  await visit(page, "Family home");
  // Native modal dialogs intentionally contain focus. Narration controls also live in each panel.
  await page.getByRole("button", { name: "Listen to this panel" }).click();
  const spoken = await page.evaluate(
    () =>
      (
        window as unknown as { __spoken: { text: string; rate: number }[] }
      ).__spoken.at(-1)!,
  );
  expect(spoken.text).toContain("Aunt Elena");
  expect(spoken.text).toContain("Help Elena with the delivery");
  expect(spoken.text).toContain("Use the laptop for a scholarship");
  expect(spoken.text).toContain("Rest and plan your next step");
  expect(spoken.rate).toBeCloseTo(1.3, 5);
});
