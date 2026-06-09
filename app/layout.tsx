import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SiteDataProvider } from '@/lib/site-data-context'
import { createClient } from '@/lib/supabase/server'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.cbiq.ai'),
  title: {
    default: 'CBIQ | Global Workforce & Mobility Intelligence',
    template: '%s | CBIQ',
  },
  description: 'Global workforce and mobility intelligence — benchmark your strategy, AI adoption and the future of work against 1,500+ HR, Talent and Mobility leaders.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/cbiq-favicon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/cbiq-favicon.svg',
  },
  openGraph: {
    type: 'website',
    siteName: 'CBIQ',
    url: 'https://www.cbiq.ai',
    title: 'CBIQ | Global Workforce & Mobility Intelligence',
    description: 'Global workforce and mobility intelligence — benchmark your strategy, AI adoption and the future of work against 1,500+ HR, Talent and Mobility leaders.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'CBIQ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CBIQ | Global Workforce & Mobility Intelligence',
    description: 'Global workforce and mobility intelligence — benchmark your strategy, AI adoption and the future of work against 1,500+ HR, Talent and Mobility leaders.',
    images: ['/og-image.png'],
  },
}

async function getLastUpdated(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("v_data_last_updated")
      .select("last_updated")
      .single()
    
    if (error || !data?.last_updated) {
      return null
    }
    
    // Format as "Month Year" (e.g., "June 2026")
    const date = new Date(data.last_updated)
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  } catch {
    return null
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const lastUpdated = await getLastUpdated()

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CBIQ',
    alternateName: 'Cross-Border Workforce Intelligence',
    url: 'https://www.cbiq.ai',
    logo: 'https://www.cbiq.ai/cbiq-logo-lockup.svg',
    description:
      'Global workforce and mobility intelligence and benchmarking, powered by Global Mobility Executive (GME).',
    // TODO: Replace with the official CBIQ LinkedIn company page URL.
    sameAs: ['https://www.linkedin.com/company/cbiq-PLACEHOLDER'],
  }

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CBIQ',
    url: 'https://www.cbiq.ai',
  }

  return (
    <html lang="en" className="dark bg-background">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body className="font-sans antialiased">
        <SiteDataProvider lastUpdated={lastUpdated}>
          {children}
        </SiteDataProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
