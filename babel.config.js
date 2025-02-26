// babel.config.js
// @babel/preset-env - version ^7.18.0
// @babel/preset-react - version ^7.18.0
// @babel/preset-typescript - version ^7.18.0

module.exports = function(api) {
  // Check if Babel API is available
  const isTest = api.env('test');
  
  // Cache the configuration for better performance
  api.cache(true);
  
  // Base presets configuration
  const presets = [
    [
      '@babel/preset-env', 
      {
        // Target settings for browsers
        targets: {
          browsers: [
            '> 1%',
            'last 2 versions',
            'not ie <= 11',
            'not dead'
          ]
        },
        // Use ES modules for tree shaking with webpack
        modules: isTest ? 'commonjs' : false,
        // Use polyfills as needed
        useBuiltIns: 'usage',
        corejs: 3
      }
    ],
    [
      '@babel/preset-react',
      {
        // Enable new JSX transform and development features
        runtime: 'automatic',
        development: !api.env('production')
      }
    ],
    [
      '@babel/preset-typescript',
      {
        // Allow JSX in .tsx files
        isTSX: true,
        allExtensions: true
      }
    ]
  ];

  // Configure plugins based on environment
  const plugins = [];
  
  // Only include certain plugins in test environment
  if (isTest) {
    // Test-specific transformations if needed
  }
  
  // Production-specific plugins
  if (api.env('production')) {
    // Remove PropTypes in production for smaller bundles
    // Note: This would require installing the plugin:
    // plugins.push('transform-react-remove-prop-types');
  }

  return {
    presets,
    plugins,
    // Set compact mode based on environment
    compact: api.env('production'),
    // Set sourcemaps based on environment
    sourceMaps: !api.env('production'),
    // Set behavior by environment
    env: {
      test: {
        // Test-specific settings
        sourceMaps: 'both'
      },
      production: {
        // Production-specific settings
        minified: true
      }
    }
  };
};