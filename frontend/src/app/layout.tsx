import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DelayIQ — Invoice Payment Delay Prediction",
  description: "AI-powered invoice payment delay prediction platform for modern finance teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
