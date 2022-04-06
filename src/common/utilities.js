import customParseFormat from "dayjs/plugin/customParseFormat";
import dayjs from "dayjs";
import hash from "object-hash";
import { timeFormatDefaultLocale } from "d3";

import { ASSOCIATION_MODES, POLYGON_CLIP_PATH } from "./constants";

dayjs.extend(customParseFormat);

let { DATE_FMT, TIME_FMT } = process.env;
if (!DATE_FMT) DATE_FMT = "MM/DD/YYYY";
if (!TIME_FMT) TIME_FMT = "HH:mm";

export const language = process.env.store.app.language || "en-US";

export function getPathLeaf(path) {
  const splitPath = path.split("/");
  return splitPath[splitPath.length - 1];
}

export function calcDatetime(date, time) {
  if (!time) time = "00:00";
  const dt = dayjs(`${date} ${time}`, `${DATE_FMT} ${TIME_FMT}`);
  return dt.toDate();
}

export function getCoordinatesForPercent(radius, percent) {
  const x = radius * Math.cos(2 * Math.PI * percent);
  const y = radius * Math.sin(2 * Math.PI * percent);
  return [x, y];
}

/**
 * This function takes the array of percentages: [0.5, 0.5, ...]
 * and maps it by index to the set of colors ['#fff', '#000', ...]
 * If there aren't enough colors in the set, it raises an error for the user
 *
 * Return value:
 * ex. {'#fff': 0.5, '#000': 0.5, ...} */
export function zipColorsToPercentages(colors, percentages) {
  if (colors.length < percentages.length) {
    throw new Error("You must declare an appropriate number of filter colors");
  }

  return percentages.reduce((map, percent, idx) => {
    map[colors[idx]] = percent;
    return map;
  }, {});
}

/**
 * Get URI params to start with predefined set of
 * https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
 * @param {string} name: name of paramater to search
 * @param {string} url: url passed as variable, defaults to window.location.href
 */
export function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[[\]]/g, "\\$&");

  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);

  if (!results) return null;
  if (!results[2]) return "";

  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/**
 * Compare two arrays of scalars
 * @param {array} arr1: array of numbers
 * @param {array} arr2: array of numbers
 */
export function areEqual(arr1, arr2) {
  return (
    arr1.length === arr2.length &&
    arr1.every((element, index) => {
      return element === arr2[index];
    })
  );
}

/**
 * Return whether the variable is neither null nor undefined
 * @param {object} variable
 */
export function isNotNullNorUndefined(variable) {
  return typeof variable !== "undefined" && variable !== null;
}

/*
 * Taken from: https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
 */
export function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function trimAndEllipse(string, stringNum) {
  if (string.length > stringNum) {
    return string.substring(0, 120) + "...";
  }
  return string;
}

/**
 * Takes the complete set of filters, and according to their paths places them at the correct node
 *
 * Returns a nested object where:
 * Key: filter_path_0/filter_path_1/filter_path_2...
 * Value: {...nested children}
 */
export function aggregateFilterPaths(filters) {
  function insertPath(
    children = {},
    [headOfPath, ...remainder],
    accumulatedPath
  ) {
    const childKey = Object.keys(children).find((path) => {
      const pathLeaf = getPathLeaf(path);
      return pathLeaf === headOfPath;
    });
    accumulatedPath.push(headOfPath);
    const accumulatedPlusHead = accumulatedPath.join("/");
    if (!childKey) children[accumulatedPlusHead] = {};
    if (remainder.length > 0)
      insertPath(children[accumulatedPlusHead], remainder, accumulatedPath);
    return children;
  }

  const allPaths = [];
  filters.forEach((filterItem) => allPaths.push(filterItem.filter_paths));
  const aggregatedPaths = allPaths.reduce(
    (children, path) => insertPath(children, path, []),
    {}
  );
  return aggregatedPaths;
}

/**
 * From the set of associations, grab a given filter's set of parents,
 * ie. all the elements in the path array before the idx where the filter is located.
 * If we can't find the filter by the ID, we know its a meta filter, so we look
 * through every association's given path attribute to find its location.
 *
 * Returns the list of parents: ex. ['Chemical', 'Tear Gas', ...]
 */
