import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { RootThemeProvider } from './RootThemeProvider'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Corturno — Tu peluquería, online en minutos.',
  description: 'Una agenda simple, una página propia para que tus clientes reserven solos.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${dmSans.variable} ${playfair.variable} ${jetbrainsMono.variable}`}>
        <RootThemeProvider>
          {children}
        </RootThemeProvider>
      </body>
    </html>
  )
}
