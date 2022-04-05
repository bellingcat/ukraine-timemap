import { mergeDeepLeft } from "ramda";

import global, { colors } from "../common/global";
import copy from "../common/data/copy.json";
import { language } from "../common/utilities";
import { DEFAULT_TAB_ICONS } from "../common/constants";

const isSmallLaptop = window.innerHeight < 800;
const mapInitial = {
  anchor: [31.356397, 34.784818],
  startZoom: 11,
  minZoom: 2,
  maxZoom: 16,
  bounds: null,
  maxBounds: [
    [180, -180],
    [-180, 180],
  ],
};
const space3dInitial = {};

const initial = {
  /*
   * The Domain or 'domain' of this state refers to the tree of data
   *  available for render and display.
   * Selections and filters in the 'app' subtree will operate the domain
   *   in mapStateToProps of the Dashboard, and determine which items
   *   in the domain will get rendered by React
   */
  domain: {
    events: [],
    categories: [],
    associations: [],
    sources: {},
    sites: [],
    shapes: [],
    regions: [],
    notifications: [],
  },

  /*
   * The 'app' subtree of this state determines the data and information to be
   *   displayed.
   * It may refer to those the user interacts with, by selecting,
   *   filtering and so on, which ultimately operate on the data to be displayed.
   * Additionally, some of the 'app' flags are determined by the config file
   *   or by the characteristics of the client, browser, etc.
   */
  app: {
    debug: true,
    errors: {
      source: false,
    },
    highlighted: null,
    selected: [],
    source: null,
    associations: {
      coloringSet: [],
      filters: [],
      narrative: null,
      categories: [],
      views: {
        events: true,
        routes: false,
        sites: true,
      },
    },
    shapes: [],
    language: "en",
    languages: ["en", "ru", "uk"],
    cluster: {
      radius: 30,
      minZoom: 2,
      maxZoom: 16,
    },
    timeline: {
      dimensions: {
        ticks: 15,
        height: isSmallLaptop ? 170 : 250,
        width: 0,
        marginLeft: 70,
        marginTop: isSmallLaptop ? 5 : 10, // the padding used for the day/month labels inside the timeline
        marginBottom: 60,
        contentHeight: isSmallLaptop ? 160 : 200,
        width_controls: 100,
      },
      range: {
        current: null,
      },
      zoomLevels: copy[language].timeline.zoomLevels || [
        { label: "20 years", duration: 10512000 },
        { label: "2 years", duration: 1051200 },
        { label: "3 months", duration: 129600 },
        { label: "3 days", duration: 4320 },
        { label: "12 hours", duration: 720 },
        { label: "1 hour", duration: 60 },
      ],
    },
    flags: {
      isFetchingDomain: false,
      isFetchingSources: false,
      isCover: true,
      isCardstack: true,
      isInfopopup: false,
      isIntropopup: false,
      isShowingSites: true,
    },
    cover: {
      title: "project title",
      description:
        "A description of the project goes here.\n\nThis description may contain markdown.\n\n# This is a large title, for example.\n\n## Whereas this is a slightly smaller title.\n\nCheck out docs/custom-covers.md in the [Timemap GitHub repo](https://github.com/forensic-architecture/timemap) for more information around how to specify custom covers.",
      exploreButton: "EXPLORE",
    },
    toolbar: {
      panels: {
        categories: {
          default: {
            icon: DEFAULT_TAB_ICONS.CATEGORY,
            label: copy[language].toolbar.categories_label,
            title: copy[language].toolbar.explore_by_category__title,
            description:
              copy[language].toolbar.explore_by_category__description,
          },
        },
        filters: {
          icon: DEFAULT_TAB_ICONS.FILTER,
          label: copy[language].toolbar.filters_label,
          title: copy[language].toolbar.explore_by_filter__title,
          description: copy[language].toolbar.explore_by_filter__description,
        },
        narratives: {
          icon: DEFAULT_TAB_ICONS.NARRATIVE,
          label: copy[language].toolbar.narratives_label,
          title: copy[language].toolbar.explore_by_narrative__title,
          description: copy[language].toolbar.explore_by_narrative__description,
        },
        shapes: {
          icon: DEFAULT_TAB_ICONS.SHAPE,
          label: copy[language].toolbar.shapes_label,
          title: copy[language].toolbar.explore_by_shape__title,
          description: copy[language].toolbar.explore_by_shape__description,
        },
      },
    },
    loading: false,
  },

  /*
   * The 'ui' subtree of this state refers the state of the cosmetic
   *   elements of the application, such as color palettes of clusters
   *   as well as dom elements to attach SVG
   */
  ui: {
    tiles: {
      current: "openstreetmap", // ['openstreetmap', 'streets', 'satellite']
      default: "openstreetmap", // ['openstreetmap', 'streets', 'satellite']
    },
    style: {
      categories: {
        default: global.fallbackEventColor,
      },
      narratives: {
        default: {
          opacity: 0.9,
          stroke: global.fallbackEventColor,
          strokeWidth: 3,
        },
      },
      regions: {
        default: {
          stroke: "blue",
          strokeWidth: 3,
          opacity: 0.9,
        },
      },
      clusters: {
        radial: false,
      },
    },
    card: {
      layout: {
        template: "basic",
      },
    },
    coloring: {
      maxNumOfColors: 4,
      colors: Object.values(colors),
    },
    dom: {
      timeline: "timeline",
      timeslider: "timeslider",
      map: "map",
    },
    eventRadius: 8,
  },

  features: {
    USE_COVER: false,
    USE_ASSOCIATIONS: false,
    USE_SITES: false,
    USE_SOURCES: false,
    USE_REGIONS: false,
    GRAPH_NONLOCATED: false,
    HIGHLIGHT_GROUPS: false,
  },
};

let appStore;
if (process.env.store) {
  appStore = mergeDeepLeft(process.env.store, initial);
} else {
  appStore = initial;
}

appStore.app.flags.isIntropopup = !!appStore.app.intro;

if ("map" in appStore.app) {
  appStore.app.map = mergeDeepLeft(appStore.app.map, mapInitial);
}

if ("space3d" in appStore.app) {
  appStore.app.space3d = mergeDeepLeft(appStore.app.space3d, space3dInitial);
}

export default appStore;
