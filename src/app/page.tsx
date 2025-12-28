"use client";

import { useState, useEffect, useCallback } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import CreateQuest from "~/components/CreateQuest";
import QuestList from "~/components/QuestList";
import MyActivity from "~/components/MyActivity"; 
import ProductTour from "~/components/ProductTour"; // Import Komponen Baru
import { sdk } from "@farcaster/miniapp-sdk"; 
import { useConnect, useAccount } from "wagmi"; 
import { motion, AnimatePresence } from "framer-motion"; 
import { MdHomeFilled, MdAddCircle, MdPerson, MdHowToVote, MdBallot, MdAddToHomeScreen, MdShare } from "react-icons/md";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"feed" | "create" | "profile">("feed");
  const [farcasterUser, setFarcasterUser] = useState<{ pfpUrl?: string; username?: string } | null>(null);
  const [isAdded, setIsAdded] = useState(false);
  const [forceMeme, setForceMeme] = useState(false);
  
  // State untuk Product Tour
  const [showTour, setShowTour] = useState(false);

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
    // Cek LocalStorage untuk Product Tour
    const hasSeenTour = localStorage.getItem("base_vote_tour_v1");
    if (!hasSeenTour) {
      setShowTour(true);
    }
    initializeFarcaster();
  }, [initializeFarcaster]);

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem("base_vote_tour_v1", "true");
  };

  const handleShare = () => {
    const appUrl = "https://base-vote-alpha.vercel.app"; 
    const text = "Voting on Base, create polls and vote 🔵\n\nCreate your poll or vote now 👇";
    const encodedText = encodeURIComponent(text);
    const encodedEmbed = encodeURIComponent(appUrl);
    sdk.actions.openUrl(`https://warpcast.com/~/compose?text=${encodedText}&embeds[]=${encodedEmbed}`);
  };

  return (
    <main className="h-[100dvh] w-full bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans flex flex-col fixed inset-0 overflow-hidden transition-colors duration-300">
      
      {/* Product Tour Overlay */}
      <AnimatePresence>
        {showTour && <ProductTour onComplete={handleTourComplete} />}
      </AnimatePresence>

      <nav className="flex-none w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
            <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20"
            >
                <MdHowToVote className="text-white text-2xl" />
            </motion.div>
            <div className="flex flex-col">
                <h1 className="font-black text-xl leading-none tracking-tighter text-gray-900 dark:text-white">
                    BASE <span className="text-blue-600">VOTE</span>
                </h1>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase">Onchain Polling</p>
            </div>
        </div>

        <div className="flex items-center gap-2">
          {farcasterUser ? (
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 pr-4 pl-1 py-1 rounded-full border border-gray-200 dark:border-gray-700">
               {farcasterUser.pfpUrl ? (
                 <img src={farcasterUser.pfpUrl} alt="User" className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900" />
               ) : (
                 <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">{farcasterUser.username?.charAt(0).toUpperCase()}</div>
               )}
               <span className="text-[10px] font-bold">@{farcasterUser.username}</span>
            </div>
          ) : (
            <ConnectButton showBalance={false} accountStatus="avatar" chainStatus="none" />
          )}
        </div>
      </nav>

      <div className="flex-1 relative w-full max-w-lg mx-auto overflow-hidden">
        <div className={`absolute inset-0 px-4 pt-4 pb-24 ${activeTab === 'profile' ? 'overflow-y-auto' : 'overflow-hidden'}`}>
            
            {activeTab === "create" ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 mb-6 justify-center text-gray-800 dark:text-gray-200">
                      <MdBallot className="text-3xl text-blue-600 dark:text-blue-500" />
                      <h2 className="text-2xl font-bold">Create Poll</h2>
                  </div>
                  <CreateQuest onSuccess={() => { 
                      setForceMeme(true); 
                      setActiveTab("feed"); 
                  }} />
              </div>
            ) : activeTab === "profile" ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><MyActivity /></div>
            ) : (
              <div className="flex flex-col h-full">
                  <div className="flex-none relative w-full h-28 rounded-3xl overflow-hidden shadow-xl group bg-gradient-to-r from-blue-600 to-blue-400 dark:to-gray-800 mb-4 flex items-center px-6 gap-4">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
                      <div className="relative z-10 flex flex-col justify-center overflow-hidden h-full py-2">
                          <h2 className="text-2xl font-black text-white drop-shadow-md leading-tight">Start Voting</h2>
                          <p className="text-xs font-bold text-blue-100 opacity-90 mt-1">Your voice onchain.</p>
                      </div>
                  </div>
                  <div className="flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2 px-1 flex-none">
                          <div className="h-6 w-1 bg-blue-600 rounded-full"></div>
                          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Latest Polls</h2>
                      </div>
                      <div className="flex-1 flex items-center justify-center -mt-4">
                          <QuestList initialMeme={forceMeme} />
                      </div>
                  </div>
              </div>
            )}
        </div>
      </div>

      <div className="flex-none w-full bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-around py-3 z-50 pb-6 max-w-lg mx-auto">
        <button onClick={() => { setForceMeme(false); setActiveTab("feed"); }} className={`flex flex-col items-center gap-1 w-1/3 transition-all ${activeTab === "feed" ? "text-blue-600" : "text-gray-400"}`}><MdHomeFilled className="text-2xl" /><span className="text-[10px] font-bold">FEED</span></button>
        <button onClick={() => setActiveTab("create")} className={`flex flex-col items-center gap-1 w-1/3 transition-all ${activeTab === "create" ? "text-blue-600" : "text-gray-400"}`}><MdAddCircle className="text-2xl" /><span className="text-[10px] font-bold">CREATE</span></button>
        <button onClick={() => setActiveTab("profile")} className={`flex flex-col items-center gap-1 w-1/3 transition-all ${activeTab === "profile" ? "text-blue-600" : "text-gray-400"}`}><MdPerson className="text-2xl" /><span className="text-[10px] font-bold">PROFILE</span></button>
      </div>
    </main>
  );
}