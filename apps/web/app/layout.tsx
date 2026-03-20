import type { Metadata } from "next";
import { Inter, Manrope, Roboto_Mono } from "next/font/google";
import { StoreHydrator } from "@/components/providers/store-hydrator";
import { TopHeader } from "@/components/chrome/top-header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-headline" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Uiverse",
  description: "Local-first visual CSS editor and code generator"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): React.ReactElement {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${manrope.variable} ${robotoMono.variable}`}>
        <StoreHydrator />
        <TopHeader />
        {children}
      </body>
    </html>
  );
}
