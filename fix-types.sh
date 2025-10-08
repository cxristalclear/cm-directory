#!/bin/bash

# CM Directory - Type Fix Script
# This script fixes Next.js 15 TypeScript type issues

set -e  # Exit on error

echo "🔧 CM Directory Type Fix Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from your project root directory"
    exit 1
fi

# Check if Next.js is in package.json
if ! grep -q "\"next\"" package.json; then
    echo -e "${RED}❌ Error: This doesn't appear to be a Next.js project${NC}"
    exit 1
fi

echo "📦 Step 1: Cleaning build artifacts..."
rm -rf .next
rm -rf node_modules/.cache
echo -e "${GREEN}✓${NC} Build artifacts cleaned"
echo ""

echo "🗑️  Step 2: Removing node_modules..."
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock
rm -f pnpm-lock.yaml
echo -e "${GREEN}✓${NC} node_modules removed"
echo ""

echo "🧹 Step 3: Clearing npm cache..."
npm cache clean --force
echo -e "${GREEN}✓${NC} npm cache cleared"
echo ""

echo "📥 Step 4: Reinstalling dependencies..."
echo "   This may take a few minutes..."
npm install
echo -e "${GREEN}✓${NC} Dependencies reinstalled"
echo ""

echo "🔍 Step 5: Verifying Next.js version..."
NEXT_VERSION=$(npm list next | grep next@ | head -1 | sed 's/.*next@//' | sed 's/ .*//')
echo "   Next.js version: $NEXT_VERSION"

if [[ $NEXT_VERSION == 15.* ]]; then
    echo -e "${GREEN}✓${NC} Next.js 15.x detected (async params supported)"
else
    echo -e "${YELLOW}⚠${NC}  Warning: Next.js version is $NEXT_VERSION"
    echo "   Expected 15.x for async params support"
fi
echo ""

echo "📝 Step 6: Creating type definitions..."
mkdir -p types

# Create types/next.d.ts
cat > types/next.d.ts << 'EOF'
// types/next.d.ts
// Type definitions for Next.js 15 to properly handle async params and searchParams

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      NEXT_PUBLIC_MAPBOX_TOKEN?: string
      NEXT_PUBLIC_SITE_URL?: string
      NEXT_PUBLIC_SITE_NAME?: string
      NEXT_PUBLIC_GA_MEASUREMENT_ID?: string
      NEXT_PUBLIC_SHOW_DEBUG?: string
      NODE_ENV: 'development' | 'production' | 'test'
    }
  }
}

export {}
EOF

echo -e "${GREEN}✓${NC} Type definitions created"
echo ""

echo "⚙️  Step 7: Updating tsconfig.json..."
# Backup existing tsconfig.json
cp tsconfig.json tsconfig.json.backup

# Update tsconfig.json to include types directory
# Using a more portable approach that works on both macOS and Linux
if grep -q '"types/\*\*/\*.ts"' tsconfig.json; then
    echo "   tsconfig.json already includes types directory"
else
    # Add types/**/*.ts to include array
    # This is a simple approach that should work
    sed -i.bak 's/"include": \[/"include": [\n    "types\/\*\*\/\*.ts",/' tsconfig.json
    rm -f tsconfig.json.bak
fi

echo -e "${GREEN}✓${NC} tsconfig.json updated (backup saved as tsconfig.json.backup)"
echo ""

echo "🎉 Fix Complete!"
echo "================"
echo ""
echo -e "${YELLOW}⚠  IMPORTANT: You must now restart your IDE!${NC}"
echo ""
echo "In VS Code:"
echo "  1. Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux)"
echo "  2. Type: 'Developer: Reload Window'"
echo "  3. Press Enter"
echo ""
echo "Or simply close and reopen your IDE/editor completely."
echo ""
echo "After restarting, run:"
echo "  npm run dev"
echo ""
echo -e "${GREEN}✅ All done!${NC}"