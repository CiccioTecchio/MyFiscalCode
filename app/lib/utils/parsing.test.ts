import { removeSpaceAndSpecialCharacters } from "./parsing";

describe("removeSpaceAndSpecialCharacters", () => {
  it("converte le lettere in maiuscolo", () => {
    // Arrange
    const value = "mario";

    // Act
    const result = removeSpaceAndSpecialCharacters(value);

    // Assert
    expect(result).toBe("MARIO");
  });

  it.each([
    ["D'Angelo", "DANGELO"],
    ["De Luca", "DELUCA"],
    ["Nicolò", "NICOLO"],
    ["Anna-Maria 2", "ANNAMARIA"],
  ])("normalizza %j in %j", (value, expected) => {
    expect(removeSpaceAndSpecialCharacters(value)).toBe(expected);
  });
});
