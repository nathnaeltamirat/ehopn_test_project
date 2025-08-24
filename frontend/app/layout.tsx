import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { I18nProvider } from '@/components/I18nProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EHopN - Dashboard',
  description: 'Modern dashboard application with multi-language support',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}
