// @see https://github.com/keyz/identity-obj-proxy
const identityObject = new Proxy(
  {},
  {
    get(_, key) {
      return key === "__esModule" ? false : key;
    },
  }
);

module.exports = identityObject;
