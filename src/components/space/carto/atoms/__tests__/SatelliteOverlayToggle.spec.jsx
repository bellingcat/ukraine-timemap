import { vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import SatelliteOverlayToggle from "../SatelliteOverlayToggle";
import "@testing-library/jest-dom";

describe("<SatelliteOverlayToggle />", () => {
  it("shows the option to switch to satellite by default", () => {
    render(
      <SatelliteOverlayToggle reset={vi.fn()} switchToSatellite={vi.fn()} />
    );
    expect(screen.getByRole("button", { name: /sat/i })).toBeTruthy();
  });

  it("shows the option to switch to map when satellite selected", () => {
    render(
      <SatelliteOverlayToggle
        isUsingSatellite
        reset={vi.fn()}
        switchToSatellite={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /map/i })).toBeTruthy();
  });

  it("calls the reset function when switching to the default overlay", () => {
    const mockSat = vi.fn();
    render(
      <SatelliteOverlayToggle isUsingSatellite toggleSatellite={mockSat} />
    );
    const btn = screen.getByRole("button", { name: /map/i });
    fireEvent.click(btn);
    expect(mockSat).toHaveBeenCalledTimes(1);
  });

  it("calls the switchToSatellite function when switching to the satellite overlay", () => {
    const mockSat = vi.fn();
    render(<SatelliteOverlayToggle toggleSatellite={mockSat} />);
    const btn = screen.getByRole("button", { name: /sat/i });
    fireEvent.click(btn);
    expect(mockSat).toHaveBeenCalledTimes(1);
  });
});
