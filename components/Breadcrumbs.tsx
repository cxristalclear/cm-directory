import Link from 'next/link'

export function Breadcrumbs({ items }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
  
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm">
        {items.map((item, i) => (
          <span key={i}>
            {i > 0 && ' / '}
            <Link href={item.url} className="hover:underline">
              {item.name}
            </Link>
          </span>
        ))}
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  )
}