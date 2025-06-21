const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['expo-router']
    }
  }, argv);

  // Customize the config to fix expo-router issues
  config.resolve.alias = {
    ...config.resolve.alias,
    // Make sure webpack can resolve the app directory
    'app': path.resolve(__dirname, 'app')
  };

  return config;
}; 