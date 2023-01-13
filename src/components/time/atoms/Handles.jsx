const TimelineHandles = ({ dims, onMoveTime, backward }) => {
  if (backward === true) {
    return (
      <div className="timeline-handle" onClick={() => onMoveTime("backwards")}>
        <span className="timeline-handle__triangle"></span>
      </div>
    );
  }

  return (
    <div
      className="timeline-handle right"
      onClick={() => onMoveTime("forward")}
    >
      <span className="timeline-handle__triangle"></span>
    </div>
  );
};

export default TimelineHandles;
