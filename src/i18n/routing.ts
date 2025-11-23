import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Supported locales
  locales: ["en", "zh"],

  // Default locale when no locale prefix is present
  defaultLocale: "en",

  // Locale prefix strategy: always show locale in URL
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
