# Contract Manufacturer Directory

A Next.js application that helps users find and filter contract manufacturers based on their capabilities, location, certifications, and more.

## 🚀 Features

- **Advanced Filtering System**
  - Filter by manufacturing capabilities (SMT, Through-Hole, Box Build, etc.)
  - Geographic location filtering (countries and states)
  - Production volume filtering
  - Real-time dynamic filter counts
  
- **Interactive Visualizations**
  - Mapbox integration for facility location visualization
  - Cluster-based map markers
  - Responsive map controls

- **Optimized Performance**
  - Server-side rendering with Next.js 15
  - Client-side filtering with optimized algorithms
  - Pagination for large result sets
  - Error boundaries for graceful error handling

- **SEO Optimized**
  - Dynamic metadata generation
  - Automatic sitemap generation
  - RSS updates feed for Search Console and subscribers
  - Structured data (JSON-LD) for search engines
  - robots.txt configuration

## 📋 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Maps**: Mapbox GL JS
- **State Management**: React Context API
- **Icons**: Lucide React

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn package manager
- A Supabase account and project
- (Optional, but required for the AI Research importer) A Mapbox account for map visualization and facility geocoding

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/pcba-finder.git
cd pcba-finder
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Fill in your environment variables:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Mapbox Configuration (Required for AI Research importer & facility geocoding)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_access_token

# AI Integrations (Required for AI Research importer)
OPENAI_API_KEY=your_openai_api_key
ZOOMINFO_WEBHOOK_URL=https://hook.example.com/your-make-scenario

# Site Configuration (Required)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=PCBA Finder

# Social Profiles (Required for production metadata)
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/cmdirectory
NEXT_PUBLIC_LINKEDIN_URL=https://www.linkedin.com/company/pcba-finder
NEXT_PUBLIC_GITHUB_URL=https://github.com/pcba-finder/app

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Feature Flags
NEXT_PUBLIC_SHOW_DEBUG=false
```

> **Deployment Tip:** Hosting on Vercel? Define the same environment variables in your project settings (Project Settings → Environment Variables). Files like `.env.local` are not uploaded during Vercel builds, so any values that only exist locally will be treated as missing at build time.

### 4. Set up your Supabase database

Ensure your Supabase database has the required tables and schema. See the database schema documentation in `/docs/database-schema.md` (if available).

### 5. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
pcba-finder/
├── app/                      # Next.js app directory
│   ├── companies/           # Company detail pages
│   ├── manufacturers/       # Geographic filtering pages
│   ├── error.tsx           # Error boundary page
│   ├── global-error.tsx    # Global error handler
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   ├── robots.ts           # Robots.txt configuration
│   └── sitemap.ts          # Dynamic sitemap generation
├── components/              # React components
│   ├── CompanyList.tsx     # Company listing with pagination
│   ├── CompanyMap.tsx      # Interactive map component
│   ├── FilterSidebar.tsx   # Filter controls
│   ├── FilterErrorBoundary.tsx
│   ├── MapErrorBoundary.tsx
│   └── Pagination.tsx      # Pagination component
├── contexts/               # React context providers
│   └── FilterContext.tsx   # Filter state management
├── lib/                    # Utility libraries
│   ├── config.ts           # Centralized configuration
│   ├── filters/            # Filter utilities
│   ├── supabase.ts         # Supabase client
│   └── mapbox-utils.ts     # Mapbox utilities
├── types/                  # TypeScript type definitions
│   └── company.ts          # Company and related types
├── utils/                  # Utility functions
│   ├── filtering.ts        # Client-side filtering logic
│   ├── stateMapping.ts     # State name mappings
│   └── countryMapping.ts   # Country name mappings
├── test/                   # Test files
│   └── filters/            # Filter-related tests
├── .env.example            # Example environment variables
└── next.config.ts          # Next.js configuration
```

## 🗂️ CMS Content Guidelines

To keep structured data accurate, content operations should populate the following optional fields when updating profiles in the CMS or Supabase:

- `cms_metadata.canonical_path` – relative or absolute canonical URL for the company profile.
- `cms_metadata.social_links[]` – each entry should include `platform`, `url`, and `is_verified: true` for links that can be surfaced in schema.org `sameAs` arrays.
- `cms_metadata.logo` – preferred logo asset (Supabase storage URL) with optional `alt_text`.
- `cms_metadata.hero_image` / `cms_metadata.gallery_images[]` – hero and supporting imagery used for JSON-LD `image` values.
- `social_links[]` – legacy Supabase JSON column; continue marking verified links with `is_verified` to ensure they are eligible for discovery.

Leaving these fields empty is safe—the schema output automatically omits undefined values.

## 🔔 RSS Feed & Search Console

