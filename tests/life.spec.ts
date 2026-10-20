import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
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
async function start(page: Page, path = "College") {
  await page.goto("/");
  await page.locator("#starting-path").selectOption(path);
  await page.getByRole("button", { name: "Begin your story" }).click();
  await page.getByRole("button", { name: "Explore my neighborhood" }).click();
  await page.waitForTimeout(250);
}
async function visit(page: Page, id: string) {
  await page.locator(`[data-place="${id}"]`).click();
  await expect(page.locator("dialog")).toBeVisible();
}
async function choose(page: Page, label: string) {
  await page.getByRole("button", { name: label }).click();
  await page.locator("#result-next").click();
  if (
    await page
      .getByRole("button", { name: "Time in the day", exact: true })
      .isVisible()
  ) {
    await page
      .getByRole("button", { name: "Time in the day", exact: true })
      .click();
    await page.locator("#reflect-next").click();
  }
}
async function finish(page: Page) {
  await page.locator("#finish").click();
  await page.locator("#confirm-finish").click();
  if (
    await page
      .getByRole("button", { name: "Money and housing costs", exact: true })
      .isVisible()
  )
    await page
      .getByRole("button", { name: "Money and housing costs", exact: true })
      .click();
}
async function advance(page: Page) {
  await finish(page);
  await page.locator("#next-day").click();
  await page.locator("#morning-go").click();
}
async function fixture(page: Page, patch: Record<string, unknown>) {
  const saved = { ...(await read(page)), ...patch };
  await page.addInitScript(
    ({ key, s }) => {
      if (!sessionStorage.getItem("life-fixture")) {
        localStorage.setItem(key, JSON.stringify(s));
        sessionStorage.setItem("life-fixture", "yes");
      }
    },
    { key: KEY, s: saved },
  );
  await page.reload();
  await page.locator("#continue").click();
  if (await page.locator("#morning-go").isVisible())
    await page.locator("#morning-go").click();
}
const routes = [
  {
    path: "College",
    choice: "Study at college and work part-time",
    credential: "Associate degree",
  },
  {
    path: "Employment",
    choice: "Choose full-time employment",
    credential: "Workplace development credential",
  },
  {
    path: "Trades",
    choice: "Start a supported trades course",
    credential: "Career-training certificate",
  },
  {
    path: "Independent work",
    choice: "Build independent neighborhood work",
    credential: "Independent-work portfolio",
  },
];
for (const route of routes)
  test(`${route.path}: fresh story reaches age 22 and preserves a personalized snapshot`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.addInitScript(() => {
      const spoken: string[] = [];
      Object.defineProperty(window, "__lifeSpeech", { value: spoken });
      Object.defineProperty(window.speechSynthesis, "speak", {
        value: (u: SpeechSynthesisUtterance) => spoken.push(u.text),
      });
      Object.defineProperty(window.speechSynthesis, "cancel", {
        value: () => {},
      });
    });
    await start(page, route.path);
    await visit(page, "home");
    await choose(page, "Help Elena with the delivery");
    for (let day = 1; day <= 14; day++) await advance(page);
    await expect(page.locator("#day-label")).toContainText(
      "Chapter 2 · Age 19",
    );
    await visit(page, "college");
    await choose(page, route.choice);
    await advance(page);
    await visit(page, "work");
    await choose(page, "Protect time for learning");
    await advance(page);
    await visit(page, "apartment");
    await choose(page, "Stay with family while learning or working");
    await visit(page, "college");
    await choose(page, "Make time for a learning milestone");
    await advance(page);
    await expect(page.locator("#day-label")).toContainText(
      "Chapter 3 · Age 20",
    );
    await visit(page, "bus");
    await choose(page, "Replan around buses and walking");
    await advance(page);
    await visit(page, "home");
    await choose(page, "Coordinate a clinic support ride");
    await visit(page, "college");
    await choose(page, "Make time for a learning milestone");
    await advance(page);
    await visit(page, "work");
    await choose(
      page,
      route.path === "Independent work"
        ? "Invest in independent work"
        : "Keep the current work arrangement",
    );
    await advance(page);
    await expect(page.locator("#day-label")).toContainText(
      "Chapter 4 · Age 21",
    );
    await visit(page, "apartment");
    await choose(page, "Make a new agreement with Aunt Elena");
    await advance(page);
    await visit(page, "college");
    await choose(page, "Complete the learning goal you prepared for");
    await advance(page);
    await expect(page.locator("#day-label")).toContainText("Age 22");
    await visit(page, "bosque");
    await choose(page, "Keep learning and changing direction");
    await finish(page);
    await expect(
      page.getByRole("heading", { name: "Your life is still unfolding." }),
    ).toBeVisible();
    await expect(page.locator("#dialog-content")).toContainText(
      route.credential,
    );
    const s = await read(page);
    expect(s.completed).toBe(true);
    expect(s.day).toBe(23);
    expect(s.life.history).toHaveLength(9);
    expect(s.flags).toContain("family");
    expect(s.path).toBe(route.path);
    await page.locator("#snapshot-choice").selectOption("0");
    await expect(page.locator("#chosen-opportunity")).toContainText(
      "Help Elena with the delivery",
    );
    await page
      .locator("#reflect-scarcity")
      .fill("Time and access to one shared laptop.");
    await page
      .locator("#reflect-alternative")
      .fill("Applying for a scholarship.");
    await page
      .locator("#reflect-context")
      .fill("Family support and limited appointment times mattered.");
    await page.getByRole("button", { name: "Listen to this panel" }).click();
    const spoken = await page.evaluate(() =>
      (window as unknown as { __lifeSpeech: string[] }).__lifeSpeech.at(-1),
    );
    expect(spoken).toContain("What resource was scarce");
    expect(spoken).toContain("next-best alternative");
    await page.getByRole("button", { name: "Stop panel narration" }).click();
    const pending = page.waitForEvent("download");
    await page.locator("#snapshot-download").click();
    const downloaded = await pending;
    expect(downloaded.suggestedFilename()).toBe("life-snapshot-at-22.txt");
    const text = await readFile((await downloaded.path())!, "utf8");
    expect(text).toContain("LIFE SNAPSHOT AT AGE 22");
    expect(text).toContain(route.credential);
    expect(text).toContain("Applying for a scholarship.");
    await page.reload();
    await page.locator("#continue").click();
    await expect(page.locator("#reflect-scarcity")).toHaveValue(
      "Time and access to one shared laptop.",
    );
    expect((await read(page)).life.history).toHaveLength(9);
    await expect(page.locator("#next-day")).toHaveCount(0);
  });

