"use server";
import { PersonData } from "@/app/lib/types/PersonData";
import moment from "moment";
import type { IsBornInItaly } from "./lib/types/IsBornInItaly";

export type FiscalCodeState = {
  fiscalCode: string;
  error: string | null;
};

export async function getFiscalCode(
  _previousState: FiscalCodeState,
  formData: FormData,
): Promise<FiscalCodeState> {
  const rawSurname = formData.get("surname");
  const rawName = formData.get("name");
  const rawDateOfBirth = formData.get("dateOfBirth");
  const rawIsBornInItaly = formData.get("isBornInItaly");
  const rawSex = formData.get("sex");
  const rawBirthPlace = formData.get("birthPlace");

  if (
    typeof rawSurname !== "string" ||
    typeof rawName !== "string" ||
    typeof rawDateOfBirth !== "string" ||
    typeof rawIsBornInItaly !== "string" ||
    typeof rawSex !== "string" ||
    typeof rawBirthPlace !== "string"
  ) {
    return { fiscalCode: "", error: "I dati inseriti non sono validi." };
  }

  const surname = rawSurname.trim();
  const name = rawName.trim();
  const dateOfBirth = moment(rawDateOfBirth, "DD/MM/YYYY", true);

  if (!surname || !name || !dateOfBirth.isValid()) {
    return {
      fiscalCode: "",
      error: "Compila nome, cognome e data di nascita correttamente.",
    };
  }

  if (/\d/.test(name) || /\d/.test(surname)) {
    return {
      fiscalCode: "",
      error: "Nome e cognome non possono contenere numeri.",
    };
  }

  if (rawIsBornInItaly !== "Y" && rawIsBornInItaly !== "N") {
    return {
      fiscalCode: "",
      error: "Indica se sei nato o nata in Italia.",
    };
  }

  if (rawSex !== "M" && rawSex !== "F") {
    return { fiscalCode: "", error: "Seleziona il sesso." };
  }

  const isBornInItaly: IsBornInItaly = rawIsBornInItaly;
  const sex: "M" | "F" = rawSex;
  const birthPlace =
    isBornInItaly === "Y"
      ? rawBirthPlace.replace(/\s-\s[A-Z]{2}$/, "").trim()
      : rawBirthPlace.trim();

  if (!birthPlace) {
    return {
      fiscalCode: "",
      error: "Seleziona un luogo o uno Stato di nascita valido.",
    };
  }

  if (/\d/.test(birthPlace)) {
    return {
      fiscalCode: "",
      error: "Il luogo o lo Stato di nascita non può contenere numeri.",
    };
  }

  try {
    const personData = new PersonData(
      surname,
      name,
      dateOfBirth,
      sex,
      isBornInItaly,
      birthPlace,
    );
    const surnameCode = personData.getSurnameCode();
    const nameCode = personData.getNameCode();
    const dateOfBirthCode = personData.getDateOfBirthCode();
    const birthPlaceCode = await personData.getBirthPlaceCode();

    const partialFiscalCode =
      surnameCode + nameCode + dateOfBirthCode + birthPlaceCode;

    const controlCharacterCode =
      personData.getControlCharacterCode(partialFiscalCode);
    if (partialFiscalCode.length !== 15)
      throw new Error("Wrong size of partialFiscalCode");
    const fiscalCode = partialFiscalCode + controlCharacterCode;
    return { fiscalCode, error: null };
  } catch (error) {
    console.error("Failed to calculate fiscal code", error);
    return {
      fiscalCode: "",
      error: "Non è stato possibile calcolare il codice fiscale.",
    };
  }
}
