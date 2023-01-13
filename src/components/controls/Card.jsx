import { useState } from "react";
import CardText from "./atoms/Text";
import CardTime from "./atoms/Time";
import CardButton from "./atoms/Button";
import CardCaret from "./atoms/Caret";
import CardCustom from "./atoms/CustomField";
import CardMedia from "./atoms/Media";

import { makeNiceDate, isEmptyString } from "../../common/utilities";
import hash from "object-hash";

export const generateCardLayout = {
  basic: ({ event }) => {
    return [
      [
        {
          kind: "date",
          title: "Reported Incident Date",
          value: event.datetime || event.date || ``,
        },
        {
          kind: "text",
          title: "Location",
          value: event.location || `—`,
        },
        {
          kind: "text",
          title: "id",
          value: event.civId || `—`,
        },
      ],
      [{ kind: "line-break", times: 0.4 }],
      [
        {
          kind: "text",
          title: "Summary",
          value: event.description || ``,
          scaleFont: 1.1,
        },
      ],
    ];
  },
  sourced: ({ event }) => {
    return [
      [
        {
          kind: "date",
          title: "Reported Incident Date",
          value: event.datetime || event.date || ``,
        },
        {
          kind: "text",
          title: "Location",
          value: event.location || `—`,
        },
        {
          kind: "text",
          title: "id",
          value: event.civId || `—`,
        },
      ],
      [
        {
          kind: "text",
          title: "Summary",
          value: event.description || ``,
          scaleFont: 1.1,
        },
      ],
      [
        {
          kind: "sources",
          values: event.sources.flatMap((source) => [
            source.paths.map((p) => ({
              kind: "media",
              title: "Media",
              value: [
                { src: p, title: null, graphic: event.graphic === "TRUE" },
              ],
            })),
          ]),
        },
      ],
    ];
  },
};

export const Card = ({
  content = [],
  isLoading = true,
  cardIdx = -1,
  onSelect = () => {},
  sources = [],
  isSelected = false,
  language = "en-US",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  // NB: should be internationalized.
  const renderTime = (field) => (
    <CardTime
      language={language}
      timelabel={makeNiceDate(field.value)}
      {...field}
    />
  );

  const renderCaret = () =>
    sources.length === 0 && (
      <CardCaret toggle={() => toggle()} isOpen={isOpen} />
    );

  const renderMedia = ({ media, idx, cardIdx }) => {
    return (
      <CardMedia
        key={idx}
        cardIdx={cardIdx}
        src={media.src}
        title={media.title}
        graphic={media.graphic}
      />
    );
  };

  function renderField(field, cardIdx) {
    switch (field.kind) {
      case "media":
        return (
          <div className="card-cell">
            {field.value.map((media, idx) => {
              return renderMedia({ media, idx, cardIdx });
            })}
          </div>
        );
      case "line":
        return (
          <div style={{ height: `1rem`, width: `100%` }}>
            <hr />
          </div>
        );
      case "line-break":
        return (
          <div style={{ height: `${field.times || 1}rem`, width: `100%` }} />
        );
      case "item":
        // this is like a span
        return null;
      case "markdown":
        return <CardCustom {...field} />;
      case "tag":
        return (
          <div
            className="card-cell m0"
            style={{
              textTransform: `uppercase`,
              fontSize: `.8em`,
              lineHeight: `.8em`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: `flex-${field.align || `start`}`,
              }}
            >
              {field.value}
            </div>
          </div>
        );
      case "button":
        return (
          <div className="card-cell">
            {field.title && <h4>{field.title}</h4>}
            {/* <div className="card-row"> */}
            {field.value.map((t, idx) => (
              <CardButton key={`card-button-${idx}`} {...t} />
            ))}
            {/* </div> */}
          </div>
        );
      case "text":
        return !isEmptyString(field.value) && <CardText {...field} />;
      case "date":
        return renderTime(field);
      case "links":
        return (
          <div className="card-cell">
            {field.title && <h4>{field.title}</h4>}
            <div className="card-row m0">
              {field.value.map(({ text, href }, idx) => (
                <a href={href} key={`card-links-url-${idx}`}>
                  {text}
                </a>
              ))}
            </div>
          </div>
        );
      case "list":
        // Only render if some of the list's strings are non-empty
        const shouldFieldRender =
          !!field.value.length &&
          !!field.value.filter((s) => !isEmptyString(s)).length;
        return shouldFieldRender ? (
          // <div className="card-cell">
          <div>
            {field.title && <h4>{field.title}</h4>}
            <div className="card-row m0">
              {field.value.map((t, idx) => (
                <CardText key={`card-list-text-${idx}`} value={t} {...t} />
              ))}
            </div>
          </div>
        ) : null;
      default:
        return null;
    }
  }

  function renderRow(row, cardIdx, salt) {
    return (
      <div className="card-row" key={hash({ ...row, salt })}>
        {row.map((field) => (
          // src by src meaning wrapGrahpic must be called around a map of renderField for sources
          <span key={hash({ ...field, row: row })}>
            {renderField(field, cardIdx)}
          </span>
        ))}
      </div>
    );
  }

  // TODO: render afterCaret appropriately from props
  sources = [];

  return (
    <li
      key={hash(content)}
      className={`event-card ${isSelected ? "selected" : ""}`}
      onClick={onSelect}
    >
      {content.map((row) => {
        if (row[0].kind === "sources" && row[0].values.length > 0) {
          return (
            <div>
              <details open="true">
                <summary>
                  <span className="summary-line"></span>
                  <span className="summary-text">
                    <span className="summary-show">Show</span>{" "}
                    <span className="summary-hide">Hide</span> sources (
                    {row[0].values.length})
                  </span>
                  <span className="summary-line"></span>
                </summary>
                {row[0].values.map((r) => renderRow(r, cardIdx, row[0]))}
              </details>
            </div>
          );
        } else return renderRow(row, cardIdx);
      })}

      {/* {isOpen && (
        <div className="card-bottomhalf">
          {sources.map(() => (
            <div className="card-row"></div>
          ))}
        </div>
      )} */}
      {sources.length > 0 ? renderCaret() : null}
    </li>
  );
};