test("completed older two-week saves continue; main decisions are required and exploration cannot consume the reserved time", async ({
  page,
}) => {
  await start(page);
  const s = await read(page);
  Object.assign(s, {
    day: 14,
    completed: true,
    ended: true,
    money: 250,
    transport: "Borrowed bicycle",
    flags: ["week-reflection", "week-reflection-2"],
  });
  delete s.loan;
  delete s.life;
  await fixture(page, s);
  await page.locator("#next-day").click();
  await expect(page.locator("#dialog-content")).toContainText(
    "borrowed bike has been returned",
  );
  await page.locator("#morning-go").click();
  expect((await read(page)).money).toBe(250);
  expect((await read(page)).transport).toBe("City bus");
  await visit(page, "work");
  await expect(
    page.getByRole("button", { name: "Take an extra paid shift" }),
  ).toBeDisabled();
  await page.locator("#close-dialog").click();
  await page.locator("#finish").click();
  await expect(page.locator("#confirm-finish")).toBeDisabled();
  await page.locator("#go-main").click();
  await expect(page.getByRole("heading", { name: "Mr. Chen" })).toBeVisible();
  expect((await read(page)).minutes).toBe(540);
});

test("loan interest, actual payments, and one-time monthly settlement match the preview", async ({
  page,
}) => {
  await start(page);
  await fixture(page, {
    day: 14,
    completed: true,
    ended: true,
    money: 200,
    savings: 100,
  });
  await page.locator("#next-day").click();
  await page.locator("#morning-go").click();
  await visit(page, "college");
  await choose(page, "Fund a college start with a small loan");
  await page.locator("#finish").click();
  await expect(page.locator(".budget-panel")).toContainText("Loan interest $3");
  await expect(page.locator(".budget-panel")).toContainText("loan payment $50");
  await page.locator("#confirm-finish").click();
  let s = await read(page);
  expect(s.money).toBe(940);
  expect(s.loan).toBe(553);
  expect(s.life.history).toHaveLength(1);
  await page.reload();
  await page.locator("#continue").click();
  s = await read(page);
  expect(s.money).toBe(940);
  expect(s.loan).toBe(553);
  expect(s.life.history).toHaveLength(1);
});

