module.exports = {
  collectCoverageFrom: ["./src/**"],
  moduleNameMapper: {
    "\\.(css|sass|scss)$": "<rootDir>/test/__mocks__/styleMock.js",
    "\\.(gif|jpg|png|svg)$": "<rootDir>/test/__mocks__/fileMock.js",
  },
  setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
  testEnvironment: "jest-environment-jsdom"
};
