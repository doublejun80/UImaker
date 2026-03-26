import type { Metadata } from "next";
import { StoreHydrator } from "@/components/providers/store-hydrator";
import { TopHeader } from "@/components/chrome/top-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Uiverse",
  description: "Local-first visual CSS editor and code generator"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): React.ReactElement {
  return (
    <html lang="en" className="dark">
      <body>
        <StoreHydrator />
        <TopHeader />
        {children}
      </body>
    </html>
  );
}
