#!/bin/bash
# Fly.io Convex Backend Setup Script
# Run this once to set up the Fly.io app

set -e

echo "🚀 Setting up Convex backend on Fly.io..."

# Check if fly CLI is installed
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI not found. Install it with:"
    echo "   curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if logged in
if ! fly auth whoami &> /dev/null; then
    echo "📝 Please log in to Fly.io..."
    fly auth login
fi

# Create the app (if not exists)
echo "📦 Creating Fly.io app..."
fly apps create lms-convex-backend --org personal 2>/dev/null || echo "App already exists"

# Create volume for persistent storage
echo "💾 Creating persistent volume..."
fly volumes create convex_data --region sjc --size 1 --app lms-convex-backend 2>/dev/null || echo "Volume already exists"

# Deploy
echo "🚀 Deploying Convex backend..."
fly deploy

# Get the app URL
APP_URL=$(fly status --app lms-convex-backend -j | grep -o '"Hostname":"[^"]*' | head -1 | cut -d'"' -f4)
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Generate admin key:"
echo "   fly ssh console -a lms-convex-backend -C './generate_admin_key.sh'"
echo ""
echo "2. Set environment variables in Vercel:"
echo "   NEXT_PUBLIC_CONVEX_SELF_HOSTED_URL=https://${APP_URL:-lms-convex-backend.fly.dev}"
echo "   CONVEX_SELF_HOSTED_URL=https://${APP_URL:-lms-convex-backend.fly.dev}"
echo "   CONVEX_SELF_HOSTED_ADMIN_KEY=<your-admin-key>"
echo ""
echo "3. Deploy frontend to Vercel"
