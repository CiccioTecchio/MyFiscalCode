import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@mui/x-date-pickers", () => ({
  LocalizationProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  DatePicker: ({
    label,
    name,
    slotProps,
  }: {
    label: string;
    name: string;
    slotProps?: { textField?: { required?: boolean } };
  }) => (
    <label>
      {label}
      <input
        aria-label={label}
        name={name}
        required={slotProps?.textField?.required}
      />
    </label>
  ),
}));

jest.mock("@mui/x-date-pickers/AdapterMoment", () => ({
  AdapterMoment: jest.fn(),
}));

jest.mock("./BornPlace", () => ({
  __esModule: true,
  default: ({
    isBornInItaly,
    onValidityChange,
  }: {
    isBornInItaly: "Y" | "N";
    onValidityChange: (isValid: boolean) => void;
  }) => {
    const label = isBornInItaly === "Y" ? "Luogo di nascita" : "Stato di nascita";
    return (
      <label>
        {label}
        <input
          aria-label={label}
          name="birthPlace"
          required
          onChange={(event) => onValidityChange(event.target.value !== "")}
        />
      </label>
    );
  },
}));

jest.mock("../action", () => ({
  getFiscalCode: jest.fn(),
}));

import { getFiscalCode } from "../action";
import FiscalCodeForm from "./FiscalCodeForm";

const mockGetFiscalCode = jest.mocked(getFiscalCode);

function getSubmitButton() {
  return screen.getByRole("button", { name: "Calcola codice fiscale" });
}

async function fillRequiredFieldsExceptSex() {
  fireEvent.input(screen.getByRole("textbox", { name: "Nome" }), {
    target: { value: "Mario" },
  });
  fireEvent.input(screen.getByRole("textbox", { name: "Cognome" }), {
    target: { value: "Rossi" },
  });
  fireEvent.change(screen.getByRole("textbox", { name: "Data di nascita" }), {
    target: { value: "01/01/1961" },
  });
  fireEvent.click(screen.getByRole("radio", { name: "Sì" }));
  fireEvent.change(
    await screen.findByRole("textbox", { name: "Luogo di nascita" }),
    { target: { value: "Roma" } },
  );
}

async function completeForm() {
  await fillRequiredFieldsExceptSex();
  fireEvent.click(screen.getByRole("radio", { name: "M" }));

  await waitFor(() => expect(getSubmitButton()).toBeEnabled());
}

describe("FiscalCodeForm", () => {
  beforeEach(() => {
    mockGetFiscalCode.mockReset();
    mockGetFiscalCode.mockResolvedValue({ fiscalCode: "", error: null });
  });

  it("mostra i campi iniziali e mantiene il pulsante disabilitato", () => {
    render(<FiscalCodeForm />);

    expect(screen.getByRole("textbox", { name: "Nome" })).toBeRequired();
    expect(screen.getByRole("textbox", { name: "Cognome" })).toBeRequired();
    expect(
      screen.getByRole("textbox", {
        name: "Inserisci Luogo o Stato di nascita",
      }),
    ).toBeDisabled();
    expect(getSubmitButton()).toBeDisabled();
  });

  it.each([
    { label: "Nome", value: "Mario2" },
    { label: "Cognome", value: "Rossi2" },
  ])("segnala il formato non valido per $label", ({ label, value }) => {
    render(<FiscalCodeForm />);

    fireEvent.input(screen.getByRole("textbox", { name: label }), {
      target: { value },
    });

    expect(screen.getByText("Formato non valido")).toBeInTheDocument();
    expect(getSubmitButton()).toBeDisabled();
  });

  it("cambia il campo del luogo in base alla scelta Italia o estero", () => {
    render(<FiscalCodeForm />);

    fireEvent.click(screen.getByRole("radio", { name: "Sì" }));
    expect(
      screen.getByRole("textbox", { name: "Luogo di nascita" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "No" }));
    expect(
      screen.getByRole("textbox", { name: "Stato di nascita" }),
    ).toBeInTheDocument();
  });

  it("abilita il pulsante quando tutti i campi sono validi", async () => {
    render(<FiscalCodeForm />);

    await completeForm();

    expect(getSubmitButton()).toBeEnabled();
  });

  it("richiede una scelta per il sesso senza marcare le singole opzioni come required", async () => {
    render(<FiscalCodeForm />);

    await fillRequiredFieldsExceptSex();

    expect(screen.getByRole("radio", { name: "M" })).not.toBeRequired();
    expect(screen.getByRole("radio", { name: "F" })).not.toBeRequired();
    expect(getSubmitButton()).toBeDisabled();

    fireEvent.click(screen.getByRole("radio", { name: "F" }));

    await waitFor(() => expect(getSubmitButton()).toBeEnabled());
  });

  it("invia il form e mostra il codice fiscale restituito", async () => {
    mockGetFiscalCode.mockResolvedValue({
      fiscalCode: "RSSMRA61A01H501U",
      error: null,
    });
    render(<FiscalCodeForm />);
    await completeForm();

    fireEvent.click(getSubmitButton());

    await waitFor(() => expect(mockGetFiscalCode).toHaveBeenCalledTimes(1));
    expect(
      await screen.findByRole("textbox", { name: "Il tuo codice fiscale" }),
    ).toHaveValue("RSSMRA61A01H501U");
    const submittedData = mockGetFiscalCode.mock.calls[0][1];
    expect(submittedData.get("name")).toBe("Mario");
    expect(submittedData.get("birthPlace")).toBe("Roma");
  });

  it("mostra l'errore restituito dalla server action", async () => {
    mockGetFiscalCode.mockResolvedValue({
      fiscalCode: "",
      error: "Non è stato possibile calcolare il codice fiscale.",
    });
    render(<FiscalCodeForm />);
    await completeForm();

    fireEvent.click(getSubmitButton());

    expect(
      await screen.findByText(
        "Non è stato possibile calcolare il codice fiscale.",
      ),
    ).toBeInTheDocument();
  });
});
