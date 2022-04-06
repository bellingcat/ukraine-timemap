import React from "react";
import Popup from "./atoms/Popup";
import { useTranslate } from "./translate.js";

const Infopopup = ({ isOpen, onClose, language, styles }) => {
  const translate = useTranslate(language);
  return (
    <Popup
      title={translate("legend.default.header")}
      content={translate("legend.default.intro", { fallback: [] })}
      onClose={onClose}
      isOpen={isOpen}
      styles={styles}
    />
  );
};

export default Infopopup;
