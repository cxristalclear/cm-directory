import type { Metadata } from "next"
import type React from "react"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function WipLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