export function getFilterAncestors(filter) {
  const splitFilter = filter.split("/");
  const ancestors = [];
  splitFilter.forEach((f, index) => {
    const accumulatedPath = splitFilter.slice(0, index + 1).join("/");
    ancestors.push(accumulatedPath);
  });
  // The last element here will be the leaf node aka the filter passed in
  ancestors.pop();
  return ancestors;
}

/**
 * Grabs the second to last element in the paths array for a given existing filter.
 * This is the filter's most immediate ancestor.
 */
export function getImmediateFilterParent(filter) {
  const ancestors = getFilterAncestors(filter);
  return ancestors[ancestors.length - 1];
}

/**
 * Grabs a given filter's siblings: the set of associations that share the same immediate filter parent.
 */
export function getFilterSiblings(allFilters, filterParent, filterKey) {
  function findSiblings(filterPathObj, ancestors) {
    if (ancestors.length === 0 || filterPathObj === {}) return {};
    const nextAncestor = ancestors.shift();
    if (Object.keys(filterPathObj).includes(nextAncestor)) {
      const nextObjToSearch = filterPathObj[nextAncestor];
      if (ancestors.length === 0) {
        return nextObjToSearch;
      } else {
        return findSiblings(nextObjToSearch, ancestors);
      }
    }
  }
  const aggregatedFilters = aggregateFilterPaths(allFilters);
  const ancestors = getFilterAncestors(filterKey);
  const siblings = findSiblings(aggregatedFilters, ancestors);
  return Object.keys(siblings).filter((sib) => sib !== filterKey);
}

/**
 * Looks at the current coloring set (ie. a map between sets of filters and colors) and configures where to add next set
 */
export function addToColoringSet(coloringSet, filters) {
  const flattenedColoringSet = coloringSet.flatMap((f) => f);
  const newColoringSet = filters.filter(
    (k) => flattenedColoringSet.indexOf(k) === -1
  );
  return [...coloringSet, newColoringSet];
}

/**
 * Looks at the current coloring set (ie. a map between sets of filters and colors) and configures new sets based off of existing filters
 */
export function removeFromColoringSet(coloringSet, filters) {
  const newColoringSets = coloringSet.map((set) =>
    set.filter((s) => {
      return !filters.includes(s);
    })
  );
  return newColoringSets.filter((item) => item.length !== 0);
}

export function getEventCategories(event, activeCategories) {
  const eventCats = event.associations.filter(
    (a) => a.mode === ASSOCIATION_MODES.CATEGORY
  );
  return eventCats.reduce((acc, val) => {
    const activeCatTitle = activeCategories.find((cat) => cat === val.title);
    if (activeCatTitle) acc.push(activeCatTitle);
    return acc;
  }, []);
}

/**
 * Takes a filter's path and concatenates it like so: Parent 1/Parent 2/Child
 */
export function createFilterPathString(filter) {
  return filter.filter_paths.join("/");
}

/**
 * Inset the full source represenation from 'allSources' into an event. The
 * function is 'curried' to allow easy use with maps. To use for a single
 * source, call with two sets of parentheses:
 *      const src = insetSourceFrom(sources)(anEvent)
 */
export function insetSourceFrom(allSources) {
  return (event) => {
    let sources;
    if (!event.sources) {
      sources = [];
    } else {
      sources = event.sources.map((id) => {
        return allSources.hasOwnProperty(id) ? allSources[id] : null;
      });
    }
    return {
      ...event,
      sources,
    };
  };
}

/**
 * Debugging function: put in place of a mapStateToProps function to
 * view that source modal by default
 */
export function injectSource(id) {
  return (state) => {
    return {
      ...state,
      app: {
        ...state.app,
        source: state.domain.sources[id],
      },
    };
  };
}

export function urlFromEnv(ext) {
  if (process.env[ext]) {
    if (!Array.isArray(process.env[ext])) {
      return [`${process.env.SERVER_ROOT}${process.env[ext]}`];
    } else {
      return process.env[ext].map(
        (suffix) => `${process.env.SERVER_ROOT}${suffix}`
      );
    }
  } else {
    return null;
  }
}

