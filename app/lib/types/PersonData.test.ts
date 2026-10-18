import moment from "moment";

// Questo test verifica la logica di PersonData, non l'integrazione con MongoDB.
// Le factory impediscono a Jest di caricare Mongoose e il suo modulo ESM `bson`.
jest.mock("../utils/mongodb", () => ({
  dbConnect: jest.fn(),
}));
jest.mock("@/app/models/Comune", () => ({
  ComuneModel: { findOne: jest.fn() },
}));
jest.mock("@/app/models/Stato", () => ({
  StatoModel: { findOne: jest.fn() },
}));

import { ComuneModel } from "@/app/models/Comune";
import { StatoModel } from "@/app/models/Stato";
import { dbConnect } from "../utils/mongodb";
import { PersonData } from "./PersonData";

const mockDbConnect = jest.mocked(dbConnect);

type FindComune = (filter: {
  nomeComune: string;
}) => Promise<{ codiceComune: string } | null>;

type FindStato = (filter: {
  nomeStato: string;
}) => Promise<{ codice: string } | null>;

const mockComuneFindOne =
  ComuneModel.findOne as unknown as jest.MockedFunction<FindComune>;
const mockStatoFindOne =
  StatoModel.findOne as unknown as jest.MockedFunction<FindStato>;

type PersonDataOverrides = {
  surname?: string;
  name?: string;
  dateOfBirth?: string;
  sex?: "M" | "F";
  isBornInItaly?: "Y" | "N";
  birthPlace?: string;
};

function createPersonData({
  surname = "Rossi",
  name = "Mario",
  dateOfBirth = "01/01/1961",
  sex = "M",
  isBornInItaly = "Y",
  birthPlace = "Roma",
}: PersonDataOverrides = {}) {
  return new PersonData(
    surname,
    name,
    moment(dateOfBirth, "DD/MM/YYYY", true),
    sex,
    isBornInItaly,
    birthPlace,
  );
}

