import moment from "moment";
import { removeSpaceAndSpecialCharacters } from "../utils/parsing";
import { dbConnect } from "../utils/mongodb";
import { ComuneModel } from "@/app/models/Comune";
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

  getSurnameCode(): string {
    const letters = removeSpaceAndSpecialCharacters(this.surname);
    const consonants = letters.replace(/[AEIOU]/g, "");
    const vowels = letters.replace(/[^AEIOU]/g, "");
    return (consonants + vowels).slice(0, 3).padEnd(3, "X");
  }

  getNameCode(): string {
    const letters = removeSpaceAndSpecialCharacters(this.name);
    const consonants = letters.replace(/[AEIOU]/g, "");
    const vowels = letters.replace(/[^AEIOU]/g, "");
    return consonants.length >= 4
      ? consonants[0] + consonants[2] + consonants[3]
      : (consonants + vowels).slice(0, 3).padEnd(3, "X");
  }

  getDateOfBirthCode(): string {
    const year = this.dateOfBirth.year().toString().substring(2);
    const month = "ABCDEHLMPRST"[this.dateOfBirth.month()];
    const day =
      this.sex === "M"
        ? this.dateOfBirth.date().toString().padStart(2, "0")
        : (this.dateOfBirth.date() + 40).toString();

    return year + month + day;
  }

  async getBirthPlaceCode(): Promise<string> {
    await dbConnect();
    const comuni = await ComuneModel.findOne({ nomeComune: this.birthPlace });
    return comuni ? comuni.codiceComune : "";
  }

  getControlCharacterCode(partialFiscalCode: string): string {
    const l = partialFiscalCode.length;
    let sumParsedCode = 0;
    for (let i = 0; i < l; i++) {
      const char = partialFiscalCode.charAt(i);
      sumParsedCode +=
        (i + 1) % 2 === 0
          ? this.getEvenValue(char.toUpperCase())
          : this.getOddValue(char.toUpperCase());
    }
    const index = sumParsedCode % 26;
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[index];
  }

  private getEvenValue(char: string): number {
    let toReturn = -1;
    if (char >= "0" && char <= "9") {
      toReturn = parseInt(char, 10);
    } else if (char >= "A" && char <= "Z") {
      toReturn = char.charCodeAt(0) - 65;
    }
    return toReturn;
  }

  private getOddValue(char: string): number {
    let toReturn = -1;
    switch (char) {
      case "A":
      case "0":
        toReturn = 1;
        break;
      case "B":
      case "1":
        toReturn = 0;
        break;
      case "C":
      case "2":
        toReturn = 5;
        break;
      case "D":
      case "3":
        toReturn = 7;
        break;
      case "E":
      case "4":
        toReturn = 9;
        break;
      case "F":
      case "5":
        toReturn = 13;
        break;
      case "G":
      case "6":
        toReturn = 15;
        break;
      case "H":
      case "7":
        toReturn = 17;
        break;
      case "I":
      case "8":
        toReturn = 19;
        break;
      case "J":
      case "9":
        toReturn = 21;
        break;
      case "K":
        toReturn = 2;
        break;
      case "L":
        toReturn = 4;
        break;
      case "M":
        toReturn = 18;
        break;
      case "N":
        toReturn = 20;
        break;
      case "O":
        toReturn = 11;
        break;
      case "P":
        toReturn = 3;
        break;
      case "Q":
        toReturn = 6;
        break;
      case "R":
        toReturn = 8;
        break;
      case "S":
        toReturn = 12;
        break;
      case "T":
        toReturn = 14;
        break;
      case "U":
        toReturn = 16;
        break;
      case "V":
        toReturn = 10;
        break;
      case "W":
        toReturn = 22;
        break;
      case "X":
        toReturn = 25;
        break;
      case "Y":
        toReturn = 24;
        break;
      case "Z":
        toReturn = 23;
        break;
    }
    return toReturn;
  }
}
