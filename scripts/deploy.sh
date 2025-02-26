#!/bin/bash
#
# deploy.sh - Deployment script for the Todo List application
#
# This script automates deployment of the Todo List application to various
# static hosting platforms including Netlify, Vercel, GitHub Pages, and AWS S3/CloudFront.
#
# The script handles building the application (using build.sh script) and then
# deploying it to the specified target platform with appropriate configuration.
#
# Usage: ./deploy.sh [options]
#
# Options:
#   -h, --help            Show this help message and exit
#   -t, --target TARGET   Deployment target: netlify, vercel, github, aws (default: netlify)
#   -e, --env ENV         Deployment environment: dev, staging, prod (default: dev)
#   -s, --skip-build      Skip building the application
#   -d, --dry-run         Show what would be done without actually deploying
#   -v, --verbose         Increase verbosity

# Exit on error
set -e

# Script directory and constants
SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
PROJECT_ROOT=$(dirname "$SCRIPT_DIR")
BUILD_DIR="${PROJECT_ROOT}/src/web/build"

# Default settings
DEPLOY_TARGET="netlify"
ENVIRONMENT="dev"
SKIP_BUILD="false"
DRY_RUN="false"
VERBOSE="false"

# Text formatting
BOLD='\033[1m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print usage information
print_usage() {
    echo -e "${BOLD}Usage:${NC} ./deploy.sh [options]"
    echo
    echo -e "${BOLD}Deployment script for the Todo List application${NC}"
    echo
    echo -e "${BOLD}Options:${NC}"
    echo "  -h, --help            Show this help message and exit"
    echo "  -t, --target TARGET   Deployment target: netlify, vercel, github, aws (default: netlify)"
    echo "  -e, --env ENV         Deployment environment: dev, staging, prod (default: dev)"
    echo "  -s, --skip-build      Skip building the application"
    echo "  -d, --dry-run         Show what would be done without actually deploying"
    echo "  -v, --verbose         Increase verbosity"
    echo
    echo -e "${BOLD}Examples:${NC}"
    echo "  ./deploy.sh                      # Deploy to Netlify (dev environment)"
    echo "  ./deploy.sh -t vercel -e prod    # Deploy to Vercel (production environment)"
    echo "  ./deploy.sh -t github -s         # Deploy to GitHub Pages without rebuilding"
    echo "  ./deploy.sh -t aws -e staging -d # Dry run deployment to AWS (staging)"
    echo
}

# Logging functions
log_info() {
    if [ "$VERBOSE" = "true" ] || [ -n "$2" ]; then
        echo -e "${BLUE}[INFO]${NC} $1" >&2
    fi
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" >&2
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" >&2
}

# Check if required dependencies are installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    # Check common dependencies
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed or not in PATH"
        return 1
    fi
    
    if ! command -v npm &> /dev/null && ! command -v yarn &> /dev/null; then
        log_error "Neither npm nor yarn is installed or not in PATH"
        return 1
    fi
    
    # Check target-specific dependencies
    case "$DEPLOY_TARGET" in
        netlify)
            if ! command -v netlify &> /dev/null; then
                log_warning "Netlify CLI is not installed. You can install it with: npm install -g netlify-cli"
                log_warning "Attempting to use npx to run netlify-cli"
            fi
            ;;
        vercel)
            if ! command -v vercel &> /dev/null; then
                log_warning "Vercel CLI is not installed. You can install it with: npm install -g vercel"
                log_warning "Attempting to use npx to run vercel"
            fi
            ;;
        github)
            if ! command -v gh-pages &> /dev/null && ! (command -v git &> /dev/null && [ -d "$PROJECT_ROOT/.git" ]); then
                log_error "Neither gh-pages nor git repository found for GitHub Pages deployment"
                return 1
            fi
            ;;
        aws)
            if ! command -v aws &> /dev/null; then
                log_error "AWS CLI is not installed or not in PATH"
                return 1
            fi
            ;;
        *)
            log_error "Unknown deployment target: $DEPLOY_TARGET"
            return 1
            ;;
    esac
    
    log_info "All dependencies satisfied." true
    return 0
}

