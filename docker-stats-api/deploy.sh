#!/bin/bash
ver="1.1"

docker buildx build --platform linux/arm64,linux/amd64 -t foresthouse2316/docker-stats-api:${ver} -t foresthouse2316/docker-stats-api:latest . --push