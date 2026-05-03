import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ["latin"],
  variable: '--font-poppins',
  display: 'swap',
});

const BASE_URL = 'https://www.talarifarms.co.in';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Talari Farms | India's #1 Gac Fruit Supplier — Bulk Export",
    template: '%s | Talari Farms',
  },
  description:
    "Talari Farms is India's leading Gac fruit (Momordica cochinchinensis) supplier based in Telangana. We export fresh Gac fruit, cold-pressed juice & powder in bulk for nutraceutical, beverage and food brands worldwide.",
  keywords: [
    'gac fruit supplier india',
    'gac fruit bulk export',
    'momordica cochinchinensis supplier',
    'gac fruit powder manufacturer india',
    'gac fruit juice exporter',
    'telangana gac fruit farm',
    'gac fruit wholesale',
    'indian gac fruit exporter',
    'gac fruit nutraceutical',
    'talari farms',
  ],
  authors: [{ name: 'Talari Farms', url: BASE_URL }],
  creator: 'Talari Farms',
  publisher: 'Talari Farms',
  category: 'Agriculture',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: BASE_URL,
    siteName: 'Talari Farms',
    title: "India's #1 Gac Fruit Supplier — Bulk Export | Talari Farms",
    description:
      "Telangana-based Gac fruit farm offering fresh fruit, cold-pressed juice & powder for global nutraceutical and food brands. Request a bulk quote today.",
    images: [
      {
        url: '/hero-gac-lovable.jpg',
        width: 1200,
        height: 630,
        alt: 'Talari Farms — Premium Gac Fruit from Telangana, India',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "India's #1 Gac Fruit Supplier | Talari Farms",
    description:
      'Fresh Gac fruit, cold-pressed juice & powder in bulk from Telangana, India. Export-ready for global brands.',
    images: ['/hero-gac-lovable.jpg'],
  },
  icons: {
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
