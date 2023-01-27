import { DownloadButton } from "./DownloadButton";

const DownloadPanel = ({ language, title, description, domain }) => {
  return (
    <div className="react-innertabpanel">
      <div className="sticky-header">
        <h2>{title}</h2>
      </div>
      <div
        className="panel-description"
        dangerouslySetInnerHTML={{
          __html: description,
        }}
      />
      <hr />
      <DownloadButton language={language} domain={domain} format="csv" />
      <DownloadButton language={language} domain={domain} format="json" />
    </div>
  );
};

export default DownloadPanel;
