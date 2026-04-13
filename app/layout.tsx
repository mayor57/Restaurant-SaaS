import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import LayoutContent from "@/components/LayoutContent";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "KEM'Z DINER | Dashboard",
  description: "Next-generation KEM'Z DINER management operating system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={${inter.variable}  font-inter bg-[#050505] text-white min-h-screen antialiased selection:bg-amber-500/30 selection:text-amber-200}>
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}

