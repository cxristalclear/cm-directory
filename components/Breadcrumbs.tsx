import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { getCanonicalUrl } from '@/lib/config'
import { cn } from '@/components/utils'

export interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  variant?: 'default' | 'dark' | 'minimal'
  className?: string
}

export function Breadcrumbs({ items, variant = 'default', className }: BreadcrumbsProps) {
  const resolveItemUrl = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }

    return getCanonicalUrl(url)
  }
  
  // Use CSS variables or neutral classes that respect parent text color
  // Default colors for when no parent color is provided
  const colorClasses = {
    default: {
      icon: 'text-current opacity-60',
      separator: 'text-current opacity-60',
      link: 'text-current opacity-80 hover:opacity-100 hover:text-blue-600 transition-colors',
      current: 'text-current font-medium',
    },
    dark: {
      icon: 'text-gray-400',
      separator: 'text-gray-400',
      link: 'text-gray-600 hover:text-blue-600 transition-colors',
      current: 'text-gray-900 font-medium',
    },
    minimal: {
      icon: 'text-current opacity-50',
      separator: 'text-current opacity-50',
      link: 'text-current opacity-70 hover:opacity-100 transition-colors',
      current: 'text-current font-medium',
    },
  }

  const colors = colorClasses[variant]

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: resolveItemUrl(item.url), // Full URL for better SEO
    })),
  }
  
  return (
    <>
      <nav 
        aria-label="Breadcrumb" 
        className={cn("flex items-center flex-wrap gap-2 text-sm", className)}
      >
        {/* Optional: Add home icon for first item */}
        {items[0]?.name === 'Home' && (
          <Home className={cn("w-4 h-4", colors.icon)} />
        )}
        
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          
          return (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && (
                <ChevronRight className={cn("w-4 h-4", colors.separator)} />
              )}
              
              {isLast ? (
                // Current page shouldn't be a link
                <span className={colors.current}>
                  {item.name}
                </span>
              ) : (
                <Link 
                  href={item.url} 
                  className={colors.link}
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