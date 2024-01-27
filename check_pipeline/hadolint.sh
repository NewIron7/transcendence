#!/bin/bash

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Default path
default_transcendence_path="."

# Function to check Docker is installed
check_docker_installed() {
    if ! docker --version &>/dev/null; then
        echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
        exit 1
    fi
}

# Function to run hadolint on a Dockerfile
run_hadolint() {
    local dockerfile_path=$1
    if [ -f "$dockerfile_path" ]; then
        echo -e "${GREEN}Running hadolint on $dockerfile_path${NC}"
        docker run --rm -i hadolint/hadolint <"$dockerfile_path"
    else
        echo -e "${RED}Dockerfile not found at $dockerfile_path${NC}"
    fi
    return 0
}

# Main script starts here
check_docker_installed

transcendence_path=$default_transcendence_path

# Check Dockerfiles and run hadolint
run_hadolint "$transcendence_path/frontend/Dockerfile"
run_hadolint "$transcendence_path/backend/Dockerfile"
