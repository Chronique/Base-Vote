"use client";

import { useState, useEffect, useCallback } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
// Hapus import Image karena tidak pakai gambar lagi
import CreateQuest from "~/components/CreateQuest";
import QuestList from "~/components/QuestList";
import MyActivity from "~/components/MyActivity"; 
import { sdk } from "@farcaster/miniapp-sdk"; 
import { useConnect, useAccount } from "wagmi"; 
// Import Framer Motion
import { motion } from "framer-motion"; 
import { MdHomeFilled, MdAddCircle, MdPerson, MdHowToVote, MdBallot, MdAddToHomeScreen, MdShare, MdRocketLaunch } from "react-icons/md";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"feed" | "create" | "profile">("feed");
  const [farcasterUser, setFarcasterUser] = useState<{ pfpUrl?: string; username?: string } | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();

  const initializeFarcaster = useCallback(async () => {
    try {
      const context = await sdk.context;
      if (context?.client?.added) setIsAdded(true);
      if (context?.user) {
        setFarcasterUser({
          pfpUrl: context.user.pfpUrl,
          username: context.user.username,
        });
      }
      await sdk.actions.ready();
      if (!isConnected) {
        const farcasterConnector = connectors.find((c) => c.id === "farcasterFrame");
        if (farcasterConnector) connect({ connector: farcasterConnector });
      }
    } catch (err) {
      console.error("Farcaster Init Error:", err);
    }
  }, [connect, connectors, isConnected]);

  useEffect(() => {
    initializeFarcaster();
  }, [initializeFarcaster]);

  const handleAddApp = async () => {
    try {
      await sdk.actions.addFrame();
      setIsAdded(true);
      alert("App added successfully! 🎉");
    } catch (error) {
      console.error("Failed to add frame:", error);
    }
  };

  const handleShare = () => {
    const appUrl = "https://base-vote-alpha.vercel.app"; 
    const text = "Voting on Base, create polls and vote 🔵\n\nCreate your poll or vote now 👇";
    const encodedText = encodeURIComponent(text);
    const encodedEmbed = encodeURIComponent(appUrl);
    sdk.actions.openUrl(`https://warpcast.com/~/compose?text=${encodedText}&embeds[]=${encodedEmbed}`);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans flex flex-col pb-24 transition-colors duration-300">
      
      {/* === NAVBAR === */}
      <nav className="w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex justify-between items-center sticky top-0 z-50 transition-colors">
        <div className="flex items-center gap-3">
            <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20"
            >
                <MdHowToVote className="text-white text-2xl" />
            </motion.div>
            <div className="flex flex-col">
                <h1 className="font-black text-xl leading-none tracking-tighter text-gray-900 dark:text-white">
                    BASE <span className="text-blue-600">VOTE</span>
                </h1>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase">
                    Onchain Polling
                </p>
            </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleShare} className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors">
              <MdShare className="text-xl" />
          </button>
          {!isAdded && (
            <button onClick={handleAddApp} className="p-2 bg-gray-100 dark:bg-gray-800 text-blue-600 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors">
                <MdAddToHomeScreen className="text-xl" />
            </button>
          )}
          {farcasterUser ? (
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 pr-4 pl-1 py-1 rounded-full border border-gray-200 dark:border-gray-700">
               {farcasterUser.pfpUrl ? (
                 // eslint-disable-next-line @next/next/no-img-element
                 <img src={farcasterUser.pfpUrl} alt="User" className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900" />
               ) : (
                 <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
                    {farcasterUser.username?.charAt(0).toUpperCase()}
                 </div>
               )}
            </div>
          ) : (
            <ConnectButton showBalance={false} accountStatus="avatar" chainStatus="none" />
          )}
        </div>
      </nav>

      {/* === CONTENT AREA === */}
      <div className="flex-grow pt-4 px-4 max-w-lg mx-auto w-full">
        {activeTab === "create" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-2 mb-6 justify-center text-gray-800 dark:text-gray-200">
                <MdBallot className="text-3xl text-blue-600 dark:text-blue-500" />
                <h2 className="text-2xl font-bold">Create Quest</h2>
             </div>
             <CreateQuest onSuccess={() => setActiveTab("feed")} />
          </div>
        ) : activeTab === "profile" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <MyActivity />
          </div>
        ) : (
          // === TAB FEED ===
          <div className="flex flex-col gap-6">
             
             {/* === BANNER GRADIENT + ANIMASI TEKS LOOPING === */}
             <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                // Ganti gambar dengan Gradient Biru ke Putih (atau abu-abu gelap di dark mode)
                className="relative w-full h-40 rounded-3xl overflow-hidden shadow-2xl group bg-gradient-to-r from-blue-600 via-blue-400 to-white dark:to-gray-800"
             >
                {/* Elemen Dekorasi Lingkaran (Opsional, biar gradien lebih cantik) */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
                
                {/* Container Teks dengan Animasi LOOPING */}
                <div className="absolute inset-0 flex flex-col justify-center px-6">
                    <motion.div
                        // Animasi Naik Turun Terus Menerus
                        animate={{ y: [0, -6, 0] }}
                        transition={{ 
                            duration: 4,      // Durasi satu putaran
                            repeat: Infinity, // Ulangi selamanya
                            ease: "easeInOut" // Gerakan halus
                        }}
                    >
                        <h2 className="text-2xl font-black mb-2 drop-shadow-sm text-white flex items-center gap-2">
                           Start Voting <MdRocketLaunch className="text-yellow-300 animate-pulse" />
                        </h2>
                        <p className="text-sm font-bold text-blue-50 max-w-[240px] leading-relaxed drop-shadow-sm">
                           Decentralized polling on Base. <br/>
                           Your vote, your voice.
                        </p>
                    </motion.div>
                </div>
             </motion.div>
             
             {/* JUDUL FEED */}
             <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                 <div className="flex items-center gap-2 mb-4 px-1">
                    <div className="h-6 w-1 bg-blue-600 rounded-full"></div>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Latest Polls</h2>
                 </div>
                 <QuestList />
             </div>

          </div>
        )}
      </div>

      {/* === BOTTOM NAVIGATION === */}
      <div className="fixed bottom-0 w-full bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-around py-3 z-40 pb-6 max-w-lg mx-auto left-0 right-0 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.1)]">
        <button onClick={() => setActiveTab("feed")} className={`flex flex-col items-center gap-1 w-1/3 transition-all active:scale-90 ${activeTab === "feed" ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-600"}`}>
          <MdHomeFilled className="text-2xl" /><span className="text-[10px] font-bold">FEED</span>
        </button>
        <button onClick={() => setActiveTab("create")} className={`flex flex-col items-center gap-1 w-1/3 transition-all active:scale-90 ${activeTab === "create" ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-600"}`}>
          <MdAddCircle className="text-2xl" /><span className="text-[10px] font-bold">CREATE</span>
        </button>
        <button onClick={() => setActiveTab("profile")} className={`flex flex-col items-center gap-1 w-1/3 transition-all active:scale-90 ${activeTab === "profile" ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-600"}`}>
          <MdPerson className="text-2xl" /><span className="text-[10px] font-bold">PROFILE</span>
        </button>
      </div>
    </main>
  );
}