import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";

import rootReducer from "../reducers";
import { changeNavigatorLanguages } from "../actions";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk))
);

export function dispatchNavigatorLanguagesChange() {
  const languages = navigator.languages || [navigator.language];
  return store.dispatch(changeNavigatorLanguages(languages));
}

export default store;
