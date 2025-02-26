#!/usr/bin/env bash

# Todo List Application - Development Environment Setup Script
# This script automates the setup of the development environment for the Todo List application.
# It performs prerequisite checks, installs dependencies, and configures the environment.

# Set strict error handling
set -e

# Directory setup
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
WEB_DIR="${PROJECT_ROOT}/src/web"

# Version requirements
MIN_NODE_VERSION="16.0.0"
MIN_NPM_VERSION="8.0.0"

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Utility functions
print_banner() {
    echo "
 _____           _        _     _     _     _____             
|_   _|         | |      | |   (_)   | |   |  _  |            
  | | ___   ___ | | ___  | |    _ ___| |_  | | | |_ __  _ __  
  | |/ _ \ / _ \| |/ _ \ | |   | / __| __| | | | | '_ \| '_ \ 
  | | (_) | (_) | | (_) || |___| \__ \ |_  \ \_/ / |_) | |_) |
  \_/\___/ \___/|_|\___/ \_____/_|___/\__|  \___/| .__/| .__/ 
                                                  | |   | |    
                                                  |_|   |_|    
"
    echo "=== Todo List Application Setup Script v1.0 ==="
    echo "This script will set up your development environment for the Todo List application."
    echo "==============================================================="
}

print_message() {
    local message="$1"
    local type="${2:-info}"
    
    case "$type" in
        success)
            echo -e "${GREEN}✓ SUCCESS:${NC} $message"
            ;;
        error)
            echo -e "${RED}✗ ERROR:${NC} $message"
            ;;
        warning)
            echo -e "${YELLOW}⚠ WARNING:${NC} $message"
            ;;
        *)
            echo -e "ℹ INFO: $message"
            ;;
    esac
}

check_command_exists() {
    command -v "$1" >/dev/null 2>&1
}

