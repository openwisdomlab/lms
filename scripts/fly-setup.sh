#!/bin/bash
# Fly.io Convex Backend - Complete Setup Script
# This script deploys the Convex backend and configures everything automatically

set -e

APP_NAME="lms-convex-backend"
REGION="sjc"  # San Jose - change if needed (iad=Virginia, lhr=London, nrt=Tokyo)

echo "=============================================="
echo "🚀 Convex Backend Deployment to Fly.io"
echo "=============================================="
echo ""

# Step 1: Check Fly CLI
echo "Step 1/6: Checking Fly CLI..."
if ! command -v fly &> /dev/null && ! command -v flyctl &> /dev/null; then
    echo "❌ Fly CLI not found. Installing..."
    curl -L https://fly.io/install.sh | sh
    export PATH="$HOME/.fly/bin:$PATH"
fi
echo "✅ Fly CLI ready"

# Step 2: Login check
echo ""
echo "Step 2/6: Checking authentication..."
if ! fly auth whoami &> /dev/null; then
    echo "📝 Opening browser for Fly.io login..."
    fly auth login
fi
FLY_USER=$(fly auth whoami 2>/dev/null || echo "unknown")
echo "✅ Logged in as: $FLY_USER"

# Step 3: Create app
echo ""
echo "Step 3/6: Creating Fly.io app..."
if fly apps list | grep -q "$APP_NAME"; then
    echo "✅ App '$APP_NAME' already exists"
else
    fly apps create "$APP_NAME" --org personal
    echo "✅ App '$APP_NAME' created"
fi

# Step 4: Create volume
echo ""
echo "Step 4/6: Creating persistent volume..."
if fly volumes list -a "$APP_NAME" 2>/dev/null | grep -q "convex_data"; then
    echo "✅ Volume 'convex_data' already exists"
else
    fly volumes create convex_data --region "$REGION" --size 1 --app "$APP_NAME" -y
    echo "✅ Volume created"
fi

# Step 5: Deploy
echo ""
echo "Step 5/6: Deploying Convex backend..."
fly deploy --app "$APP_NAME"
echo "✅ Deployment complete"

# Step 6: Generate admin key and save config
echo ""
echo "Step 6/6: Generating admin key..."
sleep 5  # Wait for app to be ready

ADMIN_KEY=$(fly ssh console -a "$APP_NAME" -C "./generate_admin_key.sh" 2>/dev/null | tail -1)
APP_URL="https://${APP_NAME}.fly.dev"

echo ""
echo "=============================================="
echo "✅ DEPLOYMENT SUCCESSFUL!"
echo "=============================================="
echo ""
echo "📋 Your Convex Backend Configuration:"
echo ""
echo "   Backend URL: $APP_URL"
echo "   Admin Key:   $ADMIN_KEY"
echo ""

# Create/update .env.local
ENV_FILE=".env.local"
if [ -f "$ENV_FILE" ]; then
    # Update existing file
    if grep -q "NEXT_PUBLIC_CONVEX_SELF_HOSTED_URL" "$ENV_FILE"; then
        sed -i "s|NEXT_PUBLIC_CONVEX_SELF_HOSTED_URL=.*|NEXT_PUBLIC_CONVEX_SELF_HOSTED_URL=$APP_URL|" "$ENV_FILE"
        sed -i "s|CONVEX_SELF_HOSTED_URL=.*|CONVEX_SELF_HOSTED_URL=$APP_URL|" "$ENV_FILE"
        sed -i "s|CONVEX_SELF_HOSTED_ADMIN_KEY=.*|CONVEX_SELF_HOSTED_ADMIN_KEY=$ADMIN_KEY|" "$ENV_FILE"
    else
        echo "" >> "$ENV_FILE"
        echo "# Fly.io Convex Backend (auto-generated)" >> "$ENV_FILE"
        echo "NEXT_PUBLIC_CONVEX_SELF_HOSTED_URL=$APP_URL" >> "$ENV_FILE"
        echo "CONVEX_SELF_HOSTED_URL=$APP_URL" >> "$ENV_FILE"
        echo "CONVEX_SELF_HOSTED_ADMIN_KEY=$ADMIN_KEY" >> "$ENV_FILE"
    fi
    echo "✅ Updated $ENV_FILE"
else
    cat > "$ENV_FILE" << EOF
# Fly.io Convex Backend (auto-generated)
NEXT_PUBLIC_CONVEX_SELF_HOSTED_URL=$APP_URL
CONVEX_SELF_HOSTED_URL=$APP_URL
CONVEX_SELF_HOSTED_ADMIN_KEY=$ADMIN_KEY

# Add your other environment variables below:
# AUTH_GITHUB_ID=
# AUTH_GITHUB_SECRET=
# OPENAI_API_KEY=
EOF
    echo "✅ Created $ENV_FILE"
fi

echo ""
echo "=============================================="
echo "📋 NEXT STEPS FOR VERCEL DEPLOYMENT:"
echo "=============================================="
echo ""
echo "1. Add these environment variables in Vercel:"
echo ""
echo "   NEXT_PUBLIC_CONVEX_SELF_HOSTED_URL = $APP_URL"
echo "   CONVEX_SELF_HOSTED_URL = $APP_URL"
echo "   CONVEX_SELF_HOSTED_ADMIN_KEY = $ADMIN_KEY"
echo ""
echo "2. Deploy to Vercel:"
echo "   vercel --prod"
echo ""
echo "   Or push to GitHub and let Vercel auto-deploy"
echo ""
echo "=============================================="
echo "🎉 Your MVP backend is ready!"
echo "=============================================="
