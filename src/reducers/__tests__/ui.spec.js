import { toggleTileOverlay } from "../../actions";
import initial from "../../store/initial";
import ui from "../ui";
import config from "../../../config";

describe("UI reducer", () => {
  it("can change the tiling", () => {
    const result = ui(initial.ui, toggleTileOverlay());
    expect(result.tiles.current).toEqual(initial.ui.tiles.satellite);
    expect(result.tiles.default).toEqual(initial.ui.tiles.default);
  });

  it("can revert to the default tiling", () => {
    const result = ui(
      {
        ...initial.ui,
        tiles: { default: "some default", current: "something else" },
      },
      toggleTileOverlay()
    );
    expect(result.tiles.current).toBeUndefined();
    expect(result.tiles.default).toEqual("some default");
  });
});
