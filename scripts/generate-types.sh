#!/bin/bash

# Script to generate TypeScript types from Supabase database
# Run this whenever you make changes to your database schema

echo "Generating TypeScript types from Supabase..."

# Get project ref from .env.local
PROJECT_REF=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '/' -f 3 | cut -d '.' -f 1)

if [ -z "$PROJECT_REF" ]; then
  echo "Error: Could not find NEXT_PUBLIC_SUPABASE_URL in .env.local"
  exit 1
fi

echo "Using project ref: $PROJECT_REF"

# Generate types
npx supabase gen types typescript --project-id $PROJECT_REF > lib/database.types.ts

echo "✅ Types generated successfully in lib/database.types.ts"
echo ""
echo "⚠️  Remember to commit these type changes to git!"
