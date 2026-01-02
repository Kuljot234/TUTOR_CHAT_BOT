import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Lora } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ErrorBoundary } from "@/components/error-boundary"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Study Tutor - AI-Powered Learning Assistant",
  description: "A calm, adaptive study tutor that guides you step-by-step through concepts",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
          integrity="sha384-nAnMqzvxQdq99Kq8UMUXauK5E8931gr6RlZ2WwHSWvH8ebWNMwX6fMRLG28G8u5S"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} antialiased font-sans`}>
        <ErrorBoundary>
          <Providers>
            <TooltipProvider>{children}</TooltipProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
