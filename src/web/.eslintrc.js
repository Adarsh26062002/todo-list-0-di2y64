/**
 * ESLint configuration file for the Todo List application
 * 
 * This configuration enforces code quality standards and best practices across 
 * JavaScript and TypeScript files in the project, addressing:
 * - Code Documentation: Enforces consistent code style and documentation standards
 * - Component Organization: Ensures proper component structure and import organization
 * - Quality Assurance: Supports the broader testing strategy by enforcing standards
 * 
 * @version 1.0.0
 */

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser', // @typescript-eslint/parser v5.59.0
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // @typescript-eslint/eslint-plugin v5.59.0
    'plugin:react/recommended', // eslint-plugin-react v7.32.2
    'plugin:react-hooks/recommended', // eslint-plugin-react-hooks v4.6.0
    'plugin:jsx-a11y/recommended', // eslint-plugin-jsx-a11y v6.7.1
    'plugin:import/errors', // eslint-plugin-import v2.27.5
    'plugin:import/warnings',
    'plugin:import/typescript',
    'prettier', // eslint-config-prettier v8.8.0
  ],
  plugins: [
    'react',
    'react-hooks',
    '@typescript-eslint',
    'jsx-a11y',
    'import',
  ],
  rules: {
    // React specific rules
    'react/react-in-jsx-scope': 'off', // Not needed with newer React versions
    'react/prop-types': 'off', // TypeScript handles prop validation
    
    // TypeScript specific rules
    '@typescript-eslint/explicit-module-boundary-types': 'off', // Not always necessary with type inference
    '@typescript-eslint/no-explicit-any': 'warn', // Discourage use of 'any' type
    '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }], // Allow unused vars starting with _
    
    // Import organization
    'import/order': [
      'error',
      {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        'alphabetize': { 'order': 'asc', 'caseInsensitive': true }
      }
    ],
    
    // General code quality
    'no-console': ['warn', { 'allow': ['error', 'warn', 'info'] }], // Discourage console.log
    
    // React hooks rules
    'react-hooks/rules-of-hooks': 'error', // Enforce Rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // Check effect dependencies
    
    // Accessibility
    'jsx-a11y/anchor-is-valid': 'warn', // Ensure anchors are valid
  },
  settings: {
    'react': {
      'version': 'detect', // Auto-detect React version
    },
    'import/resolver': {
      'node': {
        'extensions': ['.js', '.jsx', '.ts', '.tsx'],
        'moduleDirectory': ['node_modules', 'src']
      },
      'typescript': {
        'alwaysTryTypes': true,
        'project': './tsconfig.json'
      }
    }
  },
  // Special configurations for test files
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off', // Allow 'any' in test files for flexibility
      }
    }
  ]
};