# Build the application
build_app() {
    if [ "$SKIP_BUILD" = "true" ]; then
        log_info "Skipping build as requested" true
        
        # Check if build directory exists
        if [ ! -d "$BUILD_DIR" ]; then
            log_error "Build directory does not exist at $BUILD_DIR"
            log_error "Cannot skip build as there is no build output to deploy"
            return 1
        fi
        
        return 0
    fi
    
    log_info "Building application..." true
    
    # Execute build script
    BUILD_SCRIPT="${SCRIPT_DIR}/build.sh"
    if [ ! -f "$BUILD_SCRIPT" ]; then
        log_error "Build script not found at $BUILD_SCRIPT"
        return 1
    fi
    
    # Set environment variables for build script
    export NODE_ENV="$ENVIRONMENT"
    
    # Run build script
    if ! bash "$BUILD_SCRIPT"; then
        log_error "Build failed"
        return 1
    fi
    
    # Verify build output
    if [ ! -d "$BUILD_DIR" ]; then
        log_error "Build directory does not exist after build at $BUILD_DIR"
        return 1
    fi
    
    log_success "Application built successfully"
    return 0
}

# Deploy to Netlify
deploy_to_netlify() {
    log_info "Deploying to Netlify..." true
    
    # Check for netlify.toml configuration
    NETLIFY_CONFIG="${PROJECT_ROOT}/netlify.toml"
    if [ ! -f "$NETLIFY_CONFIG" ]; then
        log_warning "netlify.toml configuration not found at $NETLIFY_CONFIG"
        log_warning "Will use Netlify defaults or CLI arguments"
    fi
    
    # Prepare Netlify deploy command
    NETLIFY_CMD="netlify"
    if ! command -v netlify &> /dev/null; then
        NETLIFY_CMD="npx netlify-cli"
    fi
    
    NETLIFY_ARGS="deploy --dir=$BUILD_DIR"
    
    # Set production flag if environment is prod
    if [ "$ENVIRONMENT" = "prod" ]; then
        NETLIFY_ARGS="$NETLIFY_ARGS --prod"
    fi
    
    # Add site name if specified
    if [ -n "$NETLIFY_SITE_NAME" ]; then
        NETLIFY_ARGS="$NETLIFY_ARGS --site=$NETLIFY_SITE_NAME"
    fi
    
    # Execute or simulate deployment
    if [ "$DRY_RUN" = "true" ]; then
        log_info "Dry run: would execute: $NETLIFY_CMD $NETLIFY_ARGS" true
        return 0
    else
        log_info "Executing: $NETLIFY_CMD $NETLIFY_ARGS" true
        if ! $NETLIFY_CMD $NETLIFY_ARGS; then
            log_error "Netlify deployment failed"
            return 1
        fi
    fi
    
    log_success "Netlify deployment successful"
    return 0
}

# Deploy to Vercel
deploy_to_vercel() {
    log_info "Deploying to Vercel..." true
    
    # Check for vercel.json configuration
    VERCEL_CONFIG="${PROJECT_ROOT}/vercel.json"
    if [ ! -f "$VERCEL_CONFIG" ]; then
        log_warning "vercel.json configuration not found at $VERCEL_CONFIG"
        log_warning "Will use Vercel defaults or CLI arguments"
    fi
    
    # Prepare Vercel deploy command
    VERCEL_CMD="vercel"
    if ! command -v vercel &> /dev/null; then
        VERCEL_CMD="npx vercel"
    fi
    
    VERCEL_ARGS="$BUILD_DIR"
    
    # Set production flag if environment is prod
    if [ "$ENVIRONMENT" = "prod" ]; then
        VERCEL_ARGS="$VERCEL_ARGS --prod"
    fi
    
    # Add additional environment-specific settings
    case "$ENVIRONMENT" in
        dev)
            VERCEL_ARGS="$VERCEL_ARGS --confirm"
            ;;
        staging)
            VERCEL_ARGS="$VERCEL_ARGS --confirm --environment=preview"
            ;;
        prod)
            VERCEL_ARGS="$VERCEL_ARGS --confirm --environment=production"
            ;;
    esac
    
    # Execute or simulate deployment
    if [ "$DRY_RUN" = "true" ]; then
        log_info "Dry run: would execute: $VERCEL_CMD $VERCEL_ARGS" true
        return 0
    else
        log_info "Executing: $VERCEL_CMD $VERCEL_ARGS" true
        if ! $VERCEL_CMD $VERCEL_ARGS; then
            log_error "Vercel deployment failed"
            return 1
        fi
    fi
    
    log_success "Vercel deployment successful"
    return 0
}

