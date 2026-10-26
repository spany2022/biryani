import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Gulzar, Manrope } from "next/font/google";
import { business } from "@/data/business";
import { getMenu } from "@/lib/store";
import CartProvider from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import Navbar from "@/components/layout/Navbar";
import SmoothScroll from "@/components/layout/SmoothScroll";
import CursorFollower from "@/components/ui/CursorFollower";
import "./globals.css";

// Menu prices and availability are edited live from /admin.
export const dynamic = "force-dynamic";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

// Nastaliq calligraphy for small decorative Urdu accents only.
const gulzar = Gulzar({
  variable: "--font-gulzar",
  subsets: ["arabic"],
  weight: "400",
  display: "swap",
  preload: false,
});

const title = `${business.name} — ${business.descriptor}`;
const description =
  "Fragrant basmati, slow-cooked dum and generations of Hyderabadi tradition. Explore the signature biryani collection, the royal menu, and order online.";

export const metadata: Metadata = {
  metadataBase: new URL(business.siteUrl ?? "http://localhost:3000"),
  title: { default: title, template: `%s — ${business.name}` },
  description,
  applicationName: business.name,
  ...(business.siteUrl ? { alternates: { canonical: "/" } } : {}),
  openGraph: {
    type: "website",
    siteName: business.name,
    title,
    description,
    locale: "en_IN",
    images: [{ url: "/images/hero-handi.jpg", alt: "Hyderabadi dum biryani in a handi on a dark table" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/images/hero-handi.jpg"] },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#17120F",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const menu = await getMenu();
  return (
    <html
      lang="en-IN"
      className={`${cormorant.variable} ${manrope.variable} ${gulzar.variable} antialiased`}
      suppressHydrationWarning
    >
      {/* suppressHydrationWarning: browser extensions inject attributes on <body>. */}
      <body suppressHydrationWarning>
        <a
          href="#main"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-saffron px-5 py-3 text-sm font-semibold text-midnight transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <CursorFollower />
        <CartProvider menu={menu}>
          <Navbar />
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
