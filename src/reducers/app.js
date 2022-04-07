import initial from "../store/initial.js";
import { ASSOCIATION_MODES } from "../common/constants";
import { toggleFlagAC } from "../common/utilities";
import { pickPreferredLanguage } from "../common/language.js";
import * as selectors from "../selectors";

import {
  UPDATE_HIGHLIGHTED,
  UPDATE_SELECTED,
  UPDATE_COLORING_SET,
  UPDATE_TICKS,
  CLEAR_FILTER,
  TOGGLE_ASSOCIATIONS,
  TOGGLE_SHAPES,
  UPDATE_TIMERANGE,
  UPDATE_DIMENSIONS,
  UPDATE_NARRATIVE,
  UPDATE_NARRATIVE_STEP_IDX,
  UPDATE_SOURCE,
  TOGGLE_LANGUAGE,
  TOGGLE_SITES,
  TOGGLE_FETCHING_DOMAIN,
  TOGGLE_FETCHING_SOURCES,
  TOGGLE_INFOPOPUP,
  TOGGLE_INTROPOPUP,
  TOGGLE_NOTIFICATIONS,
  TOGGLE_COVER,
  FETCH_ERROR,
  FETCH_SOURCE_ERROR,
  SET_LOADING,
  SET_NOT_LOADING,
  SET_INITIAL_CATEGORIES,
  SET_INITIAL_SHAPES,
  UPDATE_SEARCH_QUERY,
  CHANGE_NAVIGATOR_LANGUAGES,
} from "../actions";

function updateHighlighted(appState, action) {
  return Object.assign({}, appState, {
    highlighted: action.highlighted,
  });
}

function updateTicks(appState, action) {
  return {
    ...appState,
    timeline: {
      ...appState.timeline,
      dimensions: {
        ...appState.timeline.dimensions,
        ticks: action.ticks,
      },
    },
  };
}

function updateSelected(appState, action) {
  return Object.assign({}, appState, {
    selected: action.selected,
  });
}

function updateColoringSet(appState, action) {
  return {
    ...appState,
    associations: {
      ...appState.associations,
      coloringSet: action.coloringSet,
    },
  };
}

function updateNarrative(appState, action) {
  let [minTime, maxTime] = selectors.selectTimeRange(appState);

  const cornerBound0 = [180, 180];
  const cornerBound1 = [-180, -180];

  // Compute narrative time range and map bounds
  if (action.narrative) {
    [minTime, maxTime] = selectors.selectTimeRangeLimits(appState);

    // Find max and mins coordinates of narrative events
    action.narrative.steps.forEach((step) => {
      const stepTime = step.datetime;
      if (stepTime < minTime) minTime = stepTime;
      if (stepTime > maxTime) maxTime = stepTime;

      if (!!step.longitude && !!step.latitude) {
        if (+step.longitude < cornerBound0[1])
          cornerBound0[1] = +step.longitude;
        if (+step.longitude > cornerBound1[1])
          cornerBound1[1] = +step.longitude;
        if (+step.latitude < cornerBound0[0]) cornerBound0[0] = +step.latitude;
        if (+step.latitude > cornerBound1[0]) cornerBound1[0] = +step.latitude;
      }
    });
    // Adjust bounds to center around first event, while keeping visible all others
    // Takes first event, finds max ditance with first attempt bounds, and use this max distance
    // on the other side, both in latitude and longitude
    const first = action.narrative.steps[0];
    if (!!first.longitude && !!first.latitude) {
      const firstToLong0 = Math.abs(+first.longitude - cornerBound0[1]);
      const firstToLong1 = Math.abs(+first.longitude - cornerBound1[1]);
      const firstToLat0 = Math.abs(+first.latitude - cornerBound0[0]);
      const firstToLat1 = Math.abs(+first.latitude - cornerBound1[0]);

      if (firstToLong0 > firstToLong1)
        cornerBound1[1] = +first.longitude + firstToLong0;
      if (firstToLong0 < firstToLong1)
        cornerBound0[1] = +first.longitude - firstToLong1;
      if (firstToLat0 > firstToLat1)
        cornerBound1[0] = +first.latitude + firstToLat0;
      if (firstToLat0 < firstToLat1)
        cornerBound0[0] = +first.latitude - firstToLat1;
    }

    // Add some buffer on both sides of the time extent
    minTime = minTime - Math.abs((maxTime - minTime) / 10);
    maxTime = maxTime + Math.abs((maxTime - minTime) / 10);
  }

  return {
    ...appState,
    associations: {
      ...appState.associations,
      narrative: action.narrative,
    },
    map: {
      ...appState.map,
      bounds: action.narrative ? [cornerBound0, cornerBound1] : null,
    },
    timeline: {
      ...appState.timeline,
      range: {
        ...appState.timeline.range,
        current: [minTime, maxTime],
      },
    },
  };
}

function updateNarrativeStepIdx(appState, action) {
  return {
    ...appState,
    narrativeState: {
      current: action.idx,
    },
  };
}

function toggleAssociations(appState, action) {
  if (!(action.value instanceof Array)) {
    action.value = [action.value];
  }
  const { association: associationType } = action;

  let newAssociations = appState.associations[associationType].slice(0);
  action.value.forEach((vl) => {
    if (newAssociations.includes(vl)) {
      newAssociations = newAssociations.filter((s) => s !== vl);
    } else {
      newAssociations.push(vl);
    }
  });

  return {
    ...appState,
    associations: {
      ...appState.associations,
      [associationType]: newAssociations,
    },
  };
}

