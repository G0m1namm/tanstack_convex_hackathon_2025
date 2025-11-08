import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { i18n } from "@lingui/core";

const languages = ["es", "en"] as const;

// List of languages your application supports.
export const supportedLangs = [...languages];

const i18nCookieName = "linguiLng";

// Initialize Lingui i18n with static imports for reliable build-time loading
import { messages as enMessages } from "../public/locales/en/messages.mjs";
import { messages as esMessages } from "../public/locales/es/messages.mjs";

i18n.load({
  en: enMessages,
  es: esMessages,
});

i18n.activate("en"); // Default language

export const setSSRLanguage = createIsomorphicFn().server(async () => {
  const language = getCookie(i18nCookieName);
  if (language && supportedLangs.includes(language as any)) {
    i18n.activate(language);
  } else {
    i18n.activate("en");
  }
});

// Helper function to change language and set cookie
export const changeLanguage = createIsomorphicFn().server(async (lang: string) => {
  if (supportedLangs.includes(lang as any)) {
    i18n.activate(lang);
    setCookie(i18nCookieName, lang, {
      maxAge: 60 * 24 * 365, // 1 year
      path: "/",
    });
  }
});

export { i18n };
