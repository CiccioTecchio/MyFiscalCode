"use server";
import { PersonData } from "@/app/lib/types/PersonData";
import moment from "moment";
import { IsBornInItaly } from "./lib/types/IsBornInItaly";

export type FiscalCodeState = {
  fiscalCode: string;
  error: string | null;
};

export async function getFiscalCode(
  _previousState: FiscalCodeState,
  formData: FormData,
): Promise<FiscalCodeState> {
  const surname = formData.get("surname") as string;
  const name = formData.get("name") as string;
  const dateOfBirth = moment(
    formData.get("dateOfBirth") as string,
    "DD/MM/YYYY",
  );
  const isBornInItaly: IsBornInItaly =
    (formData.get("isBornInItaly") as IsBornInItaly) || "";
  const sex = formData.get("sex") as "M" | "F";
  let birthPlace = formData.get("birthPlace") as string;
  birthPlace = isBornInItaly
    ? birthPlace.substring(0, birthPlace.length - 5) //remove province
    : birthPlace;
  const personData = new PersonData(
    surname,
    name,
    dateOfBirth,
    sex,
    isBornInItaly,
    birthPlace,
  );
  //console.log(personData);
  const surnameCode = personData.getSurnameCode();
  const nameCode = personData.getNameCode();
  const dateOfBirthCode = personData.getDateOfBirthCode();
  try {
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
    return { fiscalCode: "", error: "Failed to calculate fiscal code" };
  }
}
