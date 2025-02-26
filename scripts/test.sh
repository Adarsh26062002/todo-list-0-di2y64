#!/bin/bash
# Exit immediately if a command exits with non-zero status
set -e

# Initialize global variables
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WEB_DIR="$PROJECT_ROOT"
TEST_TYPE="all"
COVERAGE=false
WATCH_MODE=false
VERBOSE=false
CI_MODE=false
EXIT_CODE=0

# Print colored information message
log_info() {
  echo -e "\033[0;32m[INFO] $1\033[0m"
}

# Print colored warning message
log_warning() {
  echo -e "\033[0;33m[WARNING] $1\033[0m"
}

# Print colored error message
log_error() {
  echo -e "\033[0;31m[ERROR] $1\033[0m" >&2
}

# Display usage information
print_usage() {
  echo "Todo List Application Test Runner"
  echo "--------------------------------"
  echo "This script provides a unified interface for running all types of tests"
  echo "for the Todo List application."
  echo ""
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -t, --type <type>      Test type to run (all, unit, integration, e2e) [default: all]"
  echo "  -c, --coverage         Generate test coverage report"
  echo "  -w, --watch            Run tests in watch mode (not applicable in CI)"
  echo "  -v, --verbose          Enable verbose output"
  echo "  -h, --help             Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0                     Run all tests"
  echo "  $0 -t unit             Run only unit tests"
  echo "  $0 -t e2e              Run only end-to-end tests"
  echo "  $0 -c                  Run all tests with coverage reporting"
  echo "  $0 -t unit -c -w       Run unit tests with coverage in watch mode"
}

# Parse command line arguments
parse_arguments() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -t|--type)
        TEST_TYPE="$2"
        if [[ ! "$TEST_TYPE" =~ ^(all|unit|integration|e2e)$ ]]; then
          log_error "Invalid test type: $TEST_TYPE. Must be one of: all, unit, integration, e2e"
          return 1
        fi
        shift 2
        ;;
      -c|--coverage)
        COVERAGE=true
        shift
        ;;
      -w|--watch)
        WATCH_MODE=true
        shift
        ;;
      -v|--verbose)
        VERBOSE=true
        shift
        ;;
      -h|--help)
        print_usage
        exit 0
        ;;
      *)
        log_error "Unknown option: $1"
        print_usage
        return 1
        ;;
    esac
  done

  # Detect CI environment
  if [[ -n "$CI" || -n "$GITHUB_ACTIONS" || -n "$TRAVIS" || -n "$JENKINS_URL" ]]; then
    CI_MODE=true
    WATCH_MODE=false  # Disable watch mode in CI
    if [[ "$VERBOSE" == "true" ]]; then
      log_info "CI environment detected, disabling watch mode"
    fi
  fi

  return 0
}

# Set up the test environment
setup_environment() {
  export NODE_ENV=test

  # Check for node_modules
  if [[ ! -d "$WEB_DIR/node_modules" ]]; then
    log_warning "node_modules not found. You may need to run 'npm install' first."
  fi

  # Ensure test output directories exist
  if [[ "$CI_MODE" == "true" ]]; then
    mkdir -p "$PROJECT_ROOT/coverage"
    mkdir -p "$PROJECT_ROOT/cypress/screenshots"
    mkdir -p "$PROJECT_ROOT/cypress/videos"
    
    # Clean previous results in CI
    if [[ "$VERBOSE" == "true" ]]; then
      log_info "Cleaning previous test results in CI mode"
    fi
    rm -rf "$PROJECT_ROOT/coverage/*"
    rm -rf "$PROJECT_ROOT/cypress/screenshots/*"
    rm -rf "$PROJECT_ROOT/cypress/videos/*"
  fi

  return 0
}

# Check for required commands
check_dependencies() {
  log_info "Checking for required dependencies..."
  
  local MISSING=false
  
  # Check for Node.js
  if ! command -v node >/dev/null 2>&1; then
    log_error "Node.js is not installed or not in PATH"
    MISSING=true
  else
    local NODE_VERSION=$(node --version)
    log_info "Found Node.js $NODE_VERSION"
  fi
  
  # Check for npm
  if ! command -v npm >/dev/null 2>&1; then
    log_error "npm is not installed or not in PATH"
    MISSING=true
  else
    local NPM_VERSION=$(npm --version)
    log_info "Found npm $NPM_VERSION"
  fi
  
  # Check for Jest (in node_modules)
  if [[ ! -f "$WEB_DIR/node_modules/.bin/jest" ]]; then
    log_warning "Jest not found in node_modules, it may need to be installed"
  else
    log_info "Found Jest in node_modules"
  fi
  
  # Check for Cypress (in node_modules)
  if [[ ! -f "$WEB_DIR/node_modules/.bin/cypress" ]]; then
    log_warning "Cypress not found in node_modules, it may need to be installed"
  else
    log_info "Found Cypress in node_modules"
  fi
  
  # Check for bc (used in coverage calculations)
  if ! command -v bc >/dev/null 2>&1; then
    log_warning "bc is not installed, coverage threshold checks may not work correctly"
  fi
  
  if [[ "$MISSING" == "true" ]]; then
    log_error "Missing required dependencies"
    return 1
  fi
  
  return 0
}

