# CM Directory - Quick Setup Guide

This guide will walk you through setting up the CM Directory application from scratch.

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js 18+ installed ([Download](https://nodejs.org/))
- [ ] Git installed ([Download](https://git-scm.com/))
- [ ] A code editor (VS Code recommended)
- [ ] A Supabase account ([Sign up](https://supabase.com/))
- [ ] (Optional) A Mapbox account ([Sign up](https://www.mapbox.com/))

## 🚀 Step-by-Step Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/cm-directory.git
cd cm-directory

# Install dependencies
npm install
```

### Step 2: Set Up Supabase

1. **Create a new Supabase project**
   - Go to [https://app.supabase.com/](https://app.supabase.com/)
   - Click "New Project"
   - Fill in project details
   - Wait for the project to be created

2. **Get your Supabase credentials**
   - Go to Project Settings → API
   - Copy your `Project URL`
   - Copy your `anon/public` key

3. **Set up the database schema**
   ```sql
   -- Run this in your Supabase SQL Editor
   -- (Schema SQL will be provided separately)
   ```

### Step 3: Configure Environment Variables

1. **Copy the example file**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local` with your values**
   ```env
   # Supabase (Required)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

   # Site Configuration (Required)
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_SITE_NAME=CM Directory

   # Mapbox (Optional - leave blank to skip map features)
   NEXT_PUBLIC_MAPBOX_TOKEN=

   # Feature Flags
   NEXT_PUBLIC_SHOW_DEBUG=false
   ```

### Step 4: Verify Configuration

Test that your environment variables are loaded correctly:

```bash
npm run dev
```

Visit `http://localhost:3000` - you should see the homepage (even if there's no data yet).

### Step 5: Import Sample Data (Optional)

If you have a CSV file with company data:

```bash
# Import companies
npm run import-companies

# Geocode facilities (requires Mapbox token)
npm run geocode
```

### Step 6: Run Tests

Ensure everything is working:

```bash
npm test
```

You should see all tests passing.

## ✅ Verification Checklist

Make sure everything is working:

- [ ] Application loads at `http://localhost:3000`
- [ ] No console errors in the browser
- [ ] Filters are visible in the sidebar
- [ ] Companies list displays (or shows "no results" if database is empty)
- [ ] Map displays (or shows fallback message if no Mapbox token)
- [ ] Tests pass with `npm test`

## 🔧 Common Issues and Solutions

### Issue: "Missing required environment variables"

**Solution**: Make sure your `.env.local` file exists and contains all required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

### Issue: "Failed to fetch companies"

**Solution**: 
1. Check your Supabase credentials are correct
2. Verify your database has the `companies` table
3. Check the table has Row Level Security (RLS) policies that allow public read access

### Issue: Map not displaying

**Solution**: This is expected if you haven't added a Mapbox token. The app will show a fallback message. To enable maps:
1. Sign up at [https://www.mapbox.com/](https://www.mapbox.com/)
2. Get your access token
3. Add it to `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env.local`
4. Restart the dev server

### Issue: Port 3000 already in use

**Solution**: Either:
- Stop the other application using port 3000
- Or run on a different port: `npm run dev -- -p 3001`

### Issue: TypeScript errors

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Restart dev server
npm run dev
```

## 📚 Next Steps

Once your setup is complete:

1. **Add Your Data**
   - Import companies through Supabase dashboard
   - Or use the import script with a CSV file

2. **Customize**
   - Update `NEXT_PUBLIC_SITE_NAME` in `.env.local`
   - Modify colors in `tailwind.config.js`
   - Update company schema if needed

3. **Deploy**
   - See [Deployment Guide](./DEPLOYMENT.md) for production deployment
   - Remember to add environment variables to your hosting platform

## 🆘 Getting Help

If you're stuck:

1. **Check the logs**: Look for error messages in the terminal and browser console
2. **Review the README**: See [README.md](./README.md) for more detailed documentation
3. **Open an issue**: [GitHub Issues](https://github.com/yourusername/cm-directory/issues)
4. **Join our Discord**: [Link to Discord] (if available)

## 🎉 You're All Set!

Your CM Directory is now running locally. Happy coding!

---

**Need to deploy?** Check out our [Deployment Guide](./DEPLOYMENT.md)

**Want to contribute?** See our [Contributing Guidelines](./CONTRIBUTING.md)
