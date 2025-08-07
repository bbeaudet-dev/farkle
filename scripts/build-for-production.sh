#!/bin/bash

echo "🚀 Building Rollio for production..."

# Build the frontend
echo "📦 Building frontend..."
npm run build

# Copy backend files to dist for deployment
echo "🔧 Preparing backend..."
mkdir -p dist/server
cp -r src/server/* dist/server/
cp package.json dist/
cp tsconfig.json dist/

# Create production package.json for backend
cat > dist/package.json << EOF
{
  "name": "rollio-backend",
  "version": "1.0.0",
  "main": "server/server.js",
  "scripts": {
    "start": "ts-node server/server.ts",
    "build": "tsc"
  },
  "dependencies": {
    "express": "^5.1.0",
    "socket.io": "^4.8.1",
    "ts-node": "^10.9.1",
    "typescript": "^4.9.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.3",
    "@types/node": "^18.0.0"
  }
}
EOF

echo "✅ Build complete! Ready for deployment."
echo "📁 Frontend files: dist/"
echo "🔧 Backend files: dist/server/" 