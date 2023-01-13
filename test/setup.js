// Add globals here
// ---
// In the example below we're providing no-ops for the logging functions

require("@testing-library/jest-dom");

global.fetch = () => Promise.resolve();

// global.console = {
//   log: vi.fn(),
//   error: vi.fn(),
//   warn: vi.fn(),
//   info: vi.fn(),
//   debug: vi.fn(),
// };
