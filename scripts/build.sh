#!/bin/bash
# build.sh - Production build script for Todo List application
# 
# This script handles the entire build process for the Todo List application,
# including dependency installation, linting, testing, and production build.
#
# Usage: ./build.sh
#
# Environment variables:
#   NODE_ENV         - Build environment (default: production)
#   SKIP_LINT        - Skip linting step if set to true (default: false)
#   SKIP_TESTS       - Skip testing step if set to true (default: false)
#   STRICT_LINT      - Exit on lint errors if true (default: false)
#   OPTIMIZE_ASSETS  - Run additional asset optimization if true (default: true)

# Exit on error
set -e

# Script constants
SCRIPT_DIR=$(dirname "${BASH_SOURCE[0]}")
PROJECT_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)
WEB_DIR=$PROJECT_ROOT/src/web
BUILD_DIR=$WEB_DIR/build

# Configuration variables with defaults
NODE_ENV=${NODE_ENV:-production}
SKIP_LINT=${SKIP_LINT:-false}
SKIP_TESTS=${SKIP_TESTS:-false}
STRICT_LINT=${STRICT_LINT:-false}
OPTIMIZE_ASSETS=${OPTIMIZE_ASSETS:-true}

# Text formatting
BOLD='\033[1m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print banner
function print_banner() {
  echo -e "${BOLD}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}║                 Todo List Application Build                ║${NC}"
  echo -e "${BOLD}╚════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${BLUE}Environment:${NC} $NODE_ENV"
  echo -e "${BLUE}Skip Lint:${NC} $SKIP_LINT"
  echo -e "${BLUE}Skip Tests:${NC} $SKIP_TESTS"
  echo -e "${BLUE}Strict Lint:${NC} $STRICT_LINT"
  echo -e "${BLUE}Optimize Assets:${NC} $OPTIMIZE_ASSETS"
  echo -e "${BLUE}Build Directory:${NC} $BUILD_DIR"
  echo -e "${BLUE}Timestamp:${NC} $(date '+%Y-%m-%d %H:%M:%S')"
  echo ""
}

# Handle errors
function handle_error() {
  local message=$1
  local exit_code=${2:-1}
  
  echo -e "${RED}[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $message${NC}" >&2
  exit $exit_code
}

# Check if the environment is properly configured
function check_environment() {
  # Check if node is installed
  if ! command -v node &> /dev/null; then
    handle_error "Node.js is not installed or not in PATH" 2
  fi
  
  # Check if npm or yarn is installed
  if ! command -v npm &> /dev/null && ! command -v yarn &> /dev/null; then
    handle_error "Neither npm nor yarn is installed or not in PATH" 2
  fi
  
  # Check if web directory exists
  if [ ! -d "$WEB_DIR" ]; then
    handle_error "Web directory not found at $WEB_DIR" 3
  fi
  
  # Check if package.json exists
  if [ ! -f "$WEB_DIR/package.json" ]; then
    handle_error "package.json not found in $WEB_DIR" 3
  fi
  
  # Log environment details
  echo -e "${GREEN}✓${NC} Environment check passed"
  echo -e "  Node: $(node -v)"
  if command -v npm &> /dev/null; then
    echo -e "  npm: $(npm -v)"
  fi
  if command -v yarn &> /dev/null; then
    echo -e "  yarn: $(yarn -v)"
  fi
  
  return 0
}

# Install dependencies
function install_dependencies() {
  echo -e "\n${BOLD}Installing dependencies...${NC}"
  
  cd "$WEB_DIR"
  
  # Determine whether to use npm or yarn
  if [ -f "yarn.lock" ]; then
    echo "Using yarn package manager..."
    if ! yarn install --frozen-lockfile; then
      handle_error "Failed to install dependencies with yarn" 4
    fi
  else
    echo "Using npm package manager..."
    if ! npm ci; then
      handle_error "Failed to install dependencies with npm" 4
    fi
  fi
  
  echo -e "${GREEN}✓${NC} Dependencies installed successfully"
  return 0
}

# Run linting
function run_linting() {
  if [ "$SKIP_LINT" = "true" ]; then
    echo -e "\n${YELLOW}⚠ Skipping linting as requested${NC}"
    return 0
  fi
  
  echo -e "\n${BOLD}Running linting...${NC}"
  
  local lint_command=""
  if [ -f "yarn.lock" ]; then
    lint_command="yarn lint"
  else
    lint_command="npm run lint"
  fi
  
  # Run linting and capture output
  local lint_output
  lint_output=$($lint_command 2>&1) || {
    echo -e "${YELLOW}Linting found issues:${NC}"
    echo "$lint_output"
    
    if [ "$STRICT_LINT" = "true" ]; then
      handle_error "Linting failed and STRICT_LINT is enabled" 5
    else
      echo -e "${YELLOW}⚠ Linting issues found but continuing build...${NC}"
      return 0
    fi
  }
  
  echo -e "${GREEN}✓${NC} Linting passed"
  return 0
}

