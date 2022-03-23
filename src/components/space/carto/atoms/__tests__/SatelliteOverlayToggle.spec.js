import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import SatelliteOverlayToggle from "../SatelliteOverlayToggle";
import "@testing-library/jest-dom";

describe("<SatelliteOverlayToggle />", () => {
  it("disables the currently selected default option", () => {
    render(
      <SatelliteOverlayToggle reset={jest.fn()} switchToSatellite={jest.fn()} />
    );
    expect(
      screen.getByRole("button", { name: /satellite/i })
    ).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /default/i })).toBeDisabled();
  });

  it("disables the currently selected satellite option", () => {
    render(
      <SatelliteOverlayToggle
        isUsingSatellite
        reset={jest.fn()}
        switchToSatellite={jest.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /satellite/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /default/i })).not.toBeDisabled();
  });

  it("calls the reset function when switching to the default overlay", () => {
    const mockReset = jest.fn();
    const mockSat = jest.fn();
    render(
      <SatelliteOverlayToggle
        isUsingSatellite
        reset={mockReset}
        switchToSatellite={mockSat}
      />
    );
    const btn = screen.getByRole("button", { name: /default/i });
    fireEvent.click(btn);
    expect(mockReset).toHaveBeenCalledTimes(1);
    expect(mockSat).not.toHaveBeenCalled();
  });

  it("calls the switchToSatellite function when switching to the satellite overlay", () => {
    const mockReset = jest.fn();
    const mockSat = jest.fn();
    render(
      <SatelliteOverlayToggle reset={mockReset} switchToSatellite={mockSat} />
    );
    const btn = screen.getByRole("button", { name: /satellite/i });
    fireEvent.click(btn);
    expect(mockSat).toHaveBeenCalledTimes(1);
    expect(mockReset).not.toHaveBeenCalled();
  });
});
