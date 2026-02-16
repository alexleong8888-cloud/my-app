import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
}

export const metadata: Metadata = {
  title: 'LU BAR',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LU BAR',
  },
}

export default function CardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}