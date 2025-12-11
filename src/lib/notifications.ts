// 1. Definisikan Tipe Data User
interface NotificationUser {
  token: string;
  url: string;
  fid: number;
}

export async function sendNotification({
  url,
  token,
  notification,
}: {
  url: string;
  token: string;
  notification: {
    title: string;
    body: string;
    targetUrl: string;
  };
}) {
  const notificationId = crypto.randomUUID();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      notificationId,
      title: notification.title,
      body: notification.body,
      targetUrl: notification.targetUrl,
      tokens: [token],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send notification: ${response.status} ${errorText}`);
  }

  return response.json();
}

export async function notifyUsersNewPoll(question: string) {
  
  // 2. Berikan Tipe Explicit ke Array Kosong ini
  // [MOCK DATA] Nanti ganti ini dengan database call
  const users: NotificationUser[] = [
    // { token: "abc", url: "https://api...", fid: 123 }
  ];

  if (users.length === 0) {
    console.log("No users subscribed to notifications.");
    return;
  }

  console.log(`📢 Broadcasting new poll: "${question}" to ${users.length} users...`);

  for (const user of users) {
    try {
      await sendNotification({
        url: user.url || "https://api.warpcast.com/v1/frame-notifications",
        token: user.token,
        notification: {
          title: "New Poll Alert! 🗳️",
          body: `New poll: "${question}". Vote now!`,
          targetUrl: "https://base-vote-alpha.vercel.app", 
        },
      });
      console.log(`✅ Sent to FID ${user.fid}`);
    } catch (e) {
      console.error(`❌ Failed to send to FID ${user.fid}`, e);
    }
  }
}