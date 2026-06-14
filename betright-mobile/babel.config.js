module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo auto-includes the Reanimated/Worklets plugin in SDK 56.
    presets: ['babel-preset-expo'],
  };
};
