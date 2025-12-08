import {
  createBreadcrumbListJsonLd,
  createCollectionPageJsonLd,
  organizationJsonLd,
  webSiteJsonLd,
} from "@/lib/schema"

describe("schema helpers", () => {
  it("returns the production organization schema", () => {
    expect(organizationJsonLd).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "logo": "https://www.pcbafinder.com/og-image.png",
        "name": "PCBA Finder",
        "sameAs": [
          "https://twitter.com/pcbafinder",
          "https://www.linkedin.com/company/pcbafinder",
          "https://github.com/pcbafinder/app",
        ],
        "url": "https://www.pcbafinder.com",
      }
    `)
  })

  it("returns the production website schema", () => {
    expect(webSiteJsonLd).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "PCBA Finder",
        "url": "https://www.pcbafinder.com",
      }
    `)
  })

  it("builds breadcrumb lists with canonical URLs", () => {
    const breadcrumbSchema = createBreadcrumbListJsonLd([
      { name: "Home", url: "https://www.pcbafinder.com/" },
      {
        name: "Manufacturers",
        url: "https://www.pcbafinder.com/manufacturers",
      },
    ])

    expect(breadcrumbSchema).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "item": "https://www.pcbafinder.com/",
            "name": "Home",
            "position": 1,
          },
          {
            "@type": "ListItem",
            "item": "https://www.pcbafinder.com/manufacturers",
            "name": "Manufacturers",
            "position": 2,
          },
        ],
      }
    `)
  })

  it("builds collection page schema with breadcrumbs", () => {
    const collectionSchema = createCollectionPageJsonLd({
      name: "Contract Manufacturers in California",
      description: "Verified partners across the state",
      url: "https://www.pcbafinder.com/manufacturers/california",
      numberOfItems: 42,
      breadcrumbs: [
        { name: "Home", url: "https://www.pcbafinder.com/" },
        {
          name: "Manufacturers",
          url: "https://www.pcbafinder.com/manufacturers",
        },
        {
          name: "California",
          url: "https://www.pcbafinder.com/manufacturers/california",
        },
      ],
    })

    expect(collectionSchema).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "breadcrumb": {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "item": "https://www.pcbafinder.com/",
              "name": "Home",
              "position": 1,
            },
            {
              "@type": "ListItem",
              "item": "https://www.pcbafinder.com/manufacturers",
              "name": "Manufacturers",
              "position": 2,
            },
            {
              "@type": "ListItem",
              "item": "https://www.pcbafinder.com/manufacturers/california",
              "name": "California",
              "position": 3,
            },
          ],
        },
        "description": "Verified partners across the state",
        "name": "Contract Manufacturers in California",
        "numberOfItems": 42,
        "url": "https://www.pcbafinder.com/manufacturers/california",
      }
    `)
  })
})
