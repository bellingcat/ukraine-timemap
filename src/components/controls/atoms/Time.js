import React from "react";

import { useTranslate } from "../../translate.js";
import { isNotNullNorUndefined } from "../../../common/utilities";

const CardTime = ({ title = "Timestamp", timelabel, language, precision }) => {
  const translate = useTranslate(language);
  const unknownLang = translate("cardstack.unknown_time");

  if (isNotNullNorUndefined(timelabel)) {
    return (
      <div className="card-cell">
        {/* <i className="material-icons left">today</i> */}
        <h4>{title}</h4>
        {timelabel}
        {precision && precision !== "" ? ` - ${precision}` : null}
      </div>
    );
  } else {
    return (
      <div className="card-cell">
        {/* <i className="material-icons left">today</i> */}
        <h4>{title}</h4>
        {unknownLang}
      </div>
    );
  }
};

export default CardTime;