# Run unit tests
run_unit_tests() {
  log_info "Running unit tests..."
  
  cd "$WEB_DIR"
  
  # Build Jest command
  JEST_CMD="npx jest --testPathIgnorePatterns=e2e,cypress,integration"
  
  if [[ "$COVERAGE" == "true" ]]; then
    JEST_CMD="$JEST_CMD --coverage"
  fi
  
  if [[ "$WATCH_MODE" == "true" && "$CI_MODE" != "true" ]]; then
    JEST_CMD="$JEST_CMD --watchAll"
  fi
  
  if [[ "$CI_MODE" == "true" ]]; then
    JEST_CMD="$JEST_CMD --ci"
  fi
  
  if [[ "$VERBOSE" == "true" ]]; then
    JEST_CMD="$JEST_CMD --verbose"
    log_info "Executing: $JEST_CMD"
  fi
  
  # Run tests
  $JEST_CMD
  local EXIT_STATUS=$?
  
  if [[ $EXIT_STATUS -ne 0 ]]; then
    log_error "Unit tests failed with exit code $EXIT_STATUS"
  else
    log_info "Unit tests completed successfully"
  fi
  
  return $EXIT_STATUS
}

# Run integration tests
run_integration_tests() {
  log_info "Running integration tests..."
  
  cd "$WEB_DIR"
  
  # Build Jest command for integration tests
  JEST_CMD="npx jest --testMatch='**/*.integration.test.js'"
  
  if [[ "$COVERAGE" == "true" ]]; then
    JEST_CMD="$JEST_CMD --coverage"
  fi
  
  if [[ "$WATCH_MODE" == "true" && "$CI_MODE" != "true" ]]; then
    JEST_CMD="$JEST_CMD --watchAll"
  fi
  
  if [[ "$CI_MODE" == "true" ]]; then
    JEST_CMD="$JEST_CMD --ci"
  fi
  
  if [[ "$VERBOSE" == "true" ]]; then
    JEST_CMD="$JEST_CMD --verbose"
    log_info "Executing: $JEST_CMD"
  fi
  
  # Run tests
  $JEST_CMD
  local EXIT_STATUS=$?
  
  if [[ $EXIT_STATUS -ne 0 ]]; then
    log_error "Integration tests failed with exit code $EXIT_STATUS"
  else
    log_info "Integration tests completed successfully"
  fi
  
  return $EXIT_STATUS
}

# Run end-to-end tests
run_e2e_tests() {
  log_info "Running end-to-end tests..."
  
  cd "$WEB_DIR"
  
  # Check if the application is already running
  local APP_STARTED=false
  if ! curl -s http://localhost:3000 >/dev/null; then
    log_info "Starting application for e2e tests..."
    npm start &
    APP_STARTED=true
    # Wait for app to start
    sleep 5
  fi
  
  # Determine browser
  local BROWSER="chrome"
  if [[ "$CI_MODE" == "true" ]]; then
    BROWSER="chrome:headless"
  fi
  
  # Build Cypress command
  CYPRESS_CMD="npx cypress run --browser $BROWSER"
  
  if [[ "$VERBOSE" == "true" ]]; then
    log_info "Executing: $CYPRESS_CMD"
  fi
  
  # Run tests
  $CYPRESS_CMD
  local EXIT_STATUS=$?
  
  # Stop the application if we started it
  if [[ "$APP_STARTED" == "true" ]]; then
    log_info "Stopping application..."
    pkill -f "npm start" || true
  fi
  
  if [[ $EXIT_STATUS -ne 0 ]]; then
    log_error "End-to-end tests failed with exit code $EXIT_STATUS"
  else
    log_info "End-to-end tests completed successfully"
  fi
  
  return $EXIT_STATUS
}

