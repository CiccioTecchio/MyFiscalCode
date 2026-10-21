import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import FiscalCodeResult from "./FiscalCodeResult";

jest.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    const messages = jest.requireActual(
      "../../messages/it-IT.json",
    ) as Record<string, Record<string, string>>;

    return (key: string) => messages[namespace][key];
  },
}));

describe("FiscalCodeResult", () => {
  const writeText = jest.fn();

  beforeEach(() => {
    writeText.mockReset();
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
  });

  it("evidenzia il risultato in un campo di sola lettura", () => {
    render(<FiscalCodeResult fiscalCode="RSSMRA61A01H501U" />);

    expect(
      screen.getByRole("heading", { name: "Codice fiscale calcolato" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Il tuo codice fiscale" }),
    ).toHaveValue("RSSMRA61A01H501U");
    expect(
      screen.getByRole("textbox", { name: "Il tuo codice fiscale" }),
    ).toHaveAttribute("readonly");
  });

  it("copia il codice fiscale negli appunti", async () => {
    render(<FiscalCodeResult fiscalCode="RSSMRA61A01H501U" />);

    fireEvent.click(screen.getByRole("button", { name: "Copia" }));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("RSSMRA61A01H501U"),
    );
    expect(
      await screen.findByRole("button", { name: "Copiato" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Codice fiscale copiato negli appunti."),
    ).toBeInTheDocument();
  });
});
