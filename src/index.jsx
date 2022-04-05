import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store";
import App from "./components/App";
import copy from "./common/data/copy.json";

// XXX: Hack to make migration from "copy.json" and
// adding missing translation strings smoother.
Object.assign(copy, {
  ru: { ...copy["en"], ...copy["uk"], ...copy["ru"] },
  uk: { ...copy["en"], ...copy["ru"], ...copy["uk"] },
});

const root = ReactDOM.createRoot(document.getElementById("explore-app"));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

store.subscribe(() => {
  const { app } = store.getState();
  renderAppLanguage(app);
});

// Update language in places that are out of the App's reach
function renderAppLanguage({ language, languages }) {
  const html = document.documentElement;
  if (language && language !== html.lang) {
    html.lang = language;
    document.title = copy[language].page_title;
  }
}

// Expressions from https://exceptionshub.com/how-to-detect-safari-chrome-ie-firefox-and-opera-browser.html

/* eslint-disable */
// Opera 8.0+
const isOpera =
  (!!window.opr && !!opr.addons) ||
  !!window.opera ||
  navigator.userAgent.indexOf(" OPR/") >= 0;
// Firefox 1.0+
const isFirefox = typeof InstallTrigger !== "undefined";
// Safari 3.0+ "[object HTMLElementConstructor]"
const isSafari =
  /constructor/i.test(window.HTMLElement) ||
  (function (p) {
    return p.toString() === "[object SafariRemoteNotification]";
  })(
    !window["safari"] ||
      (typeof safari !== "undefined" && safari.pushNotification)
  );
// Internet Explorer 6-11
const isIE = /* @cc_on!@ */ false || !!document.documentMode;
// Edge 20+
const isEdge = !isIE && !!window.StyleMedia;
// Chrome 1+
const isChrome = !!window.chrome && !!window.chrome.webstore;
// Blink engine detection
const isBlink = (isChrome || isOpera) && !!window.CSS;

if (isEdge || isIE) {
  alert(
    "Please view this website in Opera for best viewing. It is untested in your browser."
  );
}
/* eslint-enable */
