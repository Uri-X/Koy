import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Loyalty Platform",
  description: "Multi-industry loyalty points platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
