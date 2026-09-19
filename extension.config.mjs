/** @type {import('extension').FileConfig} */
export default {
  config(config) {
    if (config.resolve) {
      delete config.resolve.extensionAlias;
    }
    return config;
  }
};