describe("PersonData", () => {
  describe("getSurnameCode", () => {
    it.each([
      { surname: "Rossi", expected: "RSS" },
      { surname: "Fo", expected: "FOX" },
      { surname: "Aie", expected: "AIE" },
      { surname: "D'Angelo", expected: "DNG" },
    ])(
      "returns $expected for the surname $surname",
      ({ surname, expected }) => {
        const person = createPersonData({ surname });
        expect(person.getSurnameCode()).toBe(expected);
      },
    );
  });

  describe("getNameCode", () => {
    it.each([
      { name: "Mario", expected: "MRA" },
      { name: "Giuseppe", expected: "GPP" },
      { name: "Luca", expected: "LCU" },
      { name: "Al", expected: "LAX" },
      { name: "Francesco", expected: "FNC" },
    ])("returns $expected for the name $name", ({ name, expected }) => {
      const person = createPersonData({ name });
      expect(person.getNameCode()).toBe(expected);
    });
  });

  describe("getDateOfBirthCode", () => {
    it.each([
      {
        dateOfBirth: "01/01/1961",
        sex: "M" as const,
        expected: "61A01",
      },
      {
        dateOfBirth: "01/01/1961",
        sex: "F" as const,
        expected: "61A41",
      },
      {
        dateOfBirth: "15/08/1990",
        sex: "M" as const,
        expected: "90M15",
      },
      {
        dateOfBirth: "15/08/1990",
        sex: "F" as const,
        expected: "90M55",
      },
      {
        dateOfBirth: "31/12/2000",
        sex: "M" as const,
        expected: "00T31",
      },
      {
        dateOfBirth: "31/12/2000",
        sex: "F" as const,
        expected: "00T71",
      },
    ])(
      "restituisce $expected per $dateOfBirth e sesso $sex",
      ({ dateOfBirth, sex, expected }) => {
        const person = createPersonData({ dateOfBirth, sex });

        expect(person.getDateOfBirthCode()).toBe(expected);
      },
    );
  });

  describe("getControlCharacterCode", () => {
    const person = createPersonData();

    it.each([
      ["A", "B"],
      ["0", "B"],
      ["B", "A"],
      ["1", "A"],
      ["C", "F"],
      ["2", "F"],
      ["D", "H"],
      ["3", "H"],
      ["E", "J"],
      ["4", "J"],
      ["F", "N"],
      ["5", "N"],
      ["G", "P"],
      ["6", "P"],
      ["H", "R"],
      ["7", "R"],
      ["I", "T"],
      ["8", "T"],
      ["J", "V"],
      ["9", "V"],
      ["K", "C"],
      ["L", "E"],
      ["M", "S"],
      ["N", "U"],
      ["O", "L"],
      ["P", "D"],
      ["Q", "G"],
      ["R", "I"],
      ["S", "M"],
      ["T", "O"],
      ["U", "Q"],
      ["V", "K"],
      ["W", "W"],
      ["X", "Z"],
      ["Y", "Y"],
      ["Z", "X"],
    ])(
      "applica la conversione dispari a %s ottenendo %s",
      (character, expected) => {
        expect(person.getControlCharacterCode(character)).toBe(expected);
      },
    );

    it.each([
      ["0", "A"],
      ["5", "F"],
      ["9", "J"],
      ["A", "A"],
      ["M", "M"],
      ["Z", "Z"],
    ])(
      "applica la conversione pari a %s ottenendo %s",
      (character, expected) => {
        // B occupa la prima posizione (dispari) e vale zero. Il risultato
        // dipende quindi soltanto dal carattere nella seconda posizione.
        expect(person.getControlCharacterCode(`B${character}`)).toBe(expected);
      },
    );

    it("calcola il carattere di controllo di un codice parziale completo", () => {
      expect(person.getControlCharacterCode("RSSMRA80A01H501")).toBe("U");
    });
  });

  describe("getBirthPlaceCode", () => {
    beforeEach(() => {
      mockDbConnect.mockReset();
      mockComuneFindOne.mockReset();
      mockStatoFindOne.mockReset();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("restituisce il codice di un comune italiano", async () => {
      mockComuneFindOne.mockResolvedValue({ codiceComune: "H501" });
      const person = createPersonData({
        isBornInItaly: "Y",
        birthPlace: "Roma",
      });

      const result = await person.getBirthPlaceCode();

      expect(result).toBe("H501");
      expect(mockDbConnect).toHaveBeenCalledTimes(1);
      expect(mockComuneFindOne).toHaveBeenCalledWith({ nomeComune: "Roma" });
      expect(mockStatoFindOne).not.toHaveBeenCalled();
    });

    it("restituisce il codice di uno Stato estero", async () => {
      mockStatoFindOne.mockResolvedValue({ codice: "Z404" });
      const person = createPersonData({
        isBornInItaly: "N",
        birthPlace: "Stati Uniti d'America",
      });

      const result = await person.getBirthPlaceCode();

      expect(result).toBe("Z404");
      expect(mockDbConnect).toHaveBeenCalledTimes(1);
      expect(mockStatoFindOne).toHaveBeenCalledWith({
        nomeStato: "Stati Uniti d'America",
      });
      expect(mockComuneFindOne).not.toHaveBeenCalled();
    });

    it("restituisce una stringa vuota se il comune non esiste", async () => {
      mockComuneFindOne.mockResolvedValue(null);
      const person = createPersonData({
        isBornInItaly: "Y",
        birthPlace: "Comune inesistente",
      });

      const result = await person.getBirthPlaceCode();

      expect(result).toBe("");
      expect(mockComuneFindOne).toHaveBeenCalledWith({
        nomeComune: "Comune inesistente",
      });
    });

    it("restituisce una stringa vuota se la ricerca del comune fallisce", async () => {
      const databaseError = new Error("Database non disponibile");
      mockComuneFindOne.mockRejectedValue(databaseError);
      const consoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      const person = createPersonData({
        isBornInItaly: "Y",
        birthPlace: "Roma",
      });

      const result = await person.getBirthPlaceCode();

      expect(result).toBe("");
      expect(consoleError).toHaveBeenCalledWith(
        "Something went wrong while retrieving the place of birth",
        databaseError,
      );
    });
  });
});
