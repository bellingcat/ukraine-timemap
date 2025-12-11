import colors from "../../../../common/global";
import ColoredMarkers from "../../../atoms/ColoredMarkers";
import Portal from "../../../Portal";
import hash from "object-hash";
import {
  calcOpacity,
  calculateColorPercentages,
  zipColorsToPercentages,
} from "../../../../common/utilities";

const HIGHLIGHT_COLOR = "#E31A1B";

function MapEvents({
  getCategoryColor,
  categories,
  projectPoint,
  styleLocation,
  selected,
  highlighted,
  narrative,
  onSelect,
  svg,
  locations,
  eventRadius,
  coloringSet,
  filterColors,
  features,
}) {
  function handleEventSelect(e, location) {
    const events = e.shiftKey
      ? selected.concat(location.events)
      : location.events;
    onSelect(events);
  }

  function renderBorder() {
    return (
      <>
        <circle
          className="event-hover"
          cx="0"
          cy="0"
          r="10"
          stroke={colors.primaryHighlight}
          fillOpacity="0.0"
        />
      </>
    );
  }

  function renderLocationSlicesByAssociation(location) {
    const styles = {
      stroke: colors.darkBackground,
      strokeWidth: 0,
      fillOpacity: narrative ? 1 : calcOpacity(location.events.length),
    };

    // Calculate percentage of highlighted events
    const totalEvents = location.events.length;
    const highlightedEvents =
      highlighted && highlighted.length > 0
        ? location.events.filter((event) => highlighted.includes(event.civId))
        : [];
    const highlightedCount = highlightedEvents.length;
    const highlightedPercent = highlightedCount / totalEvents;

    // Get non-highlighted events for category color calculation
    const nonHighlightedEvents = location.events.filter(
      (event) => !highlighted || !highlighted.includes(event.civId)
    );

    let colorPercentMap;
    if (highlightedPercent === 1) {
      // All events are highlighted
      colorPercentMap = { [HIGHLIGHT_COLOR]: 1 };
    } else if (highlightedPercent > 0) {
      // Mix of highlighted and non-highlighted events
      const nonHighlightedLocation = { ...location, events: nonHighlightedEvents };
      const colorPercentages = calculateColorPercentages(
        [nonHighlightedLocation],
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
      const colorPercentages = calculateColorPercentages([location], coloringSet);
      colorPercentMap = zipColorsToPercentages(filterColors, colorPercentages);
    }

    return (
      <ColoredMarkers
        radius={eventRadius}
        colorPercentMap={colorPercentMap}
        styles={{
          ...styles,
        }}
        className="location-event-marker"
      />
    );
  }

  function renderLocation(location) {
    /**
    {
      events: [...],
      label: 'Location name',
      latitude: '47.7',
      longitude: '32.2'
    }
    */
    if (!location.latitude || !location.longitude) return null;
    const { x, y } = projectPoint([location.latitude, location.longitude]);

    // in narrative mode, only render events in narrative
    // TODO: move this to a selector
    if (narrative) {
      const { steps } = narrative;
      const onlyIfInNarrative = (e) => steps.map((s) => s.id).includes(e.id);
      const eventsInNarrative = location.events.filter(onlyIfInNarrative);

      if (eventsInNarrative.length <= 0) {
        return null;
      }
    }

    const customStyles = styleLocation ? styleLocation(location) : null;
    const extraRender = () => <>{customStyles[1]}</>;

    const isSelected = selected.reduce((acc, event) => {
      return (
        acc ||
        (event.latitude === location.latitude &&
          event.longitude === location.longitude)
      );
    }, false);

    return (
      <svg key={hash(location)}>
        <g
          className={`location-event ${narrative ? "no-hover" : ""}`}
          transform={`translate(${x}, ${y})`}
          onClick={(e) => handleEventSelect(e, location)}
        >
          {renderLocationSlicesByAssociation(location)}
          {extraRender ? extraRender() : null}
          {isSelected ? null : renderBorder()}
        </g>
      </svg>
    );
  }

  return (
    <Portal node={svg}>
      <svg>
        <g className="event-locations">{locations.map(renderLocation)}</g>
      </svg>
    </Portal>
  );
}

export default MapEvents;