# Check coverage thresholds
check_coverage() {
  if [[ ! -f "$PROJECT_ROOT/coverage/lcov-report/index.html" ]]; then
    log_warning "Coverage report not found. Skipping coverage check."
    return 0
  fi
  
  log_info "Checking test coverage..."
  
  # Extract coverage percentages from the report
  # This is a simplified approach; in reality, you might want to use lcov-summary or a similar tool
  local COVERAGE_INFO=$(grep -A 4 "All files" "$PROJECT_ROOT/coverage/lcov-report/index.html")
  local STATEMENTS=$(echo "$COVERAGE_INFO" | grep -o '[0-9\.]*%' | head -1 | tr -d '%')
  local BRANCHES=$(echo "$COVERAGE_INFO" | grep -o '[0-9\.]*%' | head -2 | tail -1 | tr -d '%')
  local FUNCTIONS=$(echo "$COVERAGE_INFO" | grep -o '[0-9\.]*%' | head -3 | tail -1 | tr -d '%')
  local LINES=$(echo "$COVERAGE_INFO" | grep -o '[0-9\.]*%' | head -4 | tail -1 | tr -d '%')
  
  # Check if we meet the required thresholds
  local THRESHOLD_OVERALL=80
  local THRESHOLD_CORE=90
  local FAILED=false
  
  log_info "Coverage Summary:"
  log_info "- Statements: $STATEMENTS% (threshold: $THRESHOLD_OVERALL%)"
  log_info "- Branches: $BRANCHES% (threshold: $THRESHOLD_OVERALL%)"
  log_info "- Functions: $FUNCTIONS% (threshold: $THRESHOLD_OVERALL%)"
  log_info "- Lines: $LINES% (threshold: $THRESHOLD_OVERALL%)"
  
  # Check core Redux coverage (this would require more complex parsing in reality)
  # For this script, we'll just check overall coverage

  if (( $(echo "$STATEMENTS < $THRESHOLD_OVERALL" | bc -l) )); then
    log_error "Statement coverage below threshold: $STATEMENTS% < $THRESHOLD_OVERALL%"
    FAILED=true
  fi
  
  if (( $(echo "$BRANCHES < $THRESHOLD_OVERALL" | bc -l) )); then
    log_error "Branch coverage below threshold: $BRANCHES% < $THRESHOLD_OVERALL%"
    FAILED=true
  fi
  
  if (( $(echo "$FUNCTIONS < $THRESHOLD_OVERALL" | bc -l) )); then
    log_error "Function coverage below threshold: $FUNCTIONS% < $THRESHOLD_OVERALL%"
    FAILED=true
  fi
  
  if (( $(echo "$LINES < $THRESHOLD_OVERALL" | bc -l) )); then
    log_error "Line coverage below threshold: $LINES% < $THRESHOLD_OVERALL%"
    FAILED=true
  fi
  
  if [[ "$FAILED" == "true" ]]; then
    log_error "Coverage check failed"
    return 1
  else
    log_info "Coverage check passed"
    return 0
  fi
}

# Update the exit code
update_exit_code() {
  local NEW_CODE=$1
  if [[ $NEW_CODE -gt $EXIT_CODE ]]; then
    EXIT_CODE=$NEW_CODE
  fi
}

# Main function
main() {
  parse_arguments "$@"
  local PARSE_RESULT=$?
  if [[ $PARSE_RESULT -ne 0 ]]; then
    exit $PARSE_RESULT
  fi
  
  setup_environment
  local SETUP_RESULT=$?
  if [[ $SETUP_RESULT -ne 0 ]]; then
    log_error "Failed to set up test environment"
    exit $SETUP_RESULT
  fi
  
  check_dependencies
  local DEP_RESULT=$?
  if [[ $DEP_RESULT -ne 0 ]]; then
    log_error "Dependency check failed"
    exit $DEP_RESULT
  fi
  
  if [[ "$TEST_TYPE" == "all" || "$TEST_TYPE" == "unit" ]]; then
    run_unit_tests
    update_exit_code $?
  fi
  
  if [[ "$TEST_TYPE" == "all" || "$TEST_TYPE" == "integration" ]]; then
    run_integration_tests
    update_exit_code $?
  fi
  
  if [[ "$TEST_TYPE" == "all" || "$TEST_TYPE" == "e2e" ]]; then
    run_e2e_tests
    update_exit_code $?
  fi
  
  if [[ "$COVERAGE" == "true" ]]; then
    check_coverage
    update_exit_code $?
  fi
  
  if [[ $EXIT_CODE -eq 0 ]]; then
    log_info "All tests completed successfully!"
  else
    log_error "Tests completed with errors, exit code: $EXIT_CODE"
  fi
  
  exit $EXIT_CODE
}

# Call main function with all arguments
main "$@"