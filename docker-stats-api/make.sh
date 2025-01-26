#!/bin/bash
# This file is for debug. Just build locally and run that.
docker build -t docker-stats-api . --no-cache
docker run -d -p 1202:1202 -v /var/run/docker.sock:/var/run/docker.sock --name docker-stats-api docker-stats-api