import { expect, test } from "@playwright/test";

const credentials = {
  email: process.env.E2E_EMAIL,
  password: process.env.E2E_PASSWORD,
};

const requiresCredentials = Boolean(credentials.email && credentials.password);

test("login displays validation for invalid credentials", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading")).toBeVisible();
  await page.getByLabel(/email/i).fill("invalid@example.com");
  await page.getByLabel(/password/i).fill("invalid-password");
  await page.getByRole("button", { name: /sign in|login|connexion/i }).click();
  await expect(page.locator("body")).toContainText(/invalid|incorrect|error|failed/i);
});

test("authenticated user reaches the dashboard", async ({ page }) => {
  test.skip(!requiresCredentials, "Set E2E_EMAIL and E2E_PASSWORD for authenticated E2E flows");
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(credentials.email!);
  await page.getByLabel(/password/i).fill(credentials.password!);
  await page.getByRole("button", { name: /sign in|login|connexion/i }).click();
  await expect(page).toHaveURL(/dashboard/);
});

test("dashboard exposes inspection and report entry points", async ({ page }) => {
  test.skip(!requiresCredentials, "Set E2E_EMAIL and E2E_PASSWORD for authenticated E2E flows");
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(credentials.email!);
  await page.getByLabel(/password/i).fill(credentials.password!);
  await page.getByRole("button", { name: /sign in|login|connexion/i }).click();
  await page.goto("/dashboard");
  await expect(page.locator("body")).toContainText(/inspection/i);
  await expect(page.locator("body")).toContainText(/report|rapport/i);
});
