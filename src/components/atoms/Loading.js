import React from "react";
import { useTranslate } from "../translate.js";

const LoadingOverlay = ({ isLoading, language }) => {
  const translate = useTranslate(language);
  let classes = "loading-overlay";
  classes += !isLoading ? " hidden" : "";

  return (
    <div id="loading-overlay" className={classes}>
      <div className="loading-wrapper">
        <span id="loading-text" className="text">
          {translate("loading")}
        </span>
        <div className="spinner">
          <div className="double-bounce1" />
          <div className="double-bounce2" />
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
