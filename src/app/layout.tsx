import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/hooks/use-cart";
import { WishlistProvider } from "@/hooks/use-wishlist";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://tixandtripsegypt.com"),
  title: {
    default: "Tix and Trips Egypt - Your Gateway to Unforgettable Journeys",
    template: "%s | Tix and Trips Egypt",
  },
  description: "Explore the wonders of Egypt with Tix and Trips. We offer curated tours, custom travel experiences, and expert guides to the Pyramids, Luxor, Aswan, and beyond.",
  keywords: ["Egypt tours", "travel Egypt", "Pyramids of Giza", "Luxor tours", "Aswan cruises", "tailor-made Egypt trips", "vacation in Egypt", "Nile cruise"],
  openGraph: {
    title: "Tix and Trips Egypt - Your Gateway to Unforgettable Journeys",
    description: "Discover the magic of Egypt with our premium tours and travel packages. From the Pyramids to the Nile, we create memories that last a lifetime.",
    url: "/",
    siteName: "Tix and Trips Egypt",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tix and Trips Egypt",
    description: "Explore the wonders of Egypt with Tix and Trips. Custom tours and unforgettable experiences.",
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
};

import { LanguageProvider } from "@/hooks/use-language";
import { CurrencyProvider } from "@/hooks/use-currency";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${playfair.variable}`} suppressHydrationWarning={true}>
        <LanguageProvider>
          <CurrencyProvider>
            <WishlistProvider>
              <CartProvider>
                {children}
                <Toaster />
              </CartProvider>
            </WishlistProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
