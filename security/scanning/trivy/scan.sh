#!/bin/bash

# Trivy Security Scanning Script
# This script performs comprehensive security scanning using Trivy

set -e

# Configuration
IMAGE_NAME=${1:-"your-app:latest"}
SCAN_TYPE=${2:-"all"}
OUTPUT_FORMAT=${3:-"table"}
OUTPUT_FILE=${4:-"trivy-scan-results.txt"}
SEVERITY_LEVEL=${5:-"CRITICAL,HIGH"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Starting Trivy security scan..."
echo "Image: $IMAGE_NAME"
echo "Scan type: $SCAN_TYPE"
echo "Severity level: $SEVERITY_LEVEL"
echo ""

# Function to check if Trivy is installed
check_trivy() {
    if ! command -v trivy &> /dev/null; then
        echo -e "${RED}❌ Trivy is not installed. Please install it first.${NC}"
        echo "Installation: https://aquasecurity.github.io/trivy/latest/getting-started/installation/"
        exit 1
    fi
}

# Function to scan image
scan_image() {
    echo "📦 Scanning image for vulnerabilities..."
    
    trivy image \
        --format $OUTPUT_FORMAT \
        --output $OUTPUT_FILE \
        --severity $SEVERITY_LEVEL \
        --exit-code 1 \
        $IMAGE_NAME
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ No critical vulnerabilities found!${NC}"
    else
        echo -e "${RED}❌ Critical vulnerabilities detected!${NC}"
        echo "Check $OUTPUT_FILE for details"
    fi
}

# Function to scan filesystem
scan_filesystem() {
    echo "📁 Scanning filesystem for vulnerabilities..."
    
    trivy fs \
        --format $OUTPUT_FORMAT \
        --output $OUTPUT_FILE \
        --severity $SEVERITY_LEVEL \
        --exit-code 1 \
        .
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ No critical vulnerabilities found in filesystem!${NC}"
    else
        echo -e "${RED}❌ Critical vulnerabilities detected in filesystem!${NC}"
        echo "Check $OUTPUT_FILE for details"
    fi
}

# Function to scan configuration files
scan_config() {
    echo "⚙️  Scanning configuration files..."
    
    trivy config \
        --format $OUTPUT_FORMAT \
        --output $OUTPUT_FILE \
        --severity $SEVERITY_LEVEL \
        --exit-code 1 \
        .
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ No configuration issues found!${NC}"
    else
        echo -e "${RED}❌ Configuration issues detected!${NC}"
        echo "Check $OUTPUT_FILE for details"
    fi
}

# Function to generate SBOM
generate_sbom() {
    echo "📋 Generating Software Bill of Materials (SBOM)..."
    
    trivy image \
        --format cyclonedx \
        --output sbom.json \
        $IMAGE_NAME
    
    echo -e "${GREEN}✅ SBOM generated: sbom.json${NC}"
}

# Function to scan with different formats
scan_with_formats() {
    echo "🔄 Scanning with multiple output formats..."
    
    # JSON format
    trivy image \
        --format json \
        --output trivy-results.json \
        --severity $SEVERITY_LEVEL \
        $IMAGE_NAME
    
    # HTML format
    trivy image \
        --format html \
        --output trivy-results.html \
        --severity $SEVERITY_LEVEL \
        $IMAGE_NAME
    
    # SARIF format
    trivy image \
        --format sarif \
        --output trivy-results.sarif \
        --severity $SEVERITY_LEVEL \
        $IMAGE_NAME
    
    echo -e "${GREEN}✅ Multiple format results generated${NC}"
}

# Main execution
main() {
    check_trivy
    
    case $SCAN_TYPE in
        "image")
            scan_image
            ;;
        "fs"|"filesystem")
            scan_filesystem
            ;;
        "config")
            scan_config
            ;;
        "sbom")
            generate_sbom
            ;;
        "formats")
            scan_with_formats
            ;;
        "all")
            echo "🔄 Running comprehensive scan..."
            scan_image
            scan_filesystem
            scan_config
            generate_sbom
            ;;
        *)
            echo -e "${YELLOW}⚠️  Unknown scan type: $SCAN_TYPE${NC}"
            echo "Available types: image, fs, config, sbom, formats, all"
            exit 1
            ;;
    esac
    
    echo ""
    echo "📊 Scan completed!"
    echo "Results saved to: $OUTPUT_FILE"
}

# Run main function
main "$@" 