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
        "logo": "https://www.cm-directory.com/og-image.png",
        "name": "PCBA Finder",
        "sameAs": [
          "https://twitter.com/cmdirectory",
          "https://www.linkedin.com/company/cm-directory",
          "https://github.com/cm-directory/app",
        ],
        "url": "https://www.cm-directory.com",
      }
    `)
  })

  it("returns the production website schema", () => {
    expect(webSiteJsonLd).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "PCBA Finder",
        "url": "https://www.cm-directory.com",
      }
    `)
  })

  it("builds breadcrumb lists with canonical URLs", () => {
    const breadcrumbSchema = createBreadcrumbListJsonLd([
      { name: "Home", url: "https://www.cm-directory.com/" },
      {
        name: "Manufacturers",
        url: "https://www.cm-directory.com/manufacturers",
      },
    ])

    expect(breadcrumbSchema).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "item": "https://www.cm-directory.com/",
            "name": "Home",
            "position": 1,
          },
          {
            "@type": "ListItem",
            "item": "https://www.cm-directory.com/manufacturers",
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
      url: "https://www.cm-directory.com/manufacturers/california",
      numberOfItems: 42,
      breadcrumbs: [
        { name: "Home", url: "https://www.cm-directory.com/" },
        {
          name: "Manufacturers",
          url: "https://www.cm-directory.com/manufacturers",
        },
        {
          name: "California",
          url: "https://www.cm-directory.com/manufacturers/california",
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
              "item": "https://www.cm-directory.com/",
              "name": "Home",
              "position": 1,
            },
            {
              "@type": "ListItem",
              "item": "https://www.cm-directory.com/manufacturers",
              "name": "Manufacturers",
              "position": 2,
            },
            {
              "@type": "ListItem",
              "item": "https://www.cm-directory.com/manufacturers/california",
              "name": "California",
              "position": 3,
            },
          ],
        },
        "description": "Verified partners across the state",
        "name": "Contract Manufacturers in California",
        "numberOfItems": 42,
        "url": "https://www.cm-directory.com/manufacturers/california",
      }
    `)
  })
})
