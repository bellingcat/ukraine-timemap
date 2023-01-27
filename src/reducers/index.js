import { combineReducers } from "redux";
import rootReducer from "./root";
import domain from "./domain";
import app from "./app";
import ui from "./ui";
import features from "./features";

function decorateRootReducer(rootReducer, reducer) {
  return (state, action) =>
    reducer(
      {
        ...rootReducer(state, action),
      },
      action
    );
}

export default decorateRootReducer(
  rootReducer,
  combineReducers({
    app,
    domain,
    ui,
    features,
  })
);
