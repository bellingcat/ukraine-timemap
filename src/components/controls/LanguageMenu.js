import { ToolbarButton } from "./atoms/ToolbarButton";
import copy from "../../common/data/copy.json";

export function LanguageMenu({
  isActive,
  language: currentLanguage,
  languages,
  setLanguage,
}) {
  return (
    <div
      className={
        isActive
          ? "toolbar-panel language-menu active"
          : "toolbar-panel language-menu"
      }
      children={languages.map((language) => (
        <div
          key={language}
          onClick={() => setLanguage(language)}
          className={
            language !== currentLanguage
              ? "language-option"
              : "language-option selected"
          }
          children={copy[language].language_long}
        />
      ))}
    />
  );
}

export function ToolbarLanguageMenu({
  isActive,
  setIsActive,
  language,
  languages,
  setLanguage,
}) {
  return (
    <div className="toolbar-menu">
      <ToolbarButton
        isActive={isActive}
        onClick={() => setIsActive(!isActive)}
        iconKey="translate"
        label={copy[language].language_label}
      />
      <LanguageMenu
        isActive={isActive}
        language={language}
        languages={languages}
        setLanguage={(language) => {
          setIsActive(false);
          setLanguage(language);
        }}
      />
    </div>
  );
}
