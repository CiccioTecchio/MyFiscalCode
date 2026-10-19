import type { Config } from "jest";
import nextJest from "next/jest.js";

// next/jest configura la trasformazione di TypeScript, JSX, CSS e degli altri
// moduli usati da Next.js. L'alias `@` viene dichiarato esplicitamente sotto.
const createJestConfig = nextJest();

const config: Config = {
  clearMocks: true,
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/tests/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverage: false,
  // Include anche questi file se una suite non li importa ancora: in questo
  // modo il report rende visibile la copertura mancante invece di ometterli.
  collectCoverageFrom: [
    "app/api/birth-place/route.ts",
    "app/components/BornPlace.tsx",
    "app/components/FiscalCodeForm.tsx",
    "app/lib/types/PersonData.ts",
    "app/lib/utils/parsing.ts",
    "app/action.ts",
    "proxy.ts",
  ],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
};

export default createJestConfig(config);
