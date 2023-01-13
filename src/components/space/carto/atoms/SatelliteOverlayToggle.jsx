import React from "react";
import copy from "../../../../common/data/copy.json";
import { language } from "../../../../common/utilities";
import mapImg from "../../../../assets/satelliteoverlaytoggle/map.png";
import satImg from "../../../../assets/satelliteoverlaytoggle/sat.png";

const SatelliteOverlayToggle = ({ isUsingSatellite, toggleSatellite }) => {
  const toggleClass = isUsingSatellite
    ? "satellite-overlay-toggle-map"
    : "satellite-overlay-toggle-sat";
  const toggleImg = isUsingSatellite ? mapImg : satImg;
  const toggleLabel = isUsingSatellite
    ? copy[language].tiles.default
    : copy[language].tiles.satellite;
  return (
    <div id="satellite-overlay-toggle" className="satellite-overlay-toggle">
      <button
        className={`satellite-overlay-toggle-button ${toggleClass}`}
        style={{ backgroundImage: `url(${toggleImg}` }}
        name="satellite-toggle"
        onClick={toggleSatellite}
      >
        <div className="label">{toggleLabel}</div>
      </button>
    </div>
  );
};

export default SatelliteOverlayToggle;