check_version() {
    local v1="$1"
    local v2="$2"
    
    # Remove 'v' prefix if present
    v1="${v1#v}"
    v2="${v2#v}"
    
    local IFS=.
    local i ver1=($v1) ver2=($v2)
    
    # Fill empty fields with zeros
    for ((i=${#ver1[@]}; i<${#ver2[@]}; i++)); do
        ver1[i]=0
    done
    
    for ((i=0; i<${#ver1[@]}; i++)); do
        if [[ -z ${ver2[i]} ]]; then
            ver2[i]=0
        fi
        if ((10#${ver1[i]} > 10#${ver2[i]})); then
            return 1  # v1 > v2
        fi
        if ((10#${ver1[i]} < 10#${ver2[i]})); then
            return 2  # v1 < v2
        fi
    done
    return 0  # v1 == v2
}

check_node() {
    print_message "Checking Node.js installation..."
    
    if ! check_command_exists node; then
        print_message "Node.js is not installed or not in PATH." "error"
        print_message "Please install Node.js v${MIN_NODE_VERSION} or higher: https://nodejs.org/" "error"
        exit 1
    fi
    
    local node_version=$(node -v)
    print_message "Found Node.js ${node_version}"
    
    check_version "${node_version}" "${MIN_NODE_VERSION}"
    local result=$?
    
    if [[ $result -eq 2 ]]; then
        print_message "Node.js ${node_version} is older than the required minimum version v${MIN_NODE_VERSION}." "error"
        print_message "Please upgrade your Node.js installation: https://nodejs.org/" "error"
        exit 1
    fi
    
    print_message "Node.js version check passed." "success"
}

check_npm() {
    print_message "Checking npm installation..."
    
    if ! check_command_exists npm; then
        print_message "npm is not installed or not in PATH." "error"
        print_message "npm should be installed with Node.js. Please check your installation." "error"
        exit 1
    fi
    
    local npm_version=$(npm -v)
    print_message "Found npm ${npm_version}"
    
    check_version "${npm_version}" "${MIN_NPM_VERSION}"
    local result=$?
    
    if [[ $result -eq 2 ]]; then
        print_message "npm ${npm_version} is older than the required minimum version v${MIN_NPM_VERSION}." "error"
        print_message "Please upgrade npm: npm install -g npm@latest" "error"
        exit 1
    fi
    
    print_message "npm version check passed." "success"
}

check_prerequisites() {
    print_message "Checking prerequisites..."
    
    check_node
    check_npm
    
    print_message "All prerequisites satisfied." "success"
}

setup_node_environment() {
    print_message "Setting up Node.js environment..."
    
    # Create or update .nvmrc file for nvm users
    echo "${MIN_NODE_VERSION}" > "${PROJECT_ROOT}/.nvmrc"
    
    # Check if nvm is available and try to use the correct version
    if check_command_exists nvm || [ -s "$HOME/.nvm/nvm.sh" ]; then
        print_message "nvm detected, trying to switch to the correct Node.js version..."
        
        # Source nvm if it's not already available
        if ! check_command_exists nvm; then
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        fi
        
        nvm use || nvm install
    else
        print_message "nvm not detected. If you want to use multiple Node.js versions, consider installing nvm: https://github.com/nvm-sh/nvm" "info"
    fi
    
    print_message "Node.js environment setup complete." "success"
}

install_dependencies() {
    print_message "Installing project dependencies..."
    
    if [ ! -d "$WEB_DIR" ]; then
        print_message "Web directory not found at $WEB_DIR" "error"
        exit 1
    fi
    
    cd "$WEB_DIR"
    
    if [ -f "package-lock.json" ]; then
        print_message "Installing dependencies with npm ci for reproducible builds..."
        npm ci
    else
        print_message "Installing dependencies with npm install..."
        npm install
    fi
    
    print_message "Dependencies installed successfully." "success"
}

setup_development_environment() {
    print_message "Setting up development environment configuration..."
    
    cd "$WEB_DIR"
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        print_message "Creating default .env file..."
        cat > ".env" << EOF
# Todo List Application - Development Environment Variables
NODE_ENV=development
REACT_APP_VERSION=$npm_package_version
REACT_APP_NAME=$npm_package_name
BROWSER=none
EOF
    fi
    
    # Ensure .env is in .gitignore
    if [ -f ".gitignore" ]; then
        if ! grep -q "^\.env$" .gitignore; then
            echo ".env" >> .gitignore
            print_message "Added .env to .gitignore"
        fi
    fi
    
    print_message "Development environment configuration complete." "success"
}

setup_git_hooks() {
    print_message "Setting up Git hooks for code quality..."
    
    if [ ! -d "${PROJECT_ROOT}/.git" ]; then
        print_message "Not a Git repository. Skipping Git hooks setup." "warning"
        return 0
    fi
    
    cd "$WEB_DIR"
    
    # Check if husky is in dependencies
    if grep -q '"husky"' package.json; then
        print_message "Initializing husky for Git hooks..."
        npx husky install
        
        # Set up pre-commit hook for linting and testing
        npx husky add .husky/pre-commit "cd $WEB_DIR && npm run lint && npm test -- --watchAll=false --bail"
        
        print_message "Git hooks setup complete." "success"
    else
        print_message "Husky not found in dependencies. Skipping Git hooks setup." "info"
    fi
}

verify_setup() {
    print_message "Verifying setup..."
    
    cd "$WEB_DIR"
    
    # Run lint check if available
    if grep -q '"lint"' package.json; then
        print_message "Running lint check..."
        npm run lint
    fi
    
    # Run basic test if available
    if grep -q '"test"' package.json; then
        print_message "Running basic tests..."
        npm test -- --watchAll=false --bail
    fi
    
    print_message "Setup verification complete." "success"
}

print_next_steps() {
    echo ""
    echo "🚀 NEXT STEPS"
    echo "==============="
    echo "You're all set! Here's how to start developing:"
    echo ""
    echo "1. Start the development server:"
    echo "   cd ${WEB_DIR}"
    echo "   npm start"
    echo ""
    echo "2. Run tests:"
    echo "   npm test"
    echo ""
    echo "3. Build for production:"
    echo "   npm run build"
    echo ""
    echo "For more information, check the README.md file and project documentation."
    echo "Happy coding! 🎉"
}

main() {
    # Set strict error handling
    set -e
    
    print_banner
    check_prerequisites
    setup_node_environment
    install_dependencies
    setup_development_environment
    setup_git_hooks
    verify_setup
    print_next_steps
    
    print_message "Todo List Application development environment setup complete!" "success"
}

# Execute main function
main