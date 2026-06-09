import type { Metadata, Viewport } from 'next';
import {
  Barlow_Condensed,
  DM_Sans,
  IBM_Plex_Mono,
  JetBrains_Mono,
  Pixelify_Sans,
  Playfair_Display,
  Share_Tech_Mono,
  Syne,
} from 'next/font/google';
import './globals.css';

const shareTechMono = Share_Tech_Mono({ weight: '400', subsets: ['latin'], variable: '--font-share-tech' });
const playfair = Playfair_Display({ weight: ['600', '700'], subsets: ['latin'], variable: '--font-playfair' });
const ibmPlexMono = IBM_Plex_Mono({ weight: ['400', '600'], subsets: ['latin'], variable: '--font-ibm-plex' });
const dmSans = DM_Sans({ weight: ['400', '600', '700'], subsets: ['latin'], variable: '--font-dm-sans' });
const jetbrains = JetBrains_Mono({ weight: ['400', '600'], subsets: ['latin'], variable: '--font-jetbrains' });
const syne = Syne({ weight: ['500', '600', '700'], subsets: ['latin'], variable: '--font-syne' });
const barlowCondensed = Barlow_Condensed({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-barlow-condensed',
});
const pixelify = Pixelify_Sans({ weight: '400', subsets: ['latin'], variable: '--font-pixel' });

export const metadata: Metadata = {
  title: {
    default: 'Flight Tracker — Denver',
    template: '%s | Flight Tracker',
  },
  description: 'Personal flight display dashboard for aircraft near Denver, CO.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Flight Tracker',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a0f0a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${shareTechMono.variable} ${playfair.variable} ${ibmPlexMono.variable} ${dmSans.variable} ${jetbrains.variable} ${syne.variable} ${barlowCondensed.variable} ${pixelify.variable}`}
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
