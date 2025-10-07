import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import '../styles/admin-glass.css' 
import { Toaster } from 'sonner'

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

export const metadata: Metadata = {
  title: "CM Directory - Find Contract Manufacturers",
  description:
    "Discover and connect with verified contract manufacturers worldwide. Search by location, capabilities, and certifications.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>{children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}