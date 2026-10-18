jest.mock("@/app/lib/types/PersonData", () => ({
  PersonData: jest.fn(),
}));

import { PersonData } from "@/app/lib/types/PersonData";
import { getFiscalCode, type FiscalCodeState } from "./action";

const MockPersonData = jest.mocked(PersonData);

const initialState: FiscalCodeState = {
  fiscalCode: "",
  error: null,
};

function createPersonDataMock() {
  return {
    getSurnameCode: jest.fn().mockReturnValue("RSS"),
    getNameCode: jest.fn().mockReturnValue("MRA"),
    getDateOfBirthCode: jest.fn().mockReturnValue("61A01"),
    getBirthPlaceCode: jest.fn().mockResolvedValue("H501"),
    getControlCharacterCode: jest.fn().mockReturnValue("U"),
  };
}

type PersonDataMock = ReturnType<typeof createPersonDataMock>;

let personDataMock: PersonDataMock;

beforeEach(() => {
  personDataMock = createPersonDataMock();

  MockPersonData.mockImplementation(
    () => personDataMock as unknown as PersonData,
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

function createValidFormData() {
  const formData = new FormData();
  formData.set("name", "Mario");
  formData.set("surname", "Rossi");
  formData.set("dateOfBirth", "01/01/1961");
  formData.set("isBornInItaly", "Y");
  formData.set("sex", "M");
  formData.set("birthPlace", "Roma - RM");
  return formData;
}

describe("getFiscalCode", () => {
  it("rifiuta un form che non contiene tutti i campi", async () => {
    const formData = createValidFormData();
    formData.delete("name");

    const result = await getFiscalCode(initialState, formData);

    expect(result).toEqual({
      fiscalCode: "",
      error: "I dati inseriti non sono validi.",
    });
    expect(MockPersonData).not.toHaveBeenCalled();
  });

  it.each([
    {
      field: "name",
      value: "",
      error: "Compila nome, cognome e data di nascita correttamente.",
    },
    {
      field: "surname",
      value: "   ",
      error: "Compila nome, cognome e data di nascita correttamente.",
    },
    {
      field: "dateOfBirth",
      value: "31/02/2020",
      error: "Compila nome, cognome e data di nascita correttamente.",
    },
    {
      field: "name",
      value: "Mario2",
      error: "Nome e cognome non possono contenere numeri.",
    },
    {
      field: "surname",
      value: "Rossi2",
      error: "Nome e cognome non possono contenere numeri.",
    },
    {
      field: "isBornInItaly",
      value: "X",
      error: "Indica se sei nato o nata in Italia.",
    },
    {
      field: "sex",
      value: "X",
      error: "Seleziona il sesso.",
    },
    {
      field: "birthPlace",
      value: "   ",
      error: "Seleziona un luogo o uno Stato di nascita valido.",
    },
    {
      field: "birthPlace",
      value: "Roma2",
      error: "Il luogo o lo Stato di nascita non può contenere numeri.",
    },
  ])(
    "restituisce l'errore corretto quando $field vale '$value'",
    async ({ field, value, error }) => {
      const formData = createValidFormData();
      formData.set(field, value);

      const result = await getFiscalCode(initialState, formData);

      expect(result).toEqual({ fiscalCode: "", error });
      expect(MockPersonData).not.toHaveBeenCalled();
    },
  );

  it("calcola il codice fiscale con dati validi", async () => {
    const result = await getFiscalCode(initialState, createValidFormData());

    expect(result).toEqual({
      fiscalCode: "RSSMRA61A01H501U",
      error: null,
    });
    expect(MockPersonData).toHaveBeenCalledTimes(1);
    expect(MockPersonData).toHaveBeenCalledWith(
      "Rossi",
      "Mario",
      expect.anything(),
      "M",
      "Y",
      "Roma",
    );
    expect(personDataMock.getSurnameCode).toHaveBeenCalledTimes(1);
    expect(personDataMock.getNameCode).toHaveBeenCalledTimes(1);
    expect(personDataMock.getDateOfBirthCode).toHaveBeenCalledTimes(1);
    expect(personDataMock.getBirthPlaceCode).toHaveBeenCalledTimes(1);
    expect(personDataMock.getControlCharacterCode).toHaveBeenCalledWith(
      "RSSMRA61A01H501",
    );
  });

  it("mantiene il nome dello Stato estero e rimuove gli spazi esterni", async () => {
    const formData = createValidFormData();
    formData.set("isBornInItaly", "N");
    formData.set("birthPlace", "  Francia  ");

    await getFiscalCode(initialState, formData);

    expect(MockPersonData).toHaveBeenCalledWith(
      "Rossi",
      "Mario",
      expect.anything(),
      "M",
      "N",
      "Francia",
    );
  });

  it("gestisce un errore durante il calcolo", async () => {
    const calculationError = new Error("Database non disponibile");
    personDataMock.getBirthPlaceCode.mockRejectedValue(calculationError);
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const result = await getFiscalCode(initialState, createValidFormData());

    expect(result).toEqual({
      fiscalCode: "",
      error: "Non è stato possibile calcolare il codice fiscale.",
    });
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to calculate fiscal code",
      calculationError,
    );
  });

  it("rifiuta un codice fiscale parziale della lunghezza sbagliata", async () => {
    personDataMock.getBirthPlaceCode.mockResolvedValue("");
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const result = await getFiscalCode(initialState, createValidFormData());

    expect(result).toEqual({
      fiscalCode: "",
      error: "Non è stato possibile calcolare il codice fiscale.",
    });
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to calculate fiscal code",
      expect.objectContaining({ message: "Wrong size of partialFiscalCode" }),
    );
  });
});
