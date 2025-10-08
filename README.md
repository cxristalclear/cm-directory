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
- (Optional) A Mapbox account for map visualization

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/cm-directory.git
cd cm-directory
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

# Mapbox Configuration (Optional)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_access_token

# Site Configuration (Required)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=CM Directory

# Social Profiles (Required for production metadata)
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/cmdirectory
NEXT_PUBLIC_LINKEDIN_URL=https://www.linkedin.com/company/cm-directory
NEXT_PUBLIC_GITHUB_URL=https://github.com/cm-directory/app

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
cm-directory/
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

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/cm-directory)

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
| `NEXT_PUBLIC_MAPBOX_TOKEN` | No | Mapbox access token for map visualization |
| `NEXT_PUBLIC_SITE_URL` | Yes | Full URL of your deployed site |
| `NEXT_PUBLIC_SITE_NAME` | No | Name of your site (default: "CM Directory") |
| `NEXT_PUBLIC_TWITTER_URL` | Yes | Public Twitter/X profile URL referenced in metadata |
| `NEXT_PUBLIC_LINKEDIN_URL` | Yes | LinkedIn company page for social links |
| `NEXT_PUBLIC_GITHUB_URL` | Yes | GitHub organization or repository to surface in the footer |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Google Analytics measurement ID |
| `NEXT_PUBLIC_SHOW_DEBUG` | No | Show debug information (default: false) |

> 🚀 **Deployment reminder:** Coordinate with DevOps to ensure `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_TWITTER_URL`, `NEXT_PUBLIC_LINKEDIN_URL`, and `NEXT_PUBLIC_GITHUB_URL` are populated with the marketing-approved production URLs in every environment.

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

For support, email support@cm-directory.com or open an issue in the GitHub repository.

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

Made with ❤️ by the CM Directory Team
