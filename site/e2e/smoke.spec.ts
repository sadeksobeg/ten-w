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
});
