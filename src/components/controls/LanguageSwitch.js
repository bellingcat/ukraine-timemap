import { createElement } from "react";
import copy from "../../common/data/copy.json";

export function LanguageSwitch({
  language: currentLanguage,
  languages,
  actions: { toggleLanguage },
}) {
  if (!languages || languages.length <= 1) return null;
  return createElement("div", {
    className: "language-switch",
    onClick: () => toggleLanguage(),
    children: languages.map((language) =>
      createElement("span", {
        key: language,
        className:
          language !== currentLanguage
            ? "language-option"
            : "language-option selected",
        children: copy[language].language_short,
      })
    ),
  });
}
