const { createProxyMiddleware } = require("http-proxy-middleware");
const config = require("../config");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: config.API_PROXY_TARGET,
      changeOrigin: true,
    })
  );
};
