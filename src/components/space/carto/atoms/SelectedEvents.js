import React from "react";
import { Portal } from "react-portal";
import colors from "../../../../common/global";

class MapSelectedEvents extends React.Component {
  renderMarker(marker, idx) {
    const { x, y } = this.props.projectPoint([
      marker.latitude,
      marker.longitude,
    ]);
    const styles = this.props.styles;
    const r = marker.radius ? marker.radius + 5 : 24;
    return (
      <g
        key={idx}
        className="location-marker"
        transform={`translate(${x - r}, ${y})`}
      >
        <path
          className="leaflet-interactive"
          stroke={styles ? styles.stroke : colors.primaryHighlight}
          strokeOpacity="1"
          strokeWidth={styles ? styles["stroke-width"] : 2}
          strokeLinecap=""
          strokeLinejoin="round"
          strokeDasharray={styles ? styles["stroke-dasharray"] : "2,2"}
          fill="none"
          d={`M0,0a${r},${r} 0 1,0 ${r * 2},0 a${r},${r} 0 1,0 -${r * 2},0 `}
        />
      </g>
    );
  }

  render() {
    return (
      <Portal node={this.props.svg}>
        {this.props.selected.map((s, idx) => this.renderMarker(s, idx))}
      </Portal>
    );
  }
}
export default MapSelectedEvents;
