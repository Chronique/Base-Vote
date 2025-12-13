"use client";

import { useState, useEffect, useCallback } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import CreateQuest from "~/components/CreateQuest";
import QuestList from "~/components/QuestList";
import MyActivity from "~/components/MyActivity"; 
import { sdk } from "@farcaster/miniapp-sdk"; 
import { useConnect, useAccount } from "wagmi"; 
// Import Framer Motion
import { motion } from "framer-motion"; 
import { MdHomeFilled, MdAddCircle, MdPerson, MdHowToVote, MdBallot, MdAddToHomeScreen, MdShare } from "react-icons/md";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"feed" | "create" | "profile">("feed");
  const [farcasterUser, setFarcasterUser] = useState<{ pfpUrl?: string; username?: string } | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();

  const initializeFarcaster = useCallback(async () => {
    try {
      const context = await sdk.context;
      
      if (context?.client?.added) {
        setIsAdded(true);
      }

      if (context?.user) {
        setFarcasterUser({
          pfpUrl: context.user.pfpUrl,
          username: context.user.username,
        });
      }

      await sdk.actions.ready();

      if (!isConnected) {
        const farcasterConnector = connectors.find((c) => c.id === "farcasterFrame");
        if (farcasterConnector) {
          connect({ connector: farcasterConnector });
        }
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
      
      {/* === HEADER DENGAN ANIMASI === */}
      <nav className="w-full bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex justify-between items-center sticky top-0 z-50 transition-colors">
        
        <div className="flex items-center gap-3">
            {/* 1. Animasi LOGO (Pop + Rotate) */}
            <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20,
                    duration: 0.5 
                }}
                className="relative w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20"
            >
                {/* Efek Glow Berdenyut */}
                <motion.div 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-blue-400 blur-md opacity-50 rounded-lg"
                />
                <MdHowToVote className="text-white text-2xl relative z-10" />
            </motion.div>

            {/* 2. Animasi TEKS (Slide In dari Kiri) */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex flex-col"
            >
                <h1 className="font-black text-xl leading-none tracking-tighter text-gray-900 dark:text-white">
                    BASE <span className="text-blue-600">VOTE</span>
                </h1>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase">
                    Create polls and vote
                </p>
            </motion.div>
        </div>

        {/* BAGIAN KANAN (Tombol Share, Add, Profile) */}
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center gap-2"
        >
          {/* TOMBOL SHARE */}
          <button 
              onClick={handleShare}
              className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors"
          >
              <MdShare className="text-xl" />
          </button>

          {!isAdded && (
            <button 
                onClick={handleAddApp}
                className="p-2 bg-gray-100 dark:bg-gray-800 text-blue-600 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors"
            >
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
               <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                 @{farcasterUser.username}
               </span>
            </div>
          ) : (
            <ConnectButton showBalance={false} accountStatus="avatar" chainStatus="none" />
          )}
        </motion.div>
      </nav>

      {/* CONTENT AREA */}
      <div className="flex-grow pt-6 px-4 max-w-lg mx-auto w-full">
        {activeTab === "create" ? (
          <div className="animate-in fade-in slide-in-from-bottom-2">
             <div className="flex items-center gap-2 mb-6 justify-center text-gray-800 dark:text-gray-200">
                <MdBallot className="text-3xl text-blue-600 dark:text-blue-500" />
                <h2 className="text-2xl font-bold">Create New Poll</h2>
             </div>
             <CreateQuest onSuccess={() => setActiveTab("feed")} />
          </div>
        ) : activeTab === "profile" ? (
          <div className="animate-in fade-in slide-in-from-bottom-2"><MyActivity /></div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2">
             {/* HEADER FEED JUGA DIKASIH ANIMASI DIKIT */}
             <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2 mb-4 text-gray-800 dark:text-gray-200"
             >
                <MdHomeFilled className="text-2xl text-blue-600 dark:text-blue-500" />
                <h2 className="text-xl font-bold">Latest Polls</h2>
             </motion.div>
             <QuestList />
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 w-full bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-around py-3 z-40 pb-6 max-w-lg mx-auto left-0 right-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors">
        <button onClick={() => setActiveTab("feed")} className={`flex flex-col items-center gap-1 w-1/3 transition-colors ${activeTab === "feed" ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400"}`}>
          <MdHomeFilled className="text-2xl" /><span className="text-[10px] font-bold tracking-wide">FEED</span>
        </button>
        <button onClick={() => setActiveTab("create")} className={`flex flex-col items-center gap-1 w-1/3 transition-colors ${activeTab === "create" ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400"}`}>
          <MdAddCircle className="text-2xl" /><span className="text-[10px] font-bold tracking-wide">CREATE</span>
        </button>
        <button onClick={() => setActiveTab("profile")} className={`flex flex-col items-center gap-1 w-1/3 transition-colors ${activeTab === "profile" ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400"}`}>
          <MdPerson className="text-2xl" /><span className="text-[10px] font-bold tracking-wide">PROFILE</span>
        </button>
      </div>
    </main>
  );
}