"use client";

import { useState, useMemo } from "react";
import { useReadContract } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS } from "~/app/constants";
import { AnimatePresence } from "framer-motion";
import SwipeCard from "./SwipeCard";
import CycleMeme from "./CycleMeme"; 

export default function QuestList() {
  // Tambahkan staleTime juga di sini biar listnya gak reload melulu
  const { data: allPolls, isLoading, refetch } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getAllPolls",
    query: { staleTime: 1000 * 60 * 5 }
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  // Memoize polls agar tidak direcompute setiap render
  const polls = useMemo(() => {
    return (allPolls as string[] || []).slice().reverse();
  }, [allPolls]);

  // TAMPILAN LOADING
  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-40 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-xs text-gray-400 animate-pulse">Loading deck...</p>
    </div>
  );

  const handleSwipe = () => {
    // Delay sedikit agar animasi "terbang" selesai sebelum state diupdate
    setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
    }, 200); 
  };

  // JIKA KARTU HABIS (Cycle Meme)
  if (currentIndex >= polls.length && polls.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[65vh] w-full px-6">
        <CycleMeme 
            onRefresh={() => { 
                refetch(); 
                setCurrentIndex(0); 
            }} 
        />
      </div>
    );
  }

  // JIKA DATA KOSONG (Belum ada poll sama sekali)
  if (polls.length === 0) {
     return (
        <div className="flex flex-col items-center justify-center h-[65vh] text-center px-6">
            <p className="text-gray-500">No polls available yet.</p>
            <button onClick={() => refetch()} className="text-blue-500 text-sm mt-2">Refresh</button>
        </div>
     );
  }

  return (
    <div className="relative h-[65vh] w-full flex justify-center items-center mt-4">
      <AnimatePresence>
        {/* Render hanya 2 kartu: Current dan Next. 
            Kartu ketiga dst tidak perlu dirender agar ringan. */}
        {polls.slice(currentIndex, currentIndex + 2).map((pollAddress, i) => {
            const isFront = i === 0; 
            return (
                <SwipeCard 
                    key={pollAddress}
                    address={pollAddress}
                    index={isFront ? 0 : 1}
                    onSwipe={handleSwipe}
                />
            );
        }).reverse()} 
      </AnimatePresence>
    </div>
  );
}