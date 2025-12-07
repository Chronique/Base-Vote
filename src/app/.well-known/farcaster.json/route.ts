import { NextResponse } from "next/server";

export async function GET() {
  // Ganti URL ini dengan URL Vercel kamu yang asli
  const appUrl = "https://base-vote-alpha.vercel.app";

  const config = {
    "accountAssociation": {
      // header dan payload ini harus digenerate lewat Farcaster Dev Portal
      // Tapi untuk sekarang kita kosongkan atau pakai dummy agar struktur file ada dulu
      "header": "eyJmaWQiOjE2ODksInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgyY2Qz...EXAMPLE",
      "payload": "eyJkb21haW4iOiJiYXNlLXZvdGUtYXBwLnZlcmNlbC5hcHAifQ...EXAMPLE",
      "signature": "MHhiMz...EXAMPLE"
    },
    "frame": {
      "version": "1",
      "name": "Base Vote",
      "iconUrl": `${appUrl}/icon.png`,
      "homeUrl": appUrl,
      "imageUrl": `${appUrl}/banner.png`,
      "buttonTitle": "Vote Now",
      "splashImageUrl": `${appUrl}/splash.png`,
      "splashBackgroundColor": "#0052FF",
      "webhookUrl": `${appUrl}/api/webhook`
    }
  };

  return NextResponse.json(config);
}