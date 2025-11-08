#!/bin/bash

# Load nvm if available
if [ -f ~/.nvm/nvm.sh ]; then
  source ~/.nvm/nvm.sh
  nvm use
fi

# Check Node.js version
NODE_VERSION=$(node --version | sed 's/v//')
REQUIRED_VERSION="22"

if [[ "$NODE_VERSION" != "$REQUIRED_VERSION"* ]]; then
  echo "Warning: Using Node.js $NODE_VERSION. Convex requires Node.js $REQUIRED_VERSION for Node.js actions."
  echo "Consider running: nvm use $REQUIRED_VERSION"
fi

# Start development servers
concurrently -r npm:dev:web npm:dev:convex
