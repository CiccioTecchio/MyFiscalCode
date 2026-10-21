import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["it-IT", "en-US"],
  defaultLocale: "it-IT",
  localePrefix: "always",
});
