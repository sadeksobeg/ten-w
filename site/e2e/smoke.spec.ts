import { expect, test } from "@playwright/test";

test.describe("smoke", () => {
  test("English home shows brand", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByText("T.E.N.E.G.T.A").first()).toBeVisible();
  });

  test("French locale loads solutions page", async ({ page }) => {
    await page.goto("/fr/solutions");
    await expect(
      page.getByRole("heading", { level: 1 }).first(),
    ).toBeVisible();
  });

  test("privacy policy has structured sections", async ({ page }) => {
    await page.goto("/en/privacy");
    await expect(page.getByRole("heading", { name: /Privacy policy/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Cookies/i })).toBeVisible();
  });

  test("Growth Engine sign-in page loads", async ({ page }) => {
    await page.goto("/en/growth/sign-in");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("Home shows metrics band", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByText(/Enterprise systems delivered/i)).toBeVisible();
  });

  test("Deep case study shows architecture section", async ({ page }) => {
    await page.goto("/en/case-studies/enterprise-ai-ops");
    await expect(page.getByRole("heading", { name: /Architectural decisions/i })).toBeVisible();
  });

  test("French nav uses French labels", async ({ page }) => {
    await page.goto("/fr");
    await expect(page.getByRole("link", { name: /Accueil|Solutions|Contact/i }).first()).toBeVisible();
  });
});
