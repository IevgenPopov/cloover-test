import { expect, test } from "@playwright/test";

const demoEmail = process.env.PLAYWRIGHT_DEMO_EMAIL;
const demoPassword = process.env.PLAYWRIGHT_DEMO_PASSWORD;

if (!demoEmail || !demoPassword) {
  throw new Error("PLAYWRIGHT_DEMO_EMAIL and PLAYWRIGHT_DEMO_PASSWORD must be set.");
}

test.describe("quote flow", () => {
  test("signs in, creates a quote, and shows the results", async ({ page }) => {
    await page.goto("/login");

    await page.locator("#email").fill(demoEmail);
    await page.locator("#password").fill(demoPassword);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/quotes$/);

    await page.getByRole("main").getByRole("link", { name: "New quote" }).click();
    await expect(page).toHaveURL(/\/quote$/);

    await page.getByLabel("Full name").fill("Demo User");
    await page.getByLabel("Email").fill(demoEmail);
    await page.getByLabel("Address").fill("123 Main Street, Berlin");
    await page.getByLabel("Monthly consumption (kWh)").fill("450");
    await page.getByLabel("System size (kW)").fill("5");
    await page.getByLabel("Down payment").fill("1500");

    await page.getByRole("button", { name: "Get quote" }).click();

    await expect(page.getByRole("heading", { name: "Result" })).toBeVisible();
    await expect(page.getByText("System price")).toBeVisible();
    await expect(page.getByText("Principal amount")).toBeVisible();
    await expect(page.getByText("$6,000.00")).toBeVisible();
    await expect(page.getByText("Risk band")).toBeVisible();
    await expect(page.getByText("Base APR")).toBeVisible();
    await expect(page.getByText("5 years", { exact: true })).toBeVisible();
    await expect(page.getByText("Monthly payment: $88.89")).toBeVisible();
    await expect(page.getByText("10 years", { exact: true })).toBeVisible();
    await expect(page.getByText("15 years", { exact: true })).toBeVisible();
  });
});
