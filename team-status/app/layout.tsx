import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Team Status Board',
  description: 'Live employee status dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
