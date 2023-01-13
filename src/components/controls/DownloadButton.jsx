import { Component } from "react";
import dayjs from "dayjs";
import { Parser } from "@json2csv/plainjs";
import copy from "../../common/data/copy.json";
import { downloadAsFile } from "../../common/utilities";

export class DownloadButton extends Component {
  onDownload(format, domain) {
    let filename = `ukr-civharm-${dayjs().format("YYYY-MM-DD")}`;
    if (format === "csv") {
      let outputData = this.getCsvData(domain);
      downloadAsFile(`${filename}.csv`, outputData);
    } else if (format === "json") {
      let outputData = this.getJsonData(domain);
      downloadAsFile(`${filename}.json`, outputData);
    }
  }
  getCsvData(domain) {
    const { events, sources } = domain;
    const exportEvents = events.map((e) => {
      return {
        id: e.civId,
        date: e.date,
        latitude: e.latitude,
        longitude: e.longitude,
        location: e.location,
        description: e.description,
        sources: e.sources.map((s) => sources[s].paths[0]).join(","),
        associations: e.associations
          .map((a) => a.filter_paths.join("="))
          .join(","),
      };
    });
    const parser = new Parser();
    return parser.parse(exportEvents, { flatten: true });
  }
  getJsonData(domain) {
    const { events, sources } = domain;
    const exportEvents = events.map((e) => {
      return {
        id: e.civId,
        date: e.date,
        latitude: e.latitude,
        longitude: e.longitude,
        location: e.location,
        description: e.description,
        sources: e.sources.map((id) => {
          const s = sources[id];
          return {
            id,
            path: s.paths[0],
            description: s.description,
          };
        }),
        filters: e.associations.map((a) => {
          return {
            key: a.filter_paths[0],
            value: a.filter_paths[1],
          };
        }),
      };
    });
    return JSON.stringify(exportEvents);
  }
  render() {
    const { language, domain, format } = this.props;
    const textByFormat = copy[language].toolbar.download.panel.formats[format];
    return (
      <div className="download-row">
        <span
          className="download-button"
          key={`download-${format}`}
          onClick={() => this.onDownload(format, domain)}
        >
          <i className="material-icons">{"download"}</i>
          <span className="tab-caption">{textByFormat.label}</span>
        </span>
        <span className="download-description">{textByFormat.description}</span>
      </div>
    );
  }
}
