/**
 * Lighthouse CI Configuration
 * This file configures automated performance, accessibility, and best practices testing
 * for the Todo List application.
 * 
 * @version 1.0.0
 */

const path = require('path'); // v.built-in

module.exports = {
  ci: {
    collect: {
      // The URL to test - localhost for development/CI pipeline
      url: ['http://localhost:3000'],
      // Run tests multiple times for more reliable results
      numberOfRuns: 3,
      // Commands to start the development server
      startServerCommand: 'npm run start',
      // Pattern to detect when server is ready for testing
      startServerReadyPattern: 'Compiled successfully!',
      // Configuration settings for the test environment
      settings: {
        preset: 'desktop',
        // Throttling settings for consistent test results
        throttling: {
          cpuSlowdownMultiplier: 1,
          networkThrottling: 'broadband'
        },
        // Screen emulation settings
        screenEmulation: {
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          mobile: false
        }
      }
    },
    assert: {
      // Use the recommended preset as a baseline
      preset: 'lighthouse:recommended',
      assertions: {
        // Core Web Vitals and key performance metrics
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        
        // Specific performance timing metrics (in milliseconds)
        'first-contentful-paint': ['error', { maxNumericValue: 1500 }],
        'interactive': ['error', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }]
      }
    },
    upload: {
      // Store results in temporary public storage for CI integration
      target: 'temporary-public-storage',
      // Local directory for saving reports
      outputDir: './lighthouse-reports'
    }
  }
};