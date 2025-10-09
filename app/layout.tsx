import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import "./admin-glass.css"
import { Toaster } from "sonner"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { siteConfig } from "@/lib/config"
import SiteFooter from "@/components/SiteFooter"
import {
  jsonLdScriptProps,
  organizationJsonLd,
  webSiteJsonLd,
} from "@/lib/schema"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadataBase = new URL(siteConfig.url)

const defaultTitle = `${siteConfig.name} - Find Contract Manufacturers`
const defaultDescription =
  "Discover and connect with verified contract manufacturers worldwide. Search by location, capabilities, and certifications."

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: defaultTitle,
    template: `%s | ${siteConfig.name}`,
  },
  description: defaultDescription,
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: siteConfig.name,
    description: defaultDescription,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: defaultDescription,
    images: [siteConfig.ogImage],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const rootStructuredData = [organizationJsonLd, webSiteJsonLd]

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {rootStructuredData.map((schema) => (
          <script
            key={schema["@type"]}
            {...jsonLdScriptProps(schema)}
          />
        ))}
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${siteConfig.name} Updates`}
          href={`${siteConfig.url}/feed.xml`}
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        {children}
        <SiteFooter />
        <SpeedInsights />
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
