import { useEffect, useState, useCallback } from "react";

import copy from "../common/data/copy.json";

export function translateTo(language) {
  const languageCopy = copy[language];
  return function translate(path, { fallback } = { fallback: undefined }) {
    const lookup = pathLookup(path);
    var placeholder = path.toString();
    if (!lookup) return onMissingPath(), fallback || placeholder;
    var value;
    if ((value = lookup(process.env))) {
      placeholder = `config.${path}`;
      if (typeof value === "object" && value !== null) {
        value = value[language];
        placeholder += "." + language;
      }
    } else {
      value = lookup(languageCopy);
      placeholder = `copy.${language}.${path}`;
    }
    return value ?? (onMissingValue(), fallback || placeholder);

    function onMissingPath() {
      console.warn(`translateTo(${placeholder}): missing path`);
    }
    function onMissingValue() {
      console.warn(`translateTo(${placeholder}): missing value`);
    }
  };
}

function pathLookup(path) {
  if (typeof path === "function") return path;
  if (typeof path === "string" && path) return pathLookup(path.split("."));
  if (Array.isArray(path) && path.length > 0) {
    return path.reduceRight(lookupSegment, (a) => a);
  }
  function lookupPathSegment(value, segment) {
    if (typeof value === "object" && value !== null) return value[segment];
  }
  function lookupSegment(lookupSegments, segment) {
    return (value) => lookupSegments(lookupPathSegment(value, segment));
  }
}

// Hook for getting translation function. If a language is provided it will be
// used instead of the current one.
export function useTranslate(language) {
  const currentLanguage = useLanguage();
  return translateTo(language || currentLanguage);
}

// Hook for accessing current language.
export function useLanguage() {
  // FIXME: Update react-redux dependency and replace this with
  //   useSelector(state => state.app.language)
  const store = require("../store").default;
  const getLanguage = useCallback(() => store.getState().app.language, [store]);
  const [language, setLanguage] = useState(getLanguage);
  useEffect(
    () => store.subscribe(() => setLanguage(getLanguage())),
    [store, getLanguage] // can you spot a problem here?
  );
  return language;
}
