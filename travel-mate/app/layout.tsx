import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Travel Mate | Your Smart Travel Companion",
  description:
    "Discover amazing destinations, plan your trips, and explore the world with Travel Mate. Offline-friendly maps, curated recommendations, and seamless travel planning.",
  keywords: [
    "travel",
    "trip planning",
    "destinations",
    "offline maps",
    "travel companion",
  ],
  authors: [{ name: "Travel Mate Team" }],
  openGraph: {
    title: "Travel Mate | Your Smart Travel Companion",
    description: "Discover amazing destinations and plan your perfect trip",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
