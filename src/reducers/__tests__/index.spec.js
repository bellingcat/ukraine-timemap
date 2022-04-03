import { updateTimeRange } from "../../actions";
import initial from "../../store/initial.js";
import reduce from "../app";

describe("app reducer", () => {
  it("can update the selected time range", () => {
    const result = reduce(
      initial.app,
      updateTimeRange(["2022-01-01T00:00:00.000Z", "2022-03-01T00:30:00.000Z"])
    );
    expect(result.timeline.range.current).toEqual([
      "2022-01-01T00:00:00.000Z",
      "2022-03-01T00:30:00.000Z",
    ]);
  });
});
