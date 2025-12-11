import { useState } from "react";
import colors from "../../../../common/global";
import ColoredMarkers from "../../../atoms/ColoredMarkers";
import Portal from "../../../Portal";
import {
  calcClusterOpacity,
  calcClusterSize,
  isLatitude,
  isLongitude,
  calculateColorPercentages,
  zipColorsToPercentages,
  calculateTotalClusterPoints,
} from "../../../../common/utilities";

const HIGHLIGHT_COLOR = "#E31A1B";

const DefsClusters = () => (
  <defs>
    <radialGradient id="clusterGradient">
      <stop offset="10%" stopColor="red" />
      <stop offset="90%" stopColor="transparent" />
    </radialGradient>
  </defs>
);

function Cluster({
  cluster,
  size,
  projectPoint,
  totalPoints,
  styles,
  renderHover,
  onClick,
  getClusterChildren,
  coloringSet,
  filterColors,
  highlighted,
}) {
  /**
  {
    geometry: {
      coordinates: [longitude, latitude]
    },
    properties: {
      cluster: true|false,
      cluster_id: int,
      point_count: int,
      point_count_abbreviated: int
    },
    type: "Feature"
  }
  */
  const { cluster_id: clusterId } = cluster.properties;

  const individualChildren = getClusterChildren(clusterId);

  // Calculate percentage of highlighted events in this cluster
  const allEvents = individualChildren.flatMap((loc) => loc.events);
  const totalEvents = allEvents.length;
  const highlightedEvents =
    highlighted && highlighted.length > 0
      ? allEvents.filter((event) => highlighted.includes(event.civId))
      : [];
  const highlightedCount = highlightedEvents.length;
  const highlightedPercent = totalEvents > 0 ? highlightedCount / totalEvents : 0;

  let colorPercentMap;
  if (highlightedPercent === 1) {
    // All events are highlighted
    colorPercentMap = { [HIGHLIGHT_COLOR]: 1 };
  } else if (highlightedPercent > 0) {
    // Mix of highlighted and non-highlighted events
    const nonHighlightedChildren = individualChildren.map((loc) => ({
      ...loc,
      events: loc.events.filter(
        (event) => !highlighted || !highlighted.includes(event.civId)
      ),
    })).filter((loc) => loc.events.length > 0);

    const colorPercentages = calculateColorPercentages(
      nonHighlightedChildren,
      coloringSet
    );
    // Scale down the category percentages and add highlight percentage
    const scaledPercentages = colorPercentages.map(
      (p) => p * (1 - highlightedPercent)
    );
    colorPercentMap = zipColorsToPercentages(filterColors, scaledPercentages);
    colorPercentMap[HIGHLIGHT_COLOR] = highlightedPercent;
  } else {
    // No highlighted events
    const colorPercentages = calculateColorPercentages(
      individualChildren,
      coloringSet
    );
    colorPercentMap = zipColorsToPercentages(filterColors, colorPercentages);
  }

  const { coordinates } = cluster.geometry;
  const [longitude, latitude] = coordinates;
  const { x, y } = projectPoint([latitude, longitude]);
  const [hovered, setHovered] = useState(false);
  if (!isLatitude(latitude) || !isLongitude(longitude)) return null;

  return (
    <svg>
      <g
        className="cluster-event"
        transform={`translate(${x}, ${y})`}
        onClick={(e) => onClick({ id: clusterId, latitude, longitude })}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <ColoredMarkers
          radius={size}
          colorPercentMap={colorPercentMap}
          styles={{
            ...styles,
          }}
          className="cluster-event-marker"
        />
        {hovered ? renderHover(cluster) : null}
      </g>
    </svg>
  );
}

function ClusterEvents({
  projectPoint,
  onSelect,
  getClusterChildren,
  coloringSet,
  isRadial,
  svg,
  clusters,
  filterColors,
  selected,
  highlighted,
}) {
  const totalPoints = calculateTotalClusterPoints(clusters);

  const styles = {
    fill: isRadial ? "url('#clusterGradient')" : colors.fallbackEventColor,
    stroke: colors.darkBackground,
    strokeWidth: 0,
  };

  function renderHover(txt, circleSize) {
    return (
      <>
        <text
          textAnchor="middle"
          y="3px"
          style={{ fontWeight: "bold", fill: "black", zIndex: 10000 }}
        >
          {txt}
        </text>
        <circle
          className="event-hover"
          cx="0"
          cy="0"
          r={circleSize + 2}
          stroke={colors.primaryHighlight}
          fillOpacity="0.0"
        />
      </>
    );
  }

  return (
    <Portal node={svg}>
      <svg>
        <g className="cluster-locations">
          {isRadial ? <DefsClusters /> : null}
          {clusters.map((c, idx) => {
            const pointCount = c.properties.point_count;
            const clusterSize = calcClusterSize(pointCount, totalPoints);
            return (
              <Cluster
                key={idx}
                onClick={onSelect}
                getClusterChildren={getClusterChildren}
                coloringSet={coloringSet}
                cluster={c}
                filterColors={filterColors}
                highlighted={highlighted}
                size={clusterSize}
                projectPoint={projectPoint}
                totalPoints={totalPoints}
                styles={{
                  ...styles,
                  fillOpacity: calcClusterOpacity(pointCount, totalPoints),
                }}
                renderHover={() => renderHover(pointCount, clusterSize)}
              />
            );
          })}
        </g>
      </svg>
    </Portal>
  );
}

export default ClusterEvents;
