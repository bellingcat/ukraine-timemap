import {
  TOGGLE_ASSOCIATIONS,
  UPDATE_COLORING_SET,
  UPDATE_SELECTED,
  UPDATE_TIMERANGE,
  UPDATE_MAP_VIEW,
} from "../../../actions";
import { ASSOCIATION_MODES } from "../../../common/constants";
import { createFilterPathString } from "../../../common/utilities";
import {
  getSelected,
  getTimeRange,
  selectActiveColorSets,
  selectActiveFilterIds,
  getMapLat,
  getMapLng,
  getMapZoom,
} from "../../../selectors";

export const SCHEMA_TYPES = {
  NUMBER: "NUMBER",
  NUMBER_ARRAY: "NUMBER_ARRAY",
  STRING: "STRING",
  STRING_ARRAY: "STRING_ARRAY",
  DATE: "DATE",
  DATE_ARRAY: "DATE_ARRAY",
};

export function isSchemaArray(schema) {
  return [
    SCHEMA_TYPES.DATE_ARRAY,
    SCHEMA_TYPES.NUMBER_ARRAY,
    SCHEMA_TYPES.STRING_ARRAY,
  ].includes(schema.type);
}

/**
 * Schema specifies how redux state maps to the url and vice versa.
 * `trigger`: action that triggers a call to `dehydrate()`
 * `type`: type of the mapped URL property
 * `dehydrate()`: maps redux state to url state.
 * `rehydrate()`:
 *    maps url state to redux state.
 *    !for performance reasons, this function works with a mutable ref to `state`!
 */
export const SCHEMA = Object.freeze({
  id: {
    key: "id",
    trigger: UPDATE_SELECTED,
    type: SCHEMA_TYPES.STRING_ARRAY,
    dehydrate(state) {
      return getSelected(state).map(({ civId }) => civId);
    },
    // TODO: determine time range if `range` not set.
    rehydrate(nextState, { id }) {
      if (id?.length) {
        nextState.app.selected = id.reduce((acc, curr) => {
          const event = nextState.domain.events.find((e) => e.civId === curr);

          if (event) {
            acc.push(event);
          } else {
            console.warn(
              `event ${curr} could not be rehydrated. reason: not present.`
            );
          }

          return acc;
        }, []);
      }
    },
  },
  hid: {
    key: "hid",
    trigger: null, // Read-only from URL, no action triggers update
    type: SCHEMA_TYPES.STRING_ARRAY,
    dehydrate() {
      return []; // Never update URL from state
    },
    rehydrate(nextState, { hid }) {
      if (hid?.length) {
        nextState.app.highlighted = hid;
      }
    },
  },
  range: {
    key: "range",
    trigger: UPDATE_TIMERANGE,
    type: SCHEMA_TYPES.DATE_ARRAY,
    dehydrate(state) {
      return getTimeRange(state);
    },
    rehydrate(nextState, { range }) {
      if (range?.length === 2) {
        const val = Array.from(range);
        val.sort((a, b) => new Date(a) - new Date(b));
        // HACK! diversion from upstream: we use a custom timeline state format.
        nextState.app.timeline = {
          ...nextState.app.timeline,
          range: {
            ...nextState.app.timeline.range,
            current: val,
          },
        };
      }
    },
  },
  filter: {
    key: "filter",
    trigger: TOGGLE_ASSOCIATIONS,
    type: SCHEMA_TYPES.STRING_ARRAY,
    dehydrate(state) {
      return selectActiveFilterIds(state);
    },
    // TODO: set parent filters if all children checked.
    rehydrate(nextState, { filter }) {
      if (filter?.length) {
        const filters = nextState.domain.associations.filter(
          (x) => x.mode === ASSOCIATION_MODES.FILTER
        );
        const filterMapping = mapFilterIdsToPaths(filters);
        nextState.app.associations.filters = filter.map(
          (id) => filterMapping[id]
        );
      }
    },
  },
  color: {
    key: "color",
    trigger: UPDATE_COLORING_SET,
    type: SCHEMA_TYPES.STRING_ARRAY,
    dehydrate(state) {
      return selectActiveColorSets(state);
    },
    // TODO: color parent if all children checked.
    rehydrate(state, { color }) {
      if (color?.length) {
        const filters = state.domain.associations.filter(
          (x) => x.mode === ASSOCIATION_MODES.FILTER
        );
        const filterMapping = mapFilterIdsToPaths(filters);
        state.app.associations.coloringSet = color.map((set) =>
          set.split(",").map((id) => filterMapping[id])
        );
      }
    },
  },
  lat: {
    key: "lat",
    trigger: UPDATE_MAP_VIEW,
    type: SCHEMA_TYPES.NUMBER,
    dehydrate(state) {
      return getMapLat(state);
    },
    rehydrate(state, { lat }) {
      if (lat != null && state.app.map) {
        state.app.map = {
          ...state.app.map,
          anchor: [lat, state.app.map.anchor[1]],
        };
      }
    },
  },
  lng: {
    key: "lng",
    trigger: UPDATE_MAP_VIEW,
    type: SCHEMA_TYPES.NUMBER,
    dehydrate(state) {
      return getMapLng(state);
    },
    rehydrate(state, { lng }) {
      if (lng != null && state.app.map) {
        state.app.map = {
          ...state.app.map,
          anchor: [state.app.map.anchor[0], lng],
        };
      }
    },
  },
  zoom: {
    key: "zoom",
    trigger: UPDATE_MAP_VIEW,
    type: SCHEMA_TYPES.NUMBER,
    dehydrate(state) {
      return getMapZoom(state);
    },
    rehydrate(state, { zoom }) {
      if (zoom != null && state.app.map) {
        state.app.map = {
          ...state.app.map,
          startZoom: zoom,
        };
      }
    },
  },
});

function mapFilterIdsToPaths(filters) {
  return filters.reduce((acc, curr) => {
    acc[curr.id] = createFilterPathString(curr);
    return acc;
  }, {});
}