function toggleShapes(appState, action) {
  let newShapes = [...appState.shapes];
  if (newShapes.includes(action.shape)) {
    const idx = newShapes.indexOf(action.shape);
    newShapes.splice(idx, 1);
  } else {
    newShapes.push(action.shape);
  }

  return {
    ...appState,
    shapes: newShapes,
  };
}

function clearFilter(appState, action) {
  return {
    ...appState,
    filters: {
      ...appState.filters,
      [action.filter]: [],
    },
  };
}

function updateTimeRange(appState, action) {
  // XXX
  return {
    ...appState,
    timeline: {
      ...appState.timeline,
      range: {
        ...appState.timeline.range,
        current: [
          new Date(action.timerange[0]).toISOString(),
          new Date(action.timerange[1]).toISOString(),
        ],
      },
    },
  };
}

function updateDimensions(appState, action) {
  return {
    ...appState,
    timeline: {
      ...appState.timeline,
      dimensions: {
        ...appState.timeline.dimensions,
        ...action.dims,
      },
    },
  };
}

function toggleLanguage(appState, action) {
  return {
    ...appState,
    language: action.language || selectNextLanguage(appState),
  };
  function selectNextLanguage({ language, languages }) {
    const currentIndex = appState.languages.indexOf(language);
    const nextIndex = (currentIndex + 1) % languages.length;
    return languages[nextIndex];
  }
}

function changeNavigatorLanguages(appState, action) {
  const preferred = action.languages;
  const available = appState.languages || [appState.language];
  const language = pickPreferredLanguage(available, preferred);
  return language ? { ...appState, language } : appState;
}

function updateSource(appState, action) {
  return {
    ...appState,
    source: action.source,
  };
}

function fetchError(state, action) {
  return {
    ...state,
    error: action.message,
    notifications: [{ type: "error", message: action.message }],
  };
}

const toggleSites = toggleFlagAC("isShowingSites");
const toggleFetchingDomain = toggleFlagAC("isFetchingDomain");
const toggleFetchingSources = toggleFlagAC("isFetchingSources");
const toggleInfoPopup = toggleFlagAC("isInfopopup");
const toggleIntroPopup = toggleFlagAC("isIntropopup");
const toggleNotifications = toggleFlagAC("isNotification");
const toggleCover = toggleFlagAC("isCover");

function fetchSourceError(appState, action) {
  return {
    ...appState,
    errors: {
      ...appState.errors,
      source: action.msg,
    },
  };
}

function setLoading(appState) {
  return {
    ...appState,
    loading: true,
  };
}

function setNotLoading(appState) {
  return {
    ...appState,
    loading: false,
  };
}

function setInitialCategories(appState, action) {
  const categories = action.values.reduce((acc, val) => {
    if (val.mode === ASSOCIATION_MODES.CATEGORY) acc.push(val.title);
    return acc;
  }, []);

  return {
    ...appState,
    associations: {
      ...appState.associations,
      categories: categories,
    },
  };
}

function setInitialShapes(appState, action) {
  const shapeIds = action.values.map((sh) => sh.id);
  return {
    ...appState,
    shapes: shapeIds,
  };
}

function updateSearchQuery(appState, action) {
  return {
    ...appState,
    searchQuery: action.searchQuery,
  };
}

function app(appState = initial.app, action) {
  switch (action.type) {
    case UPDATE_HIGHLIGHTED:
      return updateHighlighted(appState, action);
    case UPDATE_SELECTED:
      return updateSelected(appState, action);
    case UPDATE_COLORING_SET:
      return updateColoringSet(appState, action);
    case UPDATE_TICKS:
      return updateTicks(appState, action);
    case CLEAR_FILTER:
      return clearFilter(appState, action);
    case TOGGLE_ASSOCIATIONS:
      return toggleAssociations(appState, action);
    case TOGGLE_SHAPES:
      return toggleShapes(appState, action);
    case UPDATE_TIMERANGE:
      return updateTimeRange(appState, action);
    case UPDATE_DIMENSIONS:
      return updateDimensions(appState, action);
    case UPDATE_NARRATIVE:
      return updateNarrative(appState, action);
    case UPDATE_NARRATIVE_STEP_IDX:
      return updateNarrativeStepIdx(appState, action);
    case UPDATE_SOURCE:
      return updateSource(appState, action);
    case CHANGE_NAVIGATOR_LANGUAGES:
      return changeNavigatorLanguages(appState, action);
    /* toggles */
    case TOGGLE_LANGUAGE:
      return toggleLanguage(appState, action);
    case TOGGLE_SITES:
      return toggleSites(appState);
    case TOGGLE_FETCHING_DOMAIN:
      return toggleFetchingDomain(appState);
    case TOGGLE_FETCHING_SOURCES:
      return toggleFetchingSources(appState);
    case TOGGLE_INFOPOPUP:
      return toggleInfoPopup(appState);
    case TOGGLE_INTROPOPUP:
      return toggleIntroPopup(appState);
    case TOGGLE_NOTIFICATIONS:
      return toggleNotifications(appState);
    case TOGGLE_COVER:
      return toggleCover(appState);
    /* errors */
    case FETCH_ERROR:
      return fetchError(appState, action);
    case FETCH_SOURCE_ERROR:
      return fetchSourceError(appState, action);
    case SET_LOADING:
      return setLoading(appState);
    case SET_NOT_LOADING:
      return setNotLoading(appState);
    case SET_INITIAL_CATEGORIES:
      return setInitialCategories(appState, action);
    case SET_INITIAL_SHAPES:
      return setInitialShapes(appState, action);
    case UPDATE_SEARCH_QUERY:
      return updateSearchQuery(appState, action);
    default:
      return appState;
  }
}

export default app;