# Deploy to GitHub Pages
deploy_to_github_pages() {
    log_info "Deploying to GitHub Pages..." true
    
    # Determine deployment method
    if command -v gh-pages &> /dev/null; then
        # Use gh-pages npm package
        log_info "Using gh-pages package for deployment" true
        
        GH_PAGES_ARGS="--dist $BUILD_DIR"
        
        # Add branch name if specified
        if [ -n "$GITHUB_PAGES_BRANCH" ]; then
            GH_PAGES_ARGS="$GH_PAGES_ARGS --branch $GITHUB_PAGES_BRANCH"
        else
            GH_PAGES_ARGS="$GH_PAGES_ARGS --branch gh-pages"
        fi
        
        # Add message if specified
        if [ -n "$GITHUB_PAGES_MESSAGE" ]; then
            GH_PAGES_ARGS="$GH_PAGES_ARGS --message \"$GITHUB_PAGES_MESSAGE\""
        else
            GH_PAGES_ARGS="$GH_PAGES_ARGS --message \"Deploy to GitHub Pages: $(date)\""
        fi
        
        # Execute or simulate deployment
        if [ "$DRY_RUN" = "true" ]; then
            log_info "Dry run: would execute: gh-pages $GH_PAGES_ARGS" true
            return 0
        else
            log_info "Executing: gh-pages $GH_PAGES_ARGS" true
            if ! npx gh-pages $GH_PAGES_ARGS; then
                log_error "GitHub Pages deployment failed"
                return 1
            fi
        fi
    else
        # Use git directly
        log_info "Using git for deployment" true
        
        # Check if .git directory exists
        if [ ! -d "$PROJECT_ROOT/.git" ]; then
            log_error "No git repository found at $PROJECT_ROOT"
            return 1
        fi
        
        # Determine target branch
        BRANCH=${GITHUB_PAGES_BRANCH:-"gh-pages"}
        
        # Prepare a temporary directory and copy build files
        TMP_DIR=$(mktemp -d)
        cp -r "$BUILD_DIR"/* "$TMP_DIR"/
        
        # Execute or simulate deployment
        if [ "$DRY_RUN" = "true" ]; then
            log_info "Dry run: would deploy $BUILD_DIR to GitHub Pages branch $BRANCH" true
            rm -rf "$TMP_DIR"
            return 0
        else
            log_info "Deploying $BUILD_DIR to GitHub Pages branch $BRANCH" true
            
            # Enter temp directory and init git repo
            cd "$TMP_DIR"
            git init -q
            git config user.name "GitHub Pages Deploy"
            git config user.email "deploy@example.com"
            git add .
            git commit -q -m "Deploy to GitHub Pages: $(date)"
            
            # Push to GitHub Pages branch (force to overwrite history)
            if ! git push -q -f "git@github.com:$(git config --get remote.origin.url | sed -e 's|^https://github.com/||' -e 's|^git@github.com:||' -e 's|\.git$||').git" main:$BRANCH; then
                log_error "Failed to push to GitHub Pages"
                rm -rf "$TMP_DIR"
                return 1
            fi
            
            # Clean up
            rm -rf "$TMP_DIR"
        fi
    fi
    
    log_success "GitHub Pages deployment successful"
    return 0
}

# Deploy to AWS S3 and CloudFront
deploy_to_aws() {
    log_info "Deploying to AWS..." true
    
    # Check AWS CLI configuration
    if ! aws configure list &> /dev/null; then
        log_error "AWS CLI not configured. Run 'aws configure' to set up credentials."
        return 1
    fi
    
    # Determine S3 bucket and CloudFront distribution based on environment
    case "$ENVIRONMENT" in
        dev)
            S3_BUCKET=${AWS_S3_DEV_BUCKET:-""}
            CLOUDFRONT_ID=${AWS_CLOUDFRONT_DEV_ID:-""}
            ;;
        staging)
            S3_BUCKET=${AWS_S3_STAGING_BUCKET:-""}
            CLOUDFRONT_ID=${AWS_CLOUDFRONT_STAGING_ID:-""}
            ;;
        prod)
            S3_BUCKET=${AWS_S3_PROD_BUCKET:-""}
            CLOUDFRONT_ID=${AWS_CLOUDFRONT_PROD_ID:-""}
            ;;
        *)
            log_error "Unknown environment for AWS deployment: $ENVIRONMENT"
            return 1
            ;;
    esac
    
    # Verify S3 bucket is set
    if [ -z "$S3_BUCKET" ]; then
        log_error "S3 bucket not specified for environment $ENVIRONMENT"
        log_error "Set AWS_S3_${ENVIRONMENT^^}_BUCKET environment variable"
        return 1
    fi
    
    # Prepare S3 sync command
    S3_SYNC_ARGS="--acl public-read --delete"
    
    # Set cache control for different file types
    S3_SYNC_ARGS="$S3_SYNC_ARGS --cache-control max-age=31536000,public"
    
    # Set specific cache control for HTML files and the service worker
    S3_SYNC_ARGS="$S3_SYNC_ARGS --exclude '*' --include '*.html' --include 'service-worker.js' --include 'asset-manifest.json' --cache-control max-age=0,no-cache,no-store,must-revalidate"
    
    # Execute or simulate deployment
    if [ "$DRY_RUN" = "true" ]; then
        log_info "Dry run: would execute: aws s3 sync $BUILD_DIR s3://$S3_BUCKET $S3_SYNC_ARGS" true
        
        if [ -n "$CLOUDFRONT_ID" ]; then
            log_info "Dry run: would create CloudFront invalidation for distribution $CLOUDFRONT_ID" true
        fi
        
        return 0
    else
        log_info "Syncing files to S3 bucket: $S3_BUCKET" true
        
        # Sync files to S3
        if ! aws s3 sync "$BUILD_DIR" "s3://$S3_BUCKET" $S3_SYNC_ARGS; then
            log_error "Failed to sync files to S3 bucket $S3_BUCKET"
            return 1
        fi
        
        # Create CloudFront invalidation if distribution ID is provided
        if [ -n "$CLOUDFRONT_ID" ]; then
            log_info "Creating CloudFront invalidation for distribution $CLOUDFRONT_ID" true
            
            # Create invalidation
            if ! aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_ID" --paths "/*"; then
                log_warning "Failed to create CloudFront invalidation for distribution $CLOUDFRONT_ID"
                # Don't exit with error as the files are already deployed to S3
            fi
        fi
    fi
    
    log_success "AWS deployment successful"
    return 0
}

# Run post-deployment tasks
run_post_deploy_tasks() {
    log_info "Running post-deployment tasks..." true
    
    # Determine the deployed URL based on the target and environment
    DEPLOYED_URL=""
    case "$DEPLOY_TARGET" in
        netlify)
            # Netlify URLs are provided in the deployment output
            # This is just a placeholder
            DEPLOYED_URL="https://todo-app.netlify.app"
            ;;
        vercel)
            # Vercel URLs are provided in the deployment output
            # This is just a placeholder
            DEPLOYED_URL="https://todo-app.vercel.app"
            ;;
        github)
            # GitHub Pages URL would depend on the repository and settings
            # This is just a placeholder
            DEPLOYED_URL="https://username.github.io/todo-app"
            ;;
        aws)
            # AWS URL would depend on the S3 bucket configuration or CloudFront
            # This is just a placeholder
            DEPLOYED_URL="https://todo-app.example.com"
            ;;
    esac
    
    # Skip smoke tests and notifications in dry run mode
    if [ "$DRY_RUN" = "true" ]; then
        log_info "Dry run: would perform smoke tests and send notifications for $DEPLOYED_URL" true
        return 0
    fi
    
    # Perform smoke tests if URL is available
    if [ -n "$DEPLOYED_URL" ] && [ "$SKIP_SMOKE_TESTS" != "true" ]; then
        log_info "Performing smoke test on $DEPLOYED_URL" true
        
        # Wait a moment for the deployment to be available
        sleep 5
        
        # Simple curl-based smoke test
        if ! curl -s -f -o /dev/null "$DEPLOYED_URL"; then
            log_warning "Smoke test failed: unable to access $DEPLOYED_URL"
            # Don't exit with error as the deployment itself was successful
        else
            log_info "Smoke test passed: $DEPLOYED_URL is accessible" true
        fi
    fi
    
    # Send deployment notification if configured
    if [ -n "$NOTIFICATION_WEBHOOK" ] && [ "$SKIP_NOTIFICATIONS" != "true" ]; then
        log_info "Sending deployment notification" true
        
        # Prepare notification payload
        NOTIFICATION_PAYLOAD="{\"text\":\"Todo App deployed to $DEPLOY_TARGET ($ENVIRONMENT) at $DEPLOYED_URL\"}"
        
        # Send notification
        if ! curl -s -X POST -H "Content-Type: application/json" -d "$NOTIFICATION_PAYLOAD" "$NOTIFICATION_WEBHOOK"; then
            log_warning "Failed to send deployment notification"
            # Don't exit with error as the deployment itself was successful
        fi
    fi
    
    log_success "Post-deployment tasks completed"
    return 0
}

# Parse command-line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -h|--help)
                print_usage
                exit 0
                ;;
            -t|--target)
                if [[ $# -lt 2 ]]; then
                    log_error "Missing argument for $1"
                    return 1
                fi
                DEPLOY_TARGET="$2"
                shift 2
                ;;
            -e|--env)
                if [[ $# -lt 2 ]]; then
                    log_error "Missing argument for $1"
                    return 1
                fi
                ENVIRONMENT="$2"
                shift 2
                ;;
            -s|--skip-build)
                SKIP_BUILD="true"
                shift
                ;;
            -d|--dry-run)
                DRY_RUN="true"
                shift
                ;;
            -v|--verbose)
                VERBOSE="true"
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                print_usage
                return 1
                ;;
        esac
    done
    
    # Validate deployment target
    case "$DEPLOY_TARGET" in
        netlify|vercel|github|aws)
            # Valid target
            ;;
        *)
            log_error "Invalid deployment target: $DEPLOY_TARGET"
            log_error "Supported targets: netlify, vercel, github, aws"
            return 1
            ;;
    esac
    
    # Validate environment
    case "$ENVIRONMENT" in
        dev|staging|prod)
            # Valid environment
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT"
            log_error "Supported environments: dev, staging, prod"
            return 1
            ;;
    esac
    
    return 0
}

# Main function
main() {
    log_info "Starting deployment process..." true
    
    # Parse command-line arguments
    if ! parse_arguments "$@"; then
        return 1
    fi
    
    log_info "Deployment target: $DEPLOY_TARGET" true
    log_info "Environment: $ENVIRONMENT" true
    log_info "Skip build: $SKIP_BUILD" true
    log_info "Dry run: $DRY_RUN" true
    
    # Check dependencies
    if ! check_dependencies; then
        return 1
    fi
    
    # Build application (unless skipped)
    if ! build_app; then
        return 1
    fi
    
    # Deploy to the specified target
    case "$DEPLOY_TARGET" in
        netlify)
            if ! deploy_to_netlify; then
                return 1
            fi
            ;;
        vercel)
            if ! deploy_to_vercel; then
                return 1
            fi
            ;;
        github)
            if ! deploy_to_github_pages; then
                return 1
            fi
            ;;
        aws)
            if ! deploy_to_aws; then
                return 1
            fi
            ;;
    esac
    
    # Run post-deployment tasks
    if ! run_post_deploy_tasks; then
        return 1
    fi
    
    log_success "Deployment completed successfully!"
    return 0
}

# Execute main function with all arguments
main "$@"