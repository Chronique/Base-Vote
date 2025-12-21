"use client";

import { useState, useMemo } from "react";
import { useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import SwipeCard from "./SwipeCard";
import CycleMeme from "./CycleMeme"; 
import { AnimatePresence, motion } from "framer-motion";
import { MdRefresh } from "react-icons/md";

export default function QuestList() {
  const [globalIndex, setGlobalIndex] = useState(0);
  const [isCycleActive, setIsCycleActive] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); 

  const { data: pollIds, isLoading, refetch } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollsPaged",
    args: [0n, 10n], 
    chainId: base.id
  });

  const allPollIds = useMemo(() => {
    if (!pollIds || !Array.isArray(pollIds)) return [];
    // Kontrak baru sudah mengurutkan Descending (ID 10, 9, 8...)
    return pollIds.map((id: any) => Number(id)); 
  }, [pollIds, refreshKey]); // Ikut berubah saat refreshKey berubah

  const handleRefresh = async () => {
    setIsCycleActive(false);
    setGlobalIndex(0);
    setRefreshKey(prev => prev + 1); // Reset visual kartu
    await refetch();
  };

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "right") {
      // Jika VOTE, langsung refresh otomatis seperti tombol aplikasi
      handleRefresh();
      return;
    }

    const nextIndex = globalIndex + 1;
    setGlobalIndex(nextIndex);

    if (nextIndex >= allPollIds.length) {
      setIsCycleActive(true);
    }
  };

  if (isLoading) return <div className="h-64 flex items-center justify-center text-gray-400 font-black animate-pulse uppercase text-[10px]">Syncing Base...</div>;

  return (
    <div className="relative w-full h-[400px] flex flex-col items-center justify-center">
      {/* Tombol Refresh Manual */}
      {!isCycleActive && (
        <button onClick={handleRefresh} className="absolute -top-12 right-4 p-2 text-gray-400 hover:text-blue-600 flex items-center gap-1 text-[10px] font-black uppercase transition-all z-20">
          <MdRefresh className="text-sm" /> Refresh
        </button>
      )}

      <div className="relative w-full h-80 flex items-center justify-center perspective-1000">
        <AnimatePresence mode="wait">
          {isCycleActive || allPollIds.length === 0 ? (
            <motion.div 
              key={`cycle-${refreshKey}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex items-center justify-center"
            >
              <CycleMeme onRefresh={handleRefresh} />
            </motion.div>
          ) : (
            <motion.div 
              key={`stack-${refreshKey}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              {[0, 1].map((offset) => {
                const cardIdx = globalIndex + offset;
                if (cardIdx >= allPollIds.length) return null;
                const pid = allPollIds[cardIdx];
                return (
                  <SwipeCard 
                    key={`${pid}-${refreshKey}`} 
                    pollId={pid} 
                    onSwipe={handleSwipe} 
                    index={offset} 
                  />
                );
              }).reverse()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}