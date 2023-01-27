import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";

import store from "../store";
import App from "../components/App";

it("renders an option to view categories", () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  expect(screen.getAllByText("Filters").length).toBeGreaterThan(0);
});
