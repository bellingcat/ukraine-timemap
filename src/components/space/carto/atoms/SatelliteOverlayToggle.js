import React from "react";
import copy from "../../../../common/data/copy.json";
import { language } from "../../../../common/utilities";

const SatelliteOverlayToggle = ({
  switchToSatellite,
  reset,
  isUsingSatellite,
}) => {
  return (
    <div id="satellite-overlay-toggle" className="satellite-overlay-toggle">
      <button
        disabled={!isUsingSatellite}
        id="satellite-overlay-toggle-default"
        className={
          !isUsingSatellite
            ? "satellite-overlay-toggle-button-active"
            : "satellite-overlay-toggle-button-inactive"
        }
        onClick={reset}
      >
        {copy[language].tiles.default}
      </button>
      <button
        id="satellite-overlay-toggle-satellite"
        className={
          isUsingSatellite
            ? "satellite-overlay-toggle-button-active"
            : "satellite-overlay-toggle-button-inactive"
        }
        disabled={isUsingSatellite}
        onClick={switchToSatellite}
      >
        {copy[language].tiles.satellite}
      </button>
    </div>
  );
};

export default SatelliteOverlayToggle;
