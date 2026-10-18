import { expect, test, type Page } from "@playwright/test";

async function fillDate(
  page: Page,
  { day, month, year }: { day: string; month: string; year: string },
) {
  await page.getByRole("spinbutton", { name: "Day" }).fill(day);
  await page.getByRole("spinbutton", { name: "Month" }).fill(month);
  await page.getByRole("spinbutton", { name: "Year" }).fill(year);
  await page
    .getByRole("heading", { name: "Calcola il tuo codice fiscale" })
    .click();
}

async function selectBirthPlace(
  page: Page,
  {
    bornInItaly,
    query,
    option,
  }: { bornInItaly: boolean; query: string; option: string },
) {
  await page
    .getByRole("radio", { name: bornInItaly ? "Sì" : "No" })
    .check();
  const label = bornInItaly ? "Luogo di nascita" : "Stato di nascita";
  await page.getByRole("combobox", { name: label }).fill(query);
  await page.getByRole("option", { name: option }).click();
}

test.describe("calcolo del codice fiscale", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Calcola il tuo codice fiscale" }),
    ).toBeVisible();
  });

  test("un utente nato in Italia compila il form e ottiene il codice corretto", async ({
    page,
  }) => {
    await page.getByRole("textbox", { name: "Nome", exact: true }).fill("Mario");
    await page
      .getByRole("textbox", { name: "Cognome", exact: true })
      .fill("Rossi");
    await fillDate(page, { day: "01", month: "01", year: "1961" });
    await selectBirthPlace(page, {
      bornInItaly: true,
      query: "Roma",
      option: "Roma - RM",
    });
    await page.getByRole("radio", { name: "M", exact: true }).check();

    const submit = page.getByRole("button", {
      name: "Calcola codice fiscale",
    });
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(page.getByText("Codice fiscale:")).toContainText(
      "RSSMRA61A01H501R",
    );
  });

  test("un'utente nata all'estero compila il form e ottiene il codice corretto", async ({
    page,
  }) => {
    await page.getByRole("textbox", { name: "Nome", exact: true }).fill("Anna");
    await page
      .getByRole("textbox", { name: "Cognome", exact: true })
      .fill("Verdi");
    await fillDate(page, { day: "15", month: "08", year: "1990" });
    await selectBirthPlace(page, {
      bornInItaly: false,
      query: "Francia",
      option: "Francia",
    });
    await page.getByRole("radio", { name: "F", exact: true }).check();

    const submit = page.getByRole("button", {
      name: "Calcola codice fiscale",
    });
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(page.getByText("Codice fiscale:")).toContainText(
      "VRDNNA90M55Z110V",
    );
  });
});

test.describe("validazione del form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("mantiene disabilitato l'invio quando mancano campi obbligatori", async ({
    page,
  }) => {
    const name = page.getByRole("textbox", { name: "Nome", exact: true });
    const surname = page.getByRole("textbox", {
      name: "Cognome",
      exact: true,
    });
    expect(
      await name.evaluate((element: HTMLInputElement) => element.required),
    ).toBe(true);
    expect(
      await surname.evaluate((element: HTMLInputElement) => element.required),
    ).toBe(true);
    await expect(
      page.getByRole("button", { name: "Calcola codice fiscale" }),
    ).toBeDisabled();
  });

  for (const { field, value } of [
    { field: "Nome", value: "Mario2" },
    { field: "Cognome", value: "Rossi2" },
  ]) {
    test(`mostra un errore se ${field.toLowerCase()} contiene numeri`, async ({
      page,
    }) => {
      const input = page.getByRole("textbox", { name: field, exact: true });

      await input.fill(value);

      await expect(page.getByText("Formato non valido")).toBeVisible();
      expect(
        await input.evaluate(
          (element: HTMLInputElement) => element.validity.patternMismatch,
        ),
      ).toBe(true);
      await expect(
        page.getByRole("button", { name: "Calcola codice fiscale" }),
      ).toBeDisabled();
    });
  }

  test("mostra un errore se il luogo di nascita contiene numeri", async ({
    page,
  }) => {
    await page.getByRole("radio", { name: "Sì" }).check();
    const birthPlace = page.getByRole("combobox", {
      name: "Luogo di nascita",
    });

    await birthPlace.fill("Roma2");

    await expect(page.getByText("Formato non valido")).toBeVisible();
    expect(
      await birthPlace.evaluate(
        (element: HTMLInputElement) => element.validity.patternMismatch,
      ),
    ).toBe(true);
    await expect(
      page.getByRole("button", { name: "Calcola codice fiscale" }),
    ).toBeDisabled();
  });
});
