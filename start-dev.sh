#!/bin/sh
docker-compose -f docker-compose.dev.yml -p keycloak-dev up -d --build
