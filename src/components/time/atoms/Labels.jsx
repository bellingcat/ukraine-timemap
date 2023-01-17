import React from "react";

const TimelineLabels = ({ dims, timelabels }) => {
  return (
    <g>
      <line
        className="axisBoundaries"
        x1={dims.marginLeft}
        x2={dims.marginLeft}
        y1="10"
        y2="20"
      />
      <line
        className="axisBoundaries"
        x1={dims.width - dims.width_controls}
        x2={dims.width - dims.width_controls}
        y1="10"
        y2="20"
      />
      <text className="timeLabel0 timeLabel" x="5" y="15">
        {timelabels[0]}
      </text>
      <text
        className="timelabelF timeLabel"
        x={dims.width - dims.width_controls - 5}
        y="135"
        style={{ textAnchor: "end" }}
      >
        {timelabels[1]}
      </text>
    </g>
  );
};

export default TimelineLabels;
