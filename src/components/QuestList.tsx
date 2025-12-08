"use client";

import { useState } from "react";
import { useReadContract } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS } from "~/app/constants";
import { AnimatePresence } from "framer-motion";
import SwipeCard from "./SwipeCard"; // Import SwipeCard (Bukan QuestCard)
import { MdRefresh } from "react-icons/md";

export default function QuestList() {
  // Ambil semua poll
  const { data: allPolls, isLoading, refetch, isRefetching } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getAllPolls",
  });

  // State untuk melacak kartu mana yang sedang tampil (Index)
  const [currentIndex, setCurrentIndex] = useState(0);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-40 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-xs text-gray-400 animate-pulse">Loading deck...</p>
    </div>
  );

  // Kita balik urutannya supaya yang terbaru muncul duluan
  const polls = (allPolls as string[] || []).slice().reverse();

  // Logika saat kartu digeser (Swipe)
  const handleSwipe = () => {
    // Geser ke index berikutnya setelah delay sedikit (biar animasi selesai)
    setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
    }, 200); 
  };

  // Jika kartu habis
  if (currentIndex >= polls.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-xl font-black text-gray-800 dark:text-white mb-2">You're all caught up!</h2>
        <p className="text-gray-400 text-sm mb-6">No more polls to vote on right now.</p>
        <button 
            onClick={() => { refetch(); setCurrentIndex(0); }} 
            className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-lg active:scale-95 transition-transform"
        >
            Refresh Feed
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-[65vh] w-full flex justify-center items-center mt-4">
      
      {/* Tombol Refresh Kecil di Pojok */}
      <div className="absolute -top-10 right-0 z-50">
        <button 
            onClick={() => refetch()} 
            className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors"
        >
            <MdRefresh className={`text-sm ${isRefetching ? "animate-spin" : ""}`} />
            {isRefetching ? "Updating..." : "Refresh"}
        </button>
      </div>

      <AnimatePresence>
        {/* Render Kartu Aktif & Kartu Belakangnya (Untuk efek tumpukan) */}
        {polls.slice(currentIndex, currentIndex + 2).map((pollAddress, i) => {
            // Index relatif terhadap tumpukan (0 = paling depan, 1 = belakangnya)
            // Karena slice, index selalu mulai dari 0 untuk array hasil slice.
            // Tapi kita butuh membedakan key-nya agar react tau itu beda.
            
            const isFront = i === 0; 
            
            return (
                <SwipeCard 
                    key={pollAddress} // Key address poll
                    address={pollAddress}
                    index={isFront ? 0 : 1} // 0 = Depan (Bisa Swipe), 1 = Belakang (Diam)
                    onSwipe={handleSwipe}
                />
            );
        }).reverse()} 
        {/* Reverse di sini penting agar kartu "Depan" (index 0) dirender TERAKHIR 
            di dalam DOM supaya berada di layer paling atas (z-index) */}
      </AnimatePresence>
    </div>
  );
}