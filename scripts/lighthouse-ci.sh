#!/bin/bash
#
# lighthouse-ci.sh - Lighthouse CI audit script for Todo application
#
# This script runs Lighthouse CI audits against the deployed Todo application
# to evaluate performance, accessibility, best practices, and SEO scores.
# It can be used in the CI/CD pipeline for automated quality assurance.

set -eo pipefail  # Exit on error, pipe failure

# Determine script directory for relative paths
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WEB_DIR="$PROJECT_ROOT/src/web"

# Global variables to store report paths
JSON_REPORT_PATH=""
HTML_REPORT_PATH=""

# Function to print a banner with script information
print_banner() {
  echo "============================================================"
  echo "🚦 Lighthouse CI Audit Script for Todo Application"
  echo "============================================================"
  echo "Evaluates performance, accessibility, best practices, and SEO"
  echo "Used for automated quality assurance in CI/CD pipelines"
  echo "------------------------------------------------------------"
}

# Function to check if required dependencies are installed
check_dependencies() {
  local missing_deps=false

  echo "Checking dependencies..."
  
  if ! command -v lighthouse &> /dev/null; then
    echo "❌ lighthouse is not installed. Please install it with: npm install -g lighthouse"
    missing_deps=true
  else
    echo "✅ lighthouse is installed"
  fi
  
  if ! command -v jq &> /dev/null; then
    echo "❌ jq is not installed. Please install it for your system (e.g., apt-get install jq, brew install jq)"
    missing_deps=true
  else
    echo "✅ jq is installed"
  fi
  
  if [ "$missing_deps" = true ]; then
    return 1
  fi
  
  return 0
}

# Function to print usage information
print_usage() {
  echo "Usage: $(basename $0) [OPTIONS]"
  echo ""
  echo "Options:"
  echo "  -u, --url URL            URL to audit (default: http://localhost:3000)"
  echo "  -t, --threshold NUMBER   Minimum score threshold (0-100, default: 90)"
  echo "  -d, --reports-dir DIR    Directory to store reports (default: ./lighthouse-reports)"
  echo "  -c, --config FILE        Path to Lighthouse config file"
  echo "  -a, --categories LIST    Comma-separated list of categories to audit"
  echo "                           (default: performance,accessibility,best-practices,seo)"
  echo "  --ci                     Run in CI mode (reduced output)"
  echo "  -h, --help               Show this help message"
  echo ""
  echo "Examples:"
  echo "  $(basename $0) --url https://my-todo-app.netlify.app"
  echo "  $(basename $0) --threshold 85 --categories performance,accessibility"
  echo "  $(basename $0) --ci --url \$DEPLOY_URL --reports-dir ./artifacts/lighthouse"
}

# Function to handle errors
handle_error() {
  local message="$1"
  local exit_code="${2:-1}"  # Default exit code is 1
  
  echo "❌ ERROR: $message" >&2
  echo "Timestamp: $(date)" >&2
  exit "$exit_code"
}

# Function to run Lighthouse audit
run_lighthouse() {
  local url="$1"
  local output_dir="$2"
  local config_file="$3"
  local categories="$4"
  
  echo "🚀 Running Lighthouse audit for $url..."
  
  # Generate timestamp for report filename
  local timestamp=$(date +"%Y%m%d-%H%M%S")
  local base_name=$(echo "$url" | sed 's/[^a-zA-Z0-9]/_/g')-$timestamp
  
  # Set global report paths
  HTML_REPORT_PATH="$output_dir/${base_name}.html"
  JSON_REPORT_PATH="$output_dir/${base_name}.json"
  
  # Build lighthouse command
  local lighthouse_cmd="lighthouse $url --output=html,json --output-path=$output_dir/$base_name"
  
  # Add categories if specified
  if [ -n "$categories" ]; then
    lighthouse_cmd="$lighthouse_cmd --only-categories=$categories"
  fi
  
  # Add config file if specified
  if [ -n "$config_file" ] && [ -f "$config_file" ]; then
    lighthouse_cmd="$lighthouse_cmd --config-path=$config_file"
  elif [ -n "$config_file" ]; then
    echo "⚠️ Warning: Config file not found: $config_file"
  fi
  
  # Print command if not in CI mode
  if [ "$CI_MODE" != "true" ]; then
    echo "Running command: $lighthouse_cmd"
  fi
  
  # Run lighthouse
  eval "$lighthouse_cmd"
  local exit_code=$?
  
  # Check if reports were generated
  if [ $exit_code -eq 0 ] && [ -f "$JSON_REPORT_PATH" ] && [ -f "$HTML_REPORT_PATH" ]; then
    echo "✅ Lighthouse audit completed successfully"
    echo "📊 Reports saved to:"
    echo "  - HTML Report: $HTML_REPORT_PATH"
    echo "  - JSON Report: $JSON_REPORT_PATH"
    return 0
  else
    echo "❌ Lighthouse audit failed with exit code $exit_code"
    return $exit_code
  fi
}

