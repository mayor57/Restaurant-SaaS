import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import LayoutContent from "@/components/LayoutContent";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "KEM'Z DINER",
  description: "Cinematic, pixel-perfect digital control panel.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={${inter.variable}  font-sans overflow-hidden bg-background text-foreground h-screen flex relative}>
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
