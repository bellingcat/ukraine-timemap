import initial from "../store/initial.js";

import { TOGGLE_TILE_OVERLAY } from "../actions";

function ui(uiState = initial.ui, action) {
  switch (action.type) {
    case TOGGLE_TILE_OVERLAY:
      return {
        ...uiState,
        tiles: {
          ...uiState.tiles,
          current:
            uiState.tiles.current === uiState.tiles.satellite
              ? uiState.tiles.default
              : uiState.tiles.satellite,
        },
      };
    default:
      return uiState;
  }
}

export default ui;
