const TimelineClip = ({ dims }) => (
  <clipPath id="clip">
    <rect
      x={dims.marginLeft}
      y="0"
      width={Math.max(0, dims.width - dims.marginLeft * 2)}
      height={dims.contentHeight}
    />
  </clipPath>
);

export default TimelineClip;
