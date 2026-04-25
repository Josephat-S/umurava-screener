import type { Metadata } from "next";
import type { ReactNode } from "react";
// 1. Import Work_Sans from next/font/google
import { Work_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";
// Import the new SplashScreen from the dashboard components folder
import SplashScreen from "@/app/dashboard/_components/SplashScreen";

// 2. Configure the Work Sans font
const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "Umurava AI Screener",
  description: "Recruiter dashboard for AI-powered talent screening",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      // 3. Apply the workSans CSS variable to the HTML class
      className={`${workSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-100 text-gray-900 font-sans">
        {/* Place the splash screen before the providers/children */}
        <SplashScreen />
        
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}