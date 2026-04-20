"use client";

import { useEffect, useState } from "react";
import NextImage from "next/image";
import umuravaLogo from "@/app/umuravalogo.png";

export default function SplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the splash screen during this browser session
    const hasSeenSplash = sessionStorage.getItem("umurava_has_seen_splash");

    if (hasSeenSplash) {
      setTimeout(() => setShowSplash(false), 0);
    } else {
      // Start fading out after 2 seconds
      const fadeTimer = setTimeout(() => {
        setIsFading(true);
      }, 2000);

      // Remove from DOM completely after 2.5 seconds (allowing 500ms for the fade animation)
      const removeTimer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem("umurava_has_seen_splash", "true");
      }, 2500);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, []);

  // Don't render anything if splash should not be shown
  if (!showSplash) return null;

  return (
    <div 
      // Using the exact primary blue color from your project's Tailwind setup
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#3b82f6] transition-opacity duration-500 ease-in-out ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center justify-center animate-pulse">
        {/* Logo Icon */}
        <NextImage
          src={umuravaLogo}
          alt="Umurava Logo"
          width={120}
          height={120}
          className="object-contain md:w-[140px] md:h-[140px]"
          priority
        />
        
        {/* Logo Text (Optional: remove this <h1> if you only want the icon) */}
        <h1 className="mt-4 text-3xl font-black tracking-tight text-white lowercase md:text-4xl">
          umurava.ai
        </h1>
      </div>
    </div>
  );
}