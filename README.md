# Contract Manufacturer Directory

A Next.js application that helps users find and filter contract manufacturers based on their capabilities, location, certifications, and more.

## Features

- Interactive map visualization of manufacturer locations
- Advanced filtering system for:
  - Manufacturing capabilities
  - Geographic location
  - Production volume
  - Certifications
  - Industry specializations
- Real-time search functionality
- Responsive design for mobile and desktop
- Supabase integration for data management

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase
- React Context for state management

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn package manager

## Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/cxristalclear/cm-directory.git
cd cm-directory
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
cm-directory/
├── app/                  # Next.js app directory
│   ├── companies/       # Company-specific pages
│   └── page.tsx        # Homepage
├── components/          # React components
├── contexts/           # React context providers
├── lib/               # Utility functions and configurations
└── public/            # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
