import React from "react";
import { DownloadButton } from "./DownloadButton";

const DownloadPanel = ({
  language,
  title,
  description,
  domain
}) => {
  return (
    <div className="react-innertabpanel">
      <h2>{title}</h2>
      <p>{description}</p>
      <hr/>
      <DownloadButton language={language} domain={domain} format="csv" />
      <DownloadButton language={language} domain={domain} format="json" />
    </div>
  );
};

export default DownloadPanel;
