import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Pastikan URL ini sesuai dengan URL Vercel aktif kamu
const APP_URL = "https://base-vote-app.vercel.app"; 

export const METADATA = {
  name: "Base Vote",
  title: "Base Vote",
  description: "Create polls and vote on Base",
  
  // 1. BANNER: Untuk preview saat link di-share di Farcaster/Twitter (banner.png)
  bannerImageUrl: `${APP_URL}/banner.png`, 
  
  // 2. SCREENSHOT: Untuk keperluan showcase (screenshot.png)
  screenshotImageUrl: `${APP_URL}/screenshot.png`,

  iconImageUrl: `${APP_URL}/icon.png`,
  homeUrl: APP_URL,
  splashBackgroundColor: "#0052FF",
  splashImageUrl: `${APP_URL}/splash.png`,
};