export function toggleFlagAC(flag) {
  return (appState) => ({
    ...appState,
    flags: {
      ...appState.flags,
      [flag]: !appState.flags[flag],
    },
  });
}

export function selectTypeFromPath(path) {
  let type;
  switch (true) {
    case /\.(png|jpg)$/.test(path):
      type = "Image";
      break;
    case /\.(mp4)$/.test(path):
      type = "Video";
      break;
    case /\.(md)$/.test(path):
      type = "Text";
      break;
    default:
      type = "Unknown";
      break;
  }
  return { type, path };
}

export function typeForPath(path) {
  let type;
  path = path.trim();
  switch (true) {
    case /\.((png)|(jpg)|(jpeg))$/.test(path):
      type = "Image";
      break;
    case /\.(mp4)$/.test(path):
      type = "Video";
      break;
    case /\.(md)$/.test(path):
      type = "Text";
      break;
    case /\.(pdf)$/.test(path):
      type = "Document";
      break;
    case /.+(twitter\.com).+/.test(path):
      type = "Tweet";
      break;
    case /.+(t\.me).+/.test(path):
      type = "Telegram";
      break;

    default:
      type = "Unknown";
      break;
  }
  return type;
}

export function selectTypeFromPathWithPoster(path, poster) {
  return { type: typeForPath(path), path, poster };
}

export function isIdentical(obj1, obj2) {
  return hash(obj1) === hash(obj2);
}

export function calcOpacity(num) {
  /* Events have opacity 0.5 by default, and get added to according to how many
   * other events there are in the same render. The idea here is that the
   * overlaying of events builds up a 'heat map' of the event space, where
   * darker areas represent more events with proportion */
  const base = num >= 1 ? 0.9 : 0;
  return base + Math.min(0.5, 0.08 * (num - 1));
}

export function calcClusterOpacity(pointCount, totalPoints) {
  /* Clusters represent multiple events within a specific radius. The darker the cluster,
  the larger the number of underlying events. We use a multiplication factor (50) here as well
  to ensure that the larger clusters have an appropriately darker shading. */
  return Math.min(0.85, 0.08 + (pointCount / totalPoints) * 50);
}

export function calcClusterSize(pointCount, totalPoints) {
  /* The larger the cluster size, the higher the count of points that the cluster represents.
  Just like with opacity, we use a multiplication factor to ensure that clusters with higher point
  counts appear larger. */
  //TO-DO: Convert maxSize into a config var
  const maxSize = totalPoints > 60 ? 60 : 35;
  return Math.min(maxSize, 10 + (pointCount / totalPoints) * 100);
}

export function calculateTotalClusterPoints(clusters) {
  return clusters.reduce((total, cl) => {
    if (cl && cl.properties && cl.properties.cluster) {
      total += cl.properties.point_count;
    }
    return total;
  }, 0);
}

export function isLatitude(lat) {
  return !!lat && isFinite(lat) && Math.abs(lat) <= 90;
}

export function isLongitude(lng) {
  return !!lng && isFinite(lng) && Math.abs(lng) <= 180;
}

export function mapClustersToLocations(clusters, locations) {
  return clusters.reduce((acc, cl) => {
    const foundLocation = locations.find(
      (location) => location.label === cl.properties.id
    );
    if (foundLocation) acc.push(foundLocation);
    return acc;
  }, []);
}

/**
 * Loops through a set of either locations or events
 * and calculates the proportionate percentage of every given association in relation to the coloring set
 */
export function calculateColorPercentages(set, coloringSet) {
  if (coloringSet.length === 0) return [1];
  const associationMap = {};

  for (const [idx, value] of coloringSet.entries()) {
    for (const filter of value) {
      associationMap[filter] = idx;
    }
  }

  const associationCounts = new Array(coloringSet.length);
  associationCounts.fill(0);

  let totalAssociations = 0;

  set.forEach((item) => {
    let innerSet = "events" in item ? item.events : item;

    if (!Array.isArray(innerSet)) innerSet = [innerSet];

    innerSet.forEach((val) => {
      val.associations.forEach((a) => {
        const idx = associationMap[createFilterPathString(a)];
        if (!idx && idx !== 0) return;
        associationCounts[idx] += 1;
        totalAssociations += 1;
      });
    });
  });

  if (totalAssociations === 0) return [1];

  return associationCounts.map((count) => count / totalAssociations);
}

