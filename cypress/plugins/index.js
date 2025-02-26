/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

/**
 * Cypress plugins configuration file for Todo application testing
 * 
 * This file configures Cypress plugins and customizes the testing environment for:
 * - Cross-browser testing (Chrome, Firefox, Safari, Edge)
 * - Responsive testing across different device viewports
 * - localStorage persistence testing
 * - Environment-specific configurations
 * 
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  // Configure browser launch options for cross-browser testing
  on('before:browser:launch', (browser = {}, launchOptions) => {
    // Chrome-specific configurations
    if (browser.family === 'chromium' && browser.name !== 'electron') {
      // Disable /dev/shm usage to prevent memory issues in containerized environments
      launchOptions.args.push('--disable-dev-shm-usage');
      return launchOptions;
    }

    // Firefox-specific configurations
    if (browser.family === 'firefox') {
      // Set initial browser dimensions
      launchOptions.args.push('-width=1280');
      launchOptions.args.push('-height=720');
      return launchOptions;
    }

    // Return unmodified launch options for other browsers (Safari, Edge)
    return launchOptions;
  });

  // Register tasks for localStorage testing
  on('task', {
    // Clear localStorage between tests
    clearLocalStorage() {
      // This is a placeholder - actual clearing happens in the browser context
      // Return null to satisfy Cypress task API
      return null;
    },
    
    // Get localStorage item by key (useful for asserting persisted state)
    getLocalStorage(key) {
      // This is a placeholder - actual retrieval happens in the browser context
      // Return null to satisfy Cypress task API
      return null;
    },
    
    // Set localStorage item (useful for test setup)
    setLocalStorage({ key, value }) {
      // This is a placeholder - actual setting happens in the browser context
      // Return null to satisfy Cypress task API
      return null;
    }
  });

  // Set environment-specific configurations based on config or process.env variables
  const environment = config.env.environment || process.env.ENVIRONMENT || 'development';
  
  // Override baseUrl if provided via environment variable
  config.baseUrl = process.env.CYPRESS_BASE_URL || config.baseUrl;

  // Set environment-specific baseUrl
  if (environment === 'production') {
    config.baseUrl = process.env.PROD_URL || 'https://todo-app-production.example.com';
  } else if (environment === 'staging') {
    config.baseUrl = process.env.STAGING_URL || 'https://todo-app-staging.example.com';
  } else {
    // Default to localhost for development
    config.baseUrl = process.env.DEV_URL || 'http://localhost:3000';
  }

  // Define viewport presets for responsive testing
  config.env = {
    ...config.env,
    viewports: {
      // Mobile viewport (iPhone 8 dimensions)
      mobile: {
        width: 375,
        height: 667,
        isMobile: true
      },
      // Tablet viewport (iPad dimensions)
      tablet: {
        width: 768,
        height: 1024,
        isMobile: true
      },
      // Desktop viewport
      desktop: {
        width: 1280,
        height: 800,
        isMobile: false
      }
    }
  };

  // Disable Chrome web security to allow cross-origin requests during testing
  config.chromeWebSecurity = false;
  
  // Enable experimental session and origin support
  config.experimentalSessionAndOrigin = true;

  // Configure video recording based on environment variable
  config.video = process.env.CYPRESS_VIDEO !== 'false';
  
  // Don't upload videos for passing tests to save storage/bandwidth
  config.videoUploadOnPasses = false;

  // Take screenshots on test failures for debugging
  config.screenshotOnRunFailure = true;

  // Return the updated configuration object
  return config;
};