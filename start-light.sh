#!/usr/bin/env bash
# Starts Expo with reduced memory usage — safe for low-RAM machines
export NODE_OPTIONS="--max-old-space-size=512"
npx expo start --no-dev --minify
