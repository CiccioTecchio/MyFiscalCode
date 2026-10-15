import moment from "moment";
import fs from "fs";
import { removeSpaceAndSpecialCharacters } from "../utils/parsing";
import { binarySearchComune } from "../utils/research";
export class PersonData {
  private surname: string;
  private name: string;
  private dateOfBirth: moment.Moment;
  private sex: "M" | "F";
  private birthPlace: string;

  constructor(
    surname: string,
    name: string,
    dateOfBirth: moment.Moment,
    sex: "M" | "F",
    birthPlace: string,
  ) {
    this.surname = surname;
    this.name = name;
    this.dateOfBirth = dateOfBirth;
    this.sex = sex;
    this.birthPlace = birthPlace;
  }

  private getCodeFromNameOrSurname(value: string): string {
    const letters = removeSpaceAndSpecialCharacters(value);
    const consonants = letters.replace(/[AEIOU]/g, "");
    const vowels = letters.replace(/[^AEIOU]/g, "");

    return (consonants + vowels).slice(0, 3).padEnd(3, "X");
  }

  getSurnameCode(): string {
    return this.getCodeFromNameOrSurname(this.surname);
  }

  getNameCode(): string {
    return this.getCodeFromNameOrSurname(this.name);
  }

  getDateOfBirthCode(): string {
    const year = this.dateOfBirth.year().toString().substring(2)[1];
    console.log("year", year);
    const month = "ABCDEHLMPRST"[this.dateOfBirth.month()];
    const day =
      this.sex === "M"
        ? this.dateOfBirth.date().toString().padStart(2, "0")
        : (this.dateOfBirth.date() + 40).toString();

    return year + month + day;
  }

  getBirthPlaceCode(): string {
    const normalizedBirthPlace = removeSpaceAndSpecialCharacters(
      this.birthPlace,
    );
    const fp = fs.openSync("app/resources/comuniItaliani.json", "r");
    const listComuni = JSON.parse(fs.readFileSync(fp, "utf-8"));
    return binarySearchComune(listComuni, normalizedBirthPlace);
  }

  getControlCharacterCode(): string {
    return ""; //1 simbolo
  }
}
