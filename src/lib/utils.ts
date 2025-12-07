import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// === GANTI URL INI DENGAN URL VERCEL KAMU ===
const APP_URL = "https://base-vote-alpha.vercel.app"; 

export const METADATA = {
  title: "Base Vote",
  description: "Create polls and vote on Base",
  // Gambar Banner saat di-share di Farcaster
  bannerImageUrl: `${APP_URL}/banner.png`, 
  // Icon kecil
  iconImageUrl: `${APP_URL}/icon.png`,
  homeUrl: APP_URL,
  splashBackgroundColor: "#0052FF", // Warna Biru Base
  splashImageUrl: `${APP_URL}/splash.png`,
};