# Function to check if the scores meet the threshold
check_scores() {
  local report_path="$1"
  local threshold="$2"
  local all_pass=true
  
  echo "🔍 Checking Lighthouse scores against threshold of $threshold..."
  
  if [ ! -f "$report_path" ]; then
    echo "❌ Report file not found: $report_path"
    return 1
  fi
  
  # Extract scores from JSON report
  # Use default value of 0 if any category is missing
  local performance=$(jq '.categories.performance.score * 100 // 0' "$report_path")
  local accessibility=$(jq '.categories.accessibility.score * 100 // 0' "$report_path")
  local best_practices=$(jq '.categories["best-practices"].score * 100 // 0' "$report_path")
  local seo=$(jq '.categories.seo.score * 100 // 0' "$report_path")
  
  # Function to print score with color based on pass/fail
  print_score() {
    local category="$1"
    local score="$2"
    local score_int=$(printf "%.0f" "$score")
    
    if [ "$score_int" -ge "$threshold" ]; then
      echo -e "  ✅ \033[0;32m$category: $score_int\033[0m"
    else
      echo -e "  ❌ \033[0;31m$category: $score_int\033[0m"
      all_pass=false
    fi
  }
  
  # Print scores
  echo "📊 Lighthouse scores:"
  print_score "Performance" "$performance"
  print_score "Accessibility" "$accessibility"
  print_score "Best Practices" "$best_practices"
  print_score "SEO" "$seo"
  
  # Print overall result
  if [ "$all_pass" = true ]; then
    echo -e "\n✅ \033[0;32mAll scores meet or exceed the threshold of $threshold\033[0m"
    return 0
  else
    echo -e "\n❌ \033[0;31mSome scores are below the threshold of $threshold\033[0m"
    return 1
  fi
}

# Main function
main() {
  # Default values
  local URL="http://localhost:3000"
  local THRESHOLD=90
  local REPORTS_DIR="./lighthouse-reports"
  local CONFIG_FILE="$PROJECT_ROOT/lighthouse.config.js"
  local CATEGORIES="performance,accessibility,best-practices,seo"
  local CI_MODE=false
  
  # Parse command line arguments
  while [ $# -gt 0 ]; do
    case "$1" in
      -u|--url)
        URL="$2"
        shift 2
        ;;
      -t|--threshold)
        THRESHOLD="$2"
        shift 2
        ;;
      -d|--reports-dir)
        REPORTS_DIR="$2"
        shift 2
        ;;
      -c|--config)
        CONFIG_FILE="$2"
        shift 2
        ;;
      -a|--categories)
        CATEGORIES="$2"
        shift 2
        ;;
      --ci)
        CI_MODE=true
        shift
        ;;
      -h|--help)
        print_usage
        exit 0
        ;;
      *)
        echo "Unknown option: $1"
        print_usage
        exit 1
        ;;
    esac
  done
  
  # Print banner if not in CI mode
  if [ "$CI_MODE" != "true" ]; then
    print_banner
  fi
  
  # Check dependencies
  check_dependencies || handle_error "Missing dependencies" 1
  
  # Create reports directory if it doesn't exist
  mkdir -p "$REPORTS_DIR" || handle_error "Failed to create reports directory: $REPORTS_DIR" 1
  
  # If config file doesn't exist and it's the default, set to empty
  if [ "$CONFIG_FILE" = "$PROJECT_ROOT/lighthouse.config.js" ] && [ ! -f "$CONFIG_FILE" ]; then
    CONFIG_FILE=""
  fi
  
  # Print settings
  echo "🔧 Settings:"
  echo "  - URL: $URL"
  echo "  - Threshold: $THRESHOLD"
  echo "  - Reports directory: $REPORTS_DIR"
  [ -n "$CONFIG_FILE" ] && echo "  - Config file: $CONFIG_FILE"
  echo "  - Categories: $CATEGORIES"
  echo "  - CI mode: $CI_MODE"
  echo ""
  
  # Run Lighthouse audit
  run_lighthouse "$URL" "$REPORTS_DIR" "$CONFIG_FILE" "$CATEGORIES"
  audit_exit_code=$?
  
  if [ $audit_exit_code -ne 0 ]; then
    handle_error "Lighthouse audit failed" 1
  fi
  
  # Check scores against threshold
  check_scores "$JSON_REPORT_PATH" "$THRESHOLD"
  scores_exit_code=$?
  
  echo ""
  if [ $scores_exit_code -eq 0 ]; then
    echo "✅ Lighthouse CI audit passed!"
    exit 0
  else
    echo "❌ Lighthouse CI audit failed: scores below threshold"
    exit 2
  fi
}

# Run main function
main "$@"