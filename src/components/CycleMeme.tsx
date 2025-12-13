"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MdRefresh, MdLoop } from "react-icons/md";

export default function CycleMeme({ onRefresh }: { onRefresh: () => void }) {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleRefresh = () => {
    setIsSpinning(true);
    setTimeout(() => {
        onRefresh();
        setIsSpinning(false);
    }, 800);
  };

  return (
    // FIX UTAMA: Tambahkan 'w-full max-w-sm h-80' agar ukurannya KUNCI, tidak melebar
    <div className="relative w-full max-w-sm h-80 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center p-6 text-center overflow-hidden mx-auto">
      
      {/* Dekorasi Background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-100 dark:bg-pink-900/20 rounded-full blur-3xl translate-y-10 -translate-x-10"></div>

      {/* Konten Utama */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="relative z-10 flex flex-col items-center gap-4"
      >
        {/* Icon Cycle / Meme */}
        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center shadow-inner mb-2">
             <motion.div
                animate={{ rotate: isSpinning ? 360 : 0 }}
                transition={{ duration: 0.8, ease: "easeInOut", repeat: isSpinning ? Infinity : 0 }}
             >
                <MdLoop className="text-5xl text-blue-500" />
             </motion.div>
        </div>

        <div className="space-y-1">
            <h3 className="text-xl font-black text-gray-800 dark:text-white">
                You're all caught up!
            </h3>
            <p className="text-xs text-gray-400 font-medium max-w-[200px] mx-auto leading-relaxed">
                No more polls to vote on right now. <br/> Check back later!
            </p>
        </div>

        {/* Tombol Refresh */}
        <button 
            onClick={handleRefresh}
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-transform active:scale-95"
        >
            <MdRefresh className="text-xl" />
            Refresh Feed
        </button>
      </motion.div>

    </div>
  );
}