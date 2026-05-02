import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Bio Gold | New Zealand Pine Pollen",
  description: "Premium New Zealand pine pollen products for the Chinese market. University of Otago validated. Government-funded R&D.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={outfit.variable}>
      <body suppressHydrationWarning className="min-h-screen flex flex-col bg-background text-charcoal">
        {children}
      </body>
    </html>
  );
}
