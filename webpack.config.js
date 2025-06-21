const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['expo-router'],
      },
    },
    argv
  );

  // Add aliases for @ imports
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname),
  };

  // Customize the webpack config here
  config.resolve.extensions = [
    '.web.js',
    '.web.jsx',
    '.web.ts',
    '.web.tsx',
    ...config.resolve.extensions,
  ];

  return config;
}; 