- The live feed of company updates is exposed at `https://www.pcba-finder.com/feed.xml` (also available locally at `/feed.xml`).
- Submit the feed to Google Search Console alongside the sitemap so crawlers learn about profile refreshes faster:
  1. Open Search Console for the PCBA Finder property.
  2. Navigate to **Indexing → Sitemaps**.
  3. Enter `https://www.pcba-finder.com/feed.xml` in the submission form and click **Submit**.
- The feed and sitemap share the `NEXT_PUBLIC_BUILD_TIMESTAMP` (or `BUILD_TIMESTAMP`) fallback, so triggering the existing build hook refreshes both documents together.

## 🧪 Testing

Run the test suite:

```bash
npm test
# or
yarn test
```

Run tests in watch mode:

```bash
npm run test:watch
# or
yarn test:watch
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/pcba-finder)

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Digital Ocean App Platform
- Railway

## 🔒 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous key |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Conditional | Mapbox access token for map visualization and required for the AI Research importer |
| `OPENAI_API_KEY` | Conditional | Server-only key for OpenAI requests used by the AI importer (never expose via `NEXT_PUBLIC_`) |
| `ZOOMINFO_WEBHOOK_URL` | Conditional | Server-only Make.com webhook URL for ZoomInfo enrichment calls |
| `NEXT_PUBLIC_SITE_URL` | Yes | Full URL of your deployed site |
| `NEXT_PUBLIC_SITE_NAME` | No | Name of your site (default: "PCBA Finder") |
| `NEXT_PUBLIC_TWITTER_URL` | Yes | Public Twitter/X profile URL referenced in metadata |
| `NEXT_PUBLIC_LINKEDIN_URL` | Yes | LinkedIn company page for social links |
| `NEXT_PUBLIC_GITHUB_URL` | Yes | GitHub organization or repository to surface in the footer |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Google Analytics measurement ID |
| `NEXT_PUBLIC_SHOW_DEBUG` | No | Show debug information (default: false) |

> 🚀 **Deployment reminder:** Coordinate with DevOps to ensure `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_TWITTER_URL`, `NEXT_PUBLIC_LINKEDIN_URL`, and `NEXT_PUBLIC_GITHUB_URL` are populated with the marketing-approved production URLs in every environment.

## 🧠 AI Research Importer

The admin dashboard includes an AI-assisted importer that enriches facility data and automatically geocodes addresses so they appear on maps. To enable geocoding, provide a valid `NEXT_PUBLIC_MAPBOX_TOKEN` in your environment. Without a token, the importer will surface a warning for each facility and save it without latitude/longitude data.

- **Security:** Configure `OPENAI_API_KEY` and `ZOOMINFO_WEBHOOK_URL` as server-side environment variables (locally in `.env.local`, in production via your hosting provider). Do not prefix them with `NEXT_PUBLIC_` and never commit real keys to the repository.
- **Where to configure it:** Add the token to `.env.local` (and your deployment platform) under `NEXT_PUBLIC_MAPBOX_TOKEN`.
- **Troubleshooting:** A missing or invalid token raises a "Mapbox access token is not configured" toast in the importer. Double-check that the variable is defined, has no extra whitespace, and that the Mapbox account has geocoding permissions.
- **Geocoding failures:** Network or API errors can also prevent geocoding. The UI continues the import without coordinates so operators can retry later without losing company records.

## 📚 Key Features Documentation

### Filtering System

The filtering system supports:
- **Multiple countries**: Filter companies by country location
- **Multiple states**: Filter by US states or other regions
- **Capabilities**: Select from SMT, Through-Hole, Box Build, etc.
- **Production Volume**: Choose low, medium, or high volume production

Filters are synchronized with URL parameters for bookmarkable searches.

### Pagination

- Default: 12 companies per page
- Automatic reset to page 1 when filters change
- Smooth scroll to top on page change
- Keyboard accessible

### Error Handling

- Global error boundary for critical errors
- Filter-specific error boundary with recovery options
- Map error boundary with graceful fallback
- Detailed error logging in development mode

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Supabase](https://supabase.com/)
- Maps by [Mapbox](https://www.mapbox.com/)
- Icons by [Lucide](https://lucide.dev/)

## 📧 Support

For support, email support@pcba-finder.com or open an issue in the GitHub repository.

## 🗺️ Roadmap

- [ ] Add user authentication
- [ ] Implement company comparison feature
- [ ] Add RFQ (Request for Quote) system
- [ ] Implement review and rating system
- [ ] Add advanced search functionality
- [ ] Create admin dashboard
- [ ] Add more filter categories (certifications, industries)
- [ ] Implement email notifications
- [ ] Add export functionality

---

Made with ❤️ by the PCBA Finder Team
