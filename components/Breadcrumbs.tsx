import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  variant?: 'default' | 'dark' | 'minimal'
  className?: string
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  // Add your domain for absolute URLs in schema
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'
  
    

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`, // Full URL for better SEO
    })),
  }
  
  return (
    <>
      <nav 
        aria-label="Breadcrumb" 
        className={`flex items-center flex-wrap gap-2 text-sm ${className}`}
      >
        {/* Optional: Add home icon for first item */}
        {items[0]?.name === 'Home' && (
          <Home className="w-4 h-4 text-gray-400" />
        )}
        
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          
          return (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              
              {isLast ? (
                // Current page shouldn't be a link
                <span className="text-gray-900 font-medium">
                  {item.name}
                </span>
              ) : (
                <Link 
                  href={item.url} 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </div>
          )
        })}
      </nav>
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  )
}