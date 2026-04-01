import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Restaurant Manager SaaS",
  description: "Cinematic, pixel-perfect digital control panel.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans overflow-hidden bg-background text-foreground h-screen flex relative`}>
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[hsl(var(--accent-amber))]/10 blur-[150px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <Sidebar className="w-64 flex-shrink-0" />
        <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}

