import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const APP_URL = "https://base-vote-app.vercel.app"; 

export const METADATA = {
  title: "Base Vote",
  description: "Create polls and vote on Base",
  
  // === UPDATE KE SCREENSHOT.PNG ===
  bannerImageUrl: `${APP_URL}/screenshot.png`, 
  
  iconImageUrl: `${APP_URL}/icon.png`,
  homeUrl: APP_URL,
  splashBackgroundColor: "#0052FF",
  splashImageUrl: `${APP_URL}/splash.png`,
};