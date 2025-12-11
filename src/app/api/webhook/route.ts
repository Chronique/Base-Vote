import { NextRequest, NextResponse } from "next/server";
import { parseWebhookEvent, verifyAppKeyWithNeynar } from "@farcaster/frame-node";

export async function POST(request: NextRequest) {
  const requestJson = await request.json();

  try {
    // 1. Verifikasi Data dari Farcaster (Security)
    // Pastikan NEYNAR_API_KEY ada di .env kamu jika ingin verifikasi jalan
    // const data = await verifyAppKeyWithNeynar(requestJson, { apiKey: process.env.NEYNAR_API_KEY });
    
    // Untuk demo/testing tanpa API Key, kita anggap valid dulu:
    const data = requestJson; 

    const { event } = data;

    // 2. TANGKAP EVENT: User Menambahkan App (Enable Notification)
    if (event.event === "frame_added") {
      const { notificationDetails, user } = event;
      
      if (notificationDetails) {
        console.log(`✅ User ${user.username} (FID: ${user.fid}) enabled notifications!`);
        console.log(`🔑 Token: ${notificationDetails.token}`);
        console.log(`🌐 Url: ${notificationDetails.url}`);

        // [TODO: SAVE TO DATABASE]
        // Di sini kamu WAJIB menyimpan 'token' dan 'url' ke database kamu.
        // Contoh Pseudo-code:
        // await db.users.upsert({ 
        //    fid: user.fid, 
        //    notifToken: notificationDetails.token,
        //    notifUrl: notificationDetails.url 
        // });
      }
    }

    // 3. TANGKAP EVENT: User Menghapus App (Disable Notification)
    if (event.event === "frame_removed") {
       // [TODO: REMOVE FROM DATABASE]
       console.log(`❌ User ${event.user.fid} removed the app.`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}