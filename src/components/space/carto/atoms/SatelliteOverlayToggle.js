import React from "react";
import { useTranslate } from "../../../translate.js";
import mapImg from "../../../../assets/satelliteoverlaytoggle/map.png";
import satImg from "../../../../assets/satelliteoverlaytoggle/sat.png";

const SatelliteOverlayToggle = ({
  switchToSatellite,
  reset,
  isUsingSatellite,
}) => {
  const translate = useTranslate();
  return (
    <div id="satellite-overlay-toggle" className="satellite-overlay-toggle">
      {isUsingSatellite ? (
        <button
          className="satellite-overlay-toggle-button satellite-overlay-toggle-map"
          style={{ backgroundImage: `url(${mapImg}` }}
          onClick={reset}
        >
          <div className="label">{translate("tiles.default")}</div>
        </button>
      ) : (
        <button
          className="satellite-overlay-toggle-button satellite-overlay-toggle-sat"
          style={{ backgroundImage: `url(${satImg}` }}
          onClick={switchToSatellite}
        >
          <div className="label">{translate("tiles.satellite")}</div>
        </button>
      )}
    </div>
  );
};

export default SatelliteOverlayToggle;
