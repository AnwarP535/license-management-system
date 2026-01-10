#!/bin/sh
set -e

# Rebuild bcrypt if node_modules exists (for native module compatibility)
if [ -d "node_modules" ]; then
  echo "Rebuilding bcrypt for native compatibility..."
  npm rebuild bcrypt --build-from-source || echo "Warning: bcrypt rebuild failed, but continuing..."
fi

# Execute the main command
exec "$@"
