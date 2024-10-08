import { makeNiceDate } from "../../../common/utilities";

const TimelineHeader = ({ title, from, to, onClick, hideInfo, resetTest, resetClick }) => {
  const d0 = from && makeNiceDate(from);
  const d1 = to && makeNiceDate(to);
  return (
    <div className="timeline-header">
      <div className="timeline-toggle" onClick={() => onClick()}>
        <p>
          <i className="arrow-down" />
        </p>
      </div>
      <div className={`timeline-info ${hideInfo ? "hidden" : ""}`}>
        <p dangerouslySetInnerHTML={{ __html: title }} />
        <p>
          {d0} - {d1}
          <small className="reset-button" onClick={() => resetClick() }><a className="cell">{ resetTest }</a></small>
        </p>
      </div>
    </div>
  );
};

export default TimelineHeader;
