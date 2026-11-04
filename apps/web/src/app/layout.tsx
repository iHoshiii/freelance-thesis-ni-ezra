import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoilSense | Soil Analyzer",
  description: "Multi-sensor soil analyzer research dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