/**
 * Gets the idx of a given filter in relation to its position in the coloring set
 *
 * Example coloringSet = [['Chemical', 'Tear Gas'], ['Procedural', 'Destruction of property']]
 */
export function getFilterIdxFromColorSet(filter, coloringSet) {
  let filterIdx = -1;
  coloringSet.map((set, idx) => {
    const foundIdx = set.indexOf(filter);
    if (foundIdx !== -1) filterIdx = idx;
    return null;
  });
  return filterIdx;
}

export const dateMin = function () {
  return Array.prototype.slice.call(arguments).reduce(function (a, b) {
    return a < b ? a : b;
  });
};

export const dateMax = function () {
  return Array.prototype.slice.call(arguments).reduce(function (a, b) {
    return a > b ? a : b;
  });
};

/** Taken from
 * https://stackoverflow.com/questions/22697936/binary-search-in-javascript
 * **/
export function binarySearch(ar, el, compareFn) {
  let m = 0;
  let n = ar.length - 1;
  while (m <= n) {
    const k = (n + m) >> 1;
    const cmp = compareFn(el, ar[k]);
    if (cmp > 0) {
      m = k + 1;
    } else if (cmp < 0) {
      n = k - 1;
    } else {
      return k;
    }
  }
  return -m - 1;
}

export function makeNiceDate(datetime) {
  if (datetime === null) return null;
  // see https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
  const dateTimeFormat = new Intl.DateTimeFormat(language, {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
  const [{ value: month }, , { value: day }, , { value: year }] =
    dateTimeFormat.formatToParts(datetime);

  return `${day} ${month}, ${year}`;
}

/**
 * Sets the default locale for d3 to format dates in each available language.
 */
export function setD3Locale() {
  const languages = {
    "es-MX": require("./data/es-MX.json"),
  };

  if (language !== "es-US" && languages[language]) {
    timeFormatDefaultLocale(languages[language]);
  }
}

/**
 * Gets the set of associated styles for a given shape type from the entire set of shapes
 * @param list shapes - The aggregated set of shapes
 * @param list activeShapes - The set of active shapes in the app
 */
export function mapStyleByShape(shapes, activeShapes) {
  const styledShapes = shapes.map((s) => {
    const { colour, shape, id } = s;
    const style = {
      checkboxStyles: {
        background: activeShapes.includes(id) ? colour : "black",
        border: "none",
        clipPath: POLYGON_CLIP_PATH[shape],
      },
      containerStyles: {
        background: colour,
        clipPath: POLYGON_CLIP_PATH[shape],
      },
    };
    s.styles = style;
    return s;
  });
  return styledShapes;
}

export function mapCategoriesToPaths(categories, panelCategories) {
  const mappedCats = categories.reduce((acc, cat) => {
    const type = cat.filter_paths[0];
    if (!(type in acc)) {
      acc[type] = [];
    }
    acc[type].push(cat);
    return acc;
  }, {});

  const categoryMap =
    panelCategories.length > 1 ? mappedCats : { default: categories };
  return categoryMap;
}

export function getCategoryIdxs(panelCategories, startingIdx) {
  let idxCounter = startingIdx;
  // If there are specified categories from the config, filter out the default value; else, leave the default value
  const catTypes =
    panelCategories.length > 1
      ? panelCategories.filter((val) => val !== "default")
      : panelCategories;
  return catTypes.reduce((set, val) => {
    set[val] = idxCounter;
    idxCounter += 1;
    return set;
  }, {});
}

export function getFilterIdx(
  narrativesExist,
  categoriesExist,
  numCategoryPanels
) {
  if (narrativesExist && !categoriesExist) return 1;
  else if (!narrativesExist && categoriesExist) return numCategoryPanels;
  else if (narrativesExist && categoriesExist) return numCategoryPanels + 1;
  else return 0;
}

export function downloadAsFile(filename, content) {
  let element = document.createElement("a");
  element.setAttribute(
    "href",
    `data:application/octet-stream;charset=utf-8,${encodeURIComponent(content)}`
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export const isEmptyString = (s) => s.length === 0;
