import { Comune } from "../types/Comune";
import { removeSpaceAndSpecialCharacters } from "./parsing";

export function binarySearchComune(
  listComuni: Comune[],
  targetComune: string,
): string {
  let inf = 0;
  let sup = listComuni.length - 1;
  let comune: Comune | null = null;

  while (inf <= sup && !comune) {
    const mid = Math.floor((inf + sup) / 2);
    const currentComune = listComuni[mid];
    const currentNomeComune = removeSpaceAndSpecialCharacters(
      currentComune.nomeComune,
    );

    if (currentNomeComune.localeCompare(targetComune) === 0) {
      comune = currentComune;
    } else if (currentNomeComune.localeCompare(targetComune) < 0) {
      inf = mid + 1;
    } else {
      sup = mid - 1;
    }
  }
  return comune ? comune.codiceComune : "";
}
