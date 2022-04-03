import initial from "../../store/initial";
import { advanceTo, clear } from "jest-date-mock";
import * as selectors from "../";

describe("timeline selectors", () => {
  beforeAll(() => {
    advanceTo(new Date("2022-02-01T00:00:00.000Z"));
  });

  afterAll(() => {
    clear();
  });

  const state = (range) => ({
    ...initial,
    app: {
      ...initial.app,
      timeline: {
        ...initial.app.timeline,
        range,
      },
    },
  });

  describe("selectTimeRange", () => {
    it("returns the currently selected time range", () => {
      expect(
        selectors.selectTimeRange(
          state({
            initial: ["2020-03-03T00:00:00.000Z", "2024-01-04T00:00:00.000Z"],
            current: ["2021-03-03T00:00:00.000Z", "2023-01-04T00:00:00.000Z"],
            initialDaysShown: 31,
            limits: {
              lower: "2022-02-01T00:00:00.000Z",
              upper: undefined,
            },
          })
        )
      ).toEqual([
        new Date("2021-03-03T00:00:00.000Z"),
        new Date("2023-01-04T00:00:00.000Z"),
      ]);
    });

    it("falls back to a fixed default time range when no current range is set", () => {
      expect(
        selectors.selectTimeRange(
          state({
            current: undefined,
            initial: ["2020-03-03T00:00:00.000Z", "2024-01-04T00:00:00.000Z"],
            initialDaysShown: 31,
            limits: {
              lower: "2022-02-01T00:00:00.000Z",
              upper: undefined,
            },
          })
        )
      ).toEqual([
        new Date("2020-03-03T00:00:00.000Z"),
        new Date("2024-01-04T00:00:00.000Z"),
      ]);
    });

    it("falls back to a dynamic default time range when no fixed default range or current range is set", () => {
      expect(
        selectors.selectTimeRange(
          state({
            current: undefined,
            initial: undefined,
            initialDaysShown: 31,
            limits: {
              lower: "2022-02-01T00:00:00.000Z",
              upper: undefined,
            },
          })
        )
      ).toEqual([
        new Date("2022-01-01T00:00:00.000Z"),
        new Date("2022-02-01T00:00:00.000Z"),
      ]);
    });

    it("falls back to a dynamic default if an invalid default range is passed in", () => {
      expect(
        selectors.selectTimeRange(
          state({
            current: undefined,
            initial: "some garbage data",
            initialDaysShown: 31,
            limits: {
              lower: "2022-02-01T00:00:00.000Z",
              upper: undefined,
            },
          })
        )
      ).toEqual([
        new Date("2022-01-01T00:00:00.000Z"),
        new Date("2022-02-01T00:00:00.000Z"),
      ]);
    });
  });

  describe("selectTimeRangeLimits", () => {
    it("returns fixed time range limits", () => {
      expect(
        selectors.selectTimeRangeLimits(
          state({
            current: undefined,
            initial: undefined,
            initialDaysShown: 31,
            limits: {
              lower: "2021-02-01T00:00:00.000Z",
              upper: "2023-03-03T00:00:00.000Z",
            },
          })
        )
      ).toEqual([
        new Date("2021-02-01T00:00:00.000Z"),
        new Date("2023-03-03T00:00:00.000Z"),
      ]);
    });

    it("returns limits from a given lower bound to the current date, when no upper bound is passed in", () => {
      expect(
        selectors.selectTimeRangeLimits(
          state({
            current: undefined,
            initial: undefined,
            initialDaysShown: 31,
            limits: {
              lower: "2021-02-01T00:00:00.000Z",
              upper: undefined,
            },
          })
        )
      ).toEqual([
        new Date("2021-02-01T00:00:00.000Z"),
        new Date("2022-02-01T00:00:00.000Z"),
      ]);
    });
  });
});
