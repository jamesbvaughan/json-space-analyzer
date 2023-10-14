import { test, expect } from "@playwright/test";
import path from "path";

test("displays example file", async ({ page }) => {
  await page.goto("/");

  await page
    .getByRole("link", { name: "or click here to load an example file" })
    .click();

  const chart = page.locator("#chart");
  await expect(chart).toHaveScreenshot();
});

test("displays an uploaded file", async ({ page }) => {
  await page.goto("/");

  const fileChooserPromise = page.waitForEvent("filechooser");

  await page.locator("#uploadButton").click();

  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(path.join(__dirname, "../package.json"));

  const chart = page.locator("#chart");
  await expect(chart).toHaveScreenshot();
});

test("displays an file from hash parameters", async ({ page }) => {
  await page.goto("#file=https://json-schema.org/draft/2020-12/schema");

  const chart = page.locator("#chart");
  await expect(chart).toHaveScreenshot();
});
