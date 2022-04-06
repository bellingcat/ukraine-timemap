import { languageTagCode, pickPreferredLanguage } from "./language.js";

describe("language tag matching", () => {
  test("languageTagCode", () => {
    expect(languageTagCode("en-US")).toEqual("en");
    expect(languageTagCode("uk")).toEqual("uk");
    expect(languageTagCode("UK")).toEqual("uk");
    expect(languageTagCode("i-")).toBeUndefined();
    expect(languageTagCode("-")).toBeUndefined();
    expect(languageTagCode("")).toBeUndefined();
  });
  test("pickPreferredLanguage", () => {
    expect(pickPreferredLanguage(["en", "ru", "uk"], ["en-GB"])).toBe("en");
    expect(pickPreferredLanguage(["en-US", "uk-UA"], ["en-GB"])).toBe("en-US");
    expect(
      pickPreferredLanguage(
        ["en", "ru", "uk"],
        ["pl-PL", "uk-UA", "ru-RU", "en-GB"]
      )
    ).toBe("uk");
    expect(
      pickPreferredLanguage(
        ["en-US", "ru-RU", "uk-UA"],
        ["pl-PL", "ru-BY", "en-GB"]
      )
    ).toBe("ru-RU");
    expect(
      pickPreferredLanguage(["en", "uk"], ["sv-SE", "fr-FR"])
    ).toBeUndefined();
  });
});
