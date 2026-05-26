import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://contextkit-docs.vercel.app'),
  title: "ContextKit - Context Engineering + Agentic AI Pipelines",
  description:
    "Scaffold structured context for your AI tools and run autonomous multi-role pipelines grounded by that context. Works with Cursor, Claude Code, Copilot, Codex, Gemini, Aider, and more.",
  generator: "next.js",
  keywords: ["AI development", "context engineering", "developer tools", "TypeScript", "code quality", "Cursor", "Claude", "Aider"],
  authors: [{ name: "Marlon Maniti", url: "https://github.com/nolrm" }],
  creator: "Marlon Maniti",
  publisher: "ContextKit",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://github.com/nolrm/contextkit/tree/main/contextkit-docs",
    siteName: "ContextKit",
    title: "ContextKit - Context Engineering + Agentic AI Pipelines",
    description: "Scaffold structured standards for your AI tools and run a grounded multi-role agentic pipeline — PO to Architect to Dev to Tester to Reviewer — without agents hallucinating your conventions.",
    images: [
      {
        url: "/contextkit-logo.svg",
        width: 1200,
        height: 630,
        alt: "ContextKit Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ContextKit - Context Engineering + Agentic AI Pipelines",
    description: "Structured context for your AI tools + an autonomous multi-role pipeline grounded by that context. No hallucinated conventions.",
    creator: "@nolrm",
    images: ["/contextkit-logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg",
  },
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "ContextKit",
              "description": "Context Engineering + Agentic AI Pipelines — scaffold project standards for AI assistants and run grounded autonomous pipelines that never hallucinate your conventions",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Person",
                "name": "Marlon Maniti",
                "url": "https://github.com/nolrm"
              },
              "downloadUrl": "https://www.npmjs.com/package/@nolrm/contextkit",
              "softwareVersion": "1.0.0",
              "provider": {
                "@type": "Organization",
                "name": "ContextKit",
                "url": "https://github.com/nolrm/contextkit"
              }
            })
          }}
        />
      </head>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
