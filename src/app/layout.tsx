import type { Metadata } from 'next';
import Image from 'next/image';
import { Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SmoothScroll } from '@/components/SmoothScroll';
import { Agentation } from 'agentation';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AeroGuard — Urban Smog & Clean Air Guide',
  description:
    'Practical atmospheric intelligence for families and communities navigating severe winter smog, radiation temperature inversions, and indoor particulate mitigation.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#f7f6f5] text-[#141414] antialiased">
        <ThemeProvider>
          <SmoothScroll>
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-9">
            {children}
          </main>
          <footer className="border-t border-black/10 bg-[#f7f6f5] py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[16px] leading-[1.5] text-[#141414]">
              <div className="flex items-center gap-2">
                <Image
                  src="/icon.svg"
                  alt="AeroGuard logo"
                  width={20}
                  height={20}
                  className="w-5 h-5 rounded-[2px] shrink-0 object-contain"
                />
                <p className="max-w-3xl text-center text-[14px] text-[#666666] sm:text-left">
                  AeroGuard — Open Public-Health Utility. Atmospheric data provided by Open-Meteo.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[14px] sm:gap-3">
                <a href="/routines" className="inline-flex min-h-11 items-center text-[#141414] hover:text-[#2200ff] rounded-[2px] transition-colors lg:min-h-0">
                  Routines
                </a>
                <a href="/iaq-lab" className="inline-flex min-h-11 items-center text-[#141414] hover:text-[#2200ff] rounded-[2px] transition-colors lg:min-h-0">
                  IAQ Lab
                </a>
                <a href="/community" className="inline-flex min-h-11 items-center text-[#141414] hover:text-[#2200ff] rounded-[2px] transition-colors lg:min-h-0">
                  Community
                </a>
                <a href="/assistant" className="inline-flex min-h-11 items-center text-[#2200ff] hover:underline rounded-[2px] lg:min-h-0">
                  Advisor
                </a>
              </div>
            </div>
          </footer>
          {process.env.NODE_ENV === 'development' && <Agentation />}
        </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