test("a monthly shortfall uses reserves and leaves bills without inventing a loan payment", async ({
  page,
}) => {
  await start(page);
  await fixture(page, {
    day: 16,
    money: 100,
    savings: 50,
    rent: 850,
    loan: 1200,
    life: {
      monthlyIncome: 0,
      essentials: 450,
      tuition: 0,
      payment: 100,
      study: 0,
      credential: "Experience in progress",
      history: [],
    },
  });
  await visit(page, "work");
  await choose(page, "Protect time for learning");
  await finish(page);
  const s = await read(page);
  expect(s.money).toBe(0);
  expect(s.savings).toBe(0);
  expect(s.debt).toBe(1150);
  expect(s.loan).toBe(1206);
  expect(s.life.history[0].payment).toBe(0);
  expect(s.life.history[0].interest).toBe(6);
});

test("low-resource players can change direction and reach a safe age-22 ending", async ({
  page,
}) => {
  await start(page, "Trades");
  await fixture(page, {
    day: 22,
    money: 0,
    savings: 0,
    loan: 0,
    life: {
      monthlyIncome: 600,
      essentials: 450,
      tuition: 0,
      payment: 0,
      study: 0,
      credential: "Experience in progress",
      history: [],
    },
  });
  await visit(page, "college");
  await expect(
    page.getByRole("button", {
      name: "Complete the learning goal you prepared for",
    }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Change direction with a bridge course" }),
  ).toBeDisabled();
  await choose(page, "Build on work and community experience");
  await advance(page);
  await visit(page, "bosque");
  await choose(page, "Protect time for people and wellbeing");
  await finish(page);
  await expect(page.locator("#dialog-content")).toContainText(
    "Documented work and community experience",
  );
  await page.locator("#reflect-context").fill('<img src=x onerror="alert(1)">');
  await page.reload();
  await page.locator("#continue").click();
  await expect(page.locator("#reflect-context")).toHaveValue(
    '<img src=x onerror="alert(1)">',
  );
  await expect(page.locator("#dialog-content img")).toHaveCount(0);
  await page.locator("#snapshot-restart").click();
  await page.locator("#confirm-restart").click();
  await expect(page.locator("#title")).toBeVisible();
});

test("a higher family contribution preserves the home and a bridge course changes direction", async ({
  page,
}) => {
  await start(page, "Trades");
  await fixture(page, {
    day: 21,
    money: 200,
    life: {
      monthlyIncome: 1200,
      essentials: 450,
      tuition: 0,
      payment: 0,
      study: 2,
      credential: "Experience in progress",
      history: [],
    },
  });
  await visit(page, "apartment");
  await choose(page, "Keep the home and accept the rent increase");
  let s = await read(page);
  expect(s.housing).toBe("With Aunt Elena");
  expect(s.rent).toBe(0);
  expect(s.life.familyContribution).toBe(260);
  await page.locator("#finish").click();
  await expect(page.locator(".budget-panel")).toContainText("Housing $260");
  await page.locator("#confirm-finish").click();
  await page.locator("#next-day").click();
  await page.locator("#morning-go").click();
  await visit(page, "college");
  await choose(page, "Change direction with a bridge course");
  s = await read(page);
  expect(s.path).toBe("Employment");
  expect(s.life.study).toBe(3);
  expect(s.life.credential).toBe("Bridge course and transferable experience");
  await expect(page.locator("#path")).toContainText("Employment");
});
