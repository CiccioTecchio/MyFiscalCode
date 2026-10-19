import { render, screen } from "@testing-library/react";
import FiscalCodeError from "./FiscalCodeError";

describe("FiscalCodeError", () => {
  it("mostra il messaggio come avviso accessibile", () => {
    render(
      <FiscalCodeError message="Non è stato possibile calcolare il codice fiscale." />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Non è stato possibile calcolare il codice fiscale.",
    );
  });
});