# Run tests
function run_tests() {
  if [ "$SKIP_TESTS" = "true" ]; then
    echo -e "\n${YELLOW}⚠ Skipping tests as requested${NC}"
    return 0
  fi
  
  echo -e "\n${BOLD}Running tests...${NC}"
  
  local test_command=""
  if [ -f "yarn.lock" ]; then
    test_command="yarn test --watchAll=false"
  else
    test_command="npm test -- --watchAll=false"
  fi
  
  if ! $test_command; then
    if [ "$NODE_ENV" = "production" ]; then
      handle_error "Tests failed in production environment" 6
    else
      echo -e "${YELLOW}⚠ Tests failed but continuing as we're not in production...${NC}"
      return 0
    fi
  fi
  
  echo -e "${GREEN}✓${NC} Tests passed"
  return 0
}

# Build the application
function build_application() {
  echo -e "\n${BOLD}Building application for $NODE_ENV...${NC}"
  
  # Ensure build directory doesn't exist
  if [ -d "$BUILD_DIR" ]; then
    echo "Cleaning previous build..."
    rm -rf "$BUILD_DIR"
  fi
  
  # Set environment variables for optimization
  export GENERATE_SOURCEMAP="false"
  export INLINE_RUNTIME_CHUNK="true"
  
  # Run build command
  local build_command=""
  if [ -f "yarn.lock" ]; then
    build_command="yarn build"
  else
    build_command="npm run build"
  fi
  
  if ! $build_command; then
    handle_error "Build failed" 7
  fi
  
  # Verify build output exists
  if [ ! -d "$BUILD_DIR" ]; then
    handle_error "Build directory was not created" 7
  fi
  
  # Additional optimizations
  if [ "$OPTIMIZE_ASSETS" = "true" ]; then
    echo "Running additional asset optimizations..."
    
    # Compress images further if imagemin-cli is available
    if command -v imagemin &> /dev/null; then
      echo "Optimizing images..."
      find "$BUILD_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" \) -exec imagemin {} --out-dir {} \;
    else
      echo "imagemin-cli not found, skipping additional image optimization"
    fi
    
    # Add more optimizations here as needed
  fi
  
  # Generate build metadata
  echo "Generating build metadata..."
  cat > "$BUILD_DIR/build-meta.json" << EOF
{
  "version": "$(node -p "require('./package.json').version")",
  "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "environment": "$NODE_ENV",
  "nodeVersion": "$(node -v)"
}
EOF
  
  echo -e "${GREEN}✓${NC} Build completed successfully"
  return 0
}

# Log build statistics
function log_build_stats() {
  echo -e "\n${BOLD}Build Statistics:${NC}"
  
  if [ ! -d "$BUILD_DIR" ]; then
    echo "Build directory not found, can't calculate statistics."
    return 1
  fi
  
  # Calculate total size
  local total_size=$(du -sh "$BUILD_DIR" | cut -f1)
  
  echo -e "Total build size: ${BOLD}$total_size${NC}"
  
  # List largest files
  echo -e "\nLargest files:"
  find "$BUILD_DIR" -type f -not -path "*/\.*" | xargs du -h | sort -hr | head -n 5
  
  # JS bundle size
  echo -e "\nJavaScript bundles:"
  find "$BUILD_DIR" -name "*.js" -type f | xargs du -h | sort -hr
  
  # CSS bundle size
  echo -e "\nCSS files:"
  find "$BUILD_DIR" -name "*.css" -type f | xargs du -h | sort -hr
  
  # Compare with previous build if available
  local prev_build_meta="$PROJECT_ROOT/prev-build-meta.json"
  if [ -f "$prev_build_meta" ] && [ -f "$BUILD_DIR/build-meta.json" ]; then
    echo -e "\nComparison with previous build:"
    echo "Previous build: $(cat "$prev_build_meta" | grep buildTime | cut -d'"' -f4)"
    echo "Current build: $(cat "$BUILD_DIR/build-meta.json" | grep buildTime | cut -d'"' -f4)"
  fi
  
  # Save current build meta for future comparison
  cp "$BUILD_DIR/build-meta.json" "$PROJECT_ROOT/prev-build-meta.json" 2>/dev/null || true
  
  echo -e "\nBuild output directory: ${BOLD}$BUILD_DIR${NC}"
  
  return 0
}

# Main function to execute the build process
function main() {
  print_banner
  
  # Change to web directory
  cd "$WEB_DIR"
  
  # Run build steps
  check_environment
  install_dependencies
  run_linting
  run_tests
  build_application
  log_build_stats
  
  echo -e "\n${GREEN}${BOLD}✅ Build completed successfully!${NC}"
  echo -e "The built application is available at: ${BOLD}$BUILD_DIR${NC}"
  
  return 0
}

# Execute main function
main "$@"