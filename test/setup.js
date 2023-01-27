require("@testing-library/jest-dom");

// HACK
global.fetch = () => Promise.resolve();
