import { useRef } from "react";
import { useCallback } from "react";
import { typeForPath } from "../../../common/utilities";
import { TwitterTweetEmbed } from "react-twitter-embed";
import TelegramPostEmbed from "./TelegramEmbed";

const TITLE_LENGTH = 50;
// TODO should videos
//    - play inline
//    - appear zoomed out/in
//    - only show cover image and then lightbox when clicked
//    - show video control plane?
// TODO landscape image doesn't fit in box properly
const Media = ({ cardIdx, src, title, graphic }) => {
  const wrapGraphic = (content) => {
    if (!graphic) return content;

    const contentId = `graphic${cardIdx}`;
    const overlayId = `overlay-${contentId}`;
    return (
      <div>
        <div className={`card-cell media source-graphic ${overlayId}`}>
          <h4
            onClick={() => {
              Array.from(document.querySelectorAll("." + contentId)).map(
                (o) => (o.style.display = "block")
              );
              // Array.from(document.querySelectorAll("." + overlayId)).map(o => o.remove())
              Array.from(document.querySelectorAll("." + overlayId)).map(
                (o) => (o.style.display = "none")
              );
              // document.getElementById(contentId).style.display = "block"
            }}
          >
            Graphic content
            <br />
            Click here to show
          </h4>
        </div>
        <span className={contentId} style={{ display: "none" }}>
          {content}
        </span>
      </div>
    );
  };
  const videoRef = useRef();
  const onVideoStart = useCallback(() => {
    return videoRef.current?.play();
  }, []);
  const onVideoStop = useCallback(() => {
    return videoRef.current?.pause();
  }, []);

  const type = typeForPath(src);
  const formattedTitle =
    title && title.length > TITLE_LENGTH
      ? `${title.slice(0, TITLE_LENGTH + 1)}...`
      : title;

  switch (type) {
    case "Video":
      return wrapGraphic(
        <div className="card-cell media">
          {title && <h4 title={title}>{formattedTitle}</h4>}
          <video
            onMouseEnter={onVideoStart}
            onMouseLeave={onVideoStop}
            ref={videoRef}
            // controls
            // controlsList="nodownload noremoteplayback"
            disablePictureInPicture
          >
            <source src={src} />
          </video>
        </div>
      );
    case "Image":
      return wrapGraphic(
        <div className="card-cell media">
          {title && <h4 title={title}>{formattedTitle}</h4>}
          <div className="img-wrapper">
            <img
              src={src}
              alt="an inline photograph for the event card component"
            />
          </div>
        </div>
      );

    case "Telegram":
      return wrapGraphic(
        <div className="card-cell media embedded">
          <TelegramPostEmbed src={src} />
        </div>
      );

    case "Tweet":
      const tweetIdRegex =
        /https?:\/\/(mobile\.){0,1}twitter.com\/[0-9a-zA-Z_]{1,20}\/status\/([0-9]*)/;
      const match = tweetIdRegex.exec(src);
      if (!match || match.length < 2) {
        return null;
      }
      const tweetId = match[match.length - 1];

      return wrapGraphic(
        <div className="card-cell media embedded">
          <TwitterTweetEmbed
            tweetId={tweetId}
            options={{ conversation: "none" }}
          />
        </div>
      );
    default:
      if (src === "HIDDEN") {
        return (
          <div className="card-cell media source-hidden">
            <h4>
              Source hidden
              <br />
              Privacy concerns
            </h4>
          </div>
        );
      } else {
        return null;
      }
  }
};

export default Media;
