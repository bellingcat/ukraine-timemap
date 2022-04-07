/**
 * Picks the most preferred of the available languages. Comparison only on
 * the primary language tag. Region, variant, and script tags are ignored.
 *
 * @param {readonly string[]} availableLanguages: Languages to pick from.
 * @param {readonly string[]} preferredLanguages: Languages to prefer.
 * @return {string|undefined} matching language, if any.
 * @example
 * pickPreferredLanguage(['en', 'ru', 'uk'], ['be-BY', 'ru-BY', 'en-UK']) // => 'ru'
 */
export function pickPreferredLanguage(availableLanguages, preferredLanguages) {
  for (const preferredLanguage of preferredLanguages) {
    const preferredLanguageCode = languageTagCode(preferredLanguage);
    for (const availableLanguage of availableLanguages) {
      const availableLanguageCode = languageTagCode(availableLanguage);
      if (availableLanguageCode === preferredLanguageCode)
        return availableLanguage;
    }
  }
}

/**
 * Takes the language tag as per RFC5646 ("uk", "uk-UA", "ru-BY", en-GB").
 * Returns the primary language-code subtag (lower-case, ISO 639).
 *
 * @param {string} languageTag language tag with one or more subtags
 * @return {string|undefined} first subtag, two/three lowercase letters
 * @example languageTagCode('en-US') // => 'en'
 * @example languageTagCode('uk') // => 'uk'
 * @see https://tools.ietf.org/html/rfc5646
 */
export function languageTagCode(languageTag) {
  const matches = languageTag.toLowerCase().match(/^[a-z]{2,3}/);
  return (matches ?? [])[0];
}
