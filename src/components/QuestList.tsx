"use client";

import { useState, useMemo } from "react";
import { useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import SwipeCard from "./SwipeCard";
import CycleMeme from "./CycleMeme"; 
import { AnimatePresence } from "framer-motion";
import { MdRefresh } from "react-icons/md";

export default function QuestList() {
  const [globalIndex, setGlobalIndex] = useState(0);

  // Ambil hanya 10 kartu sesuai permintaan agar ringan
  const { data: pollIds, isLoading, refetch } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollsPaged",
    args: [0n, 10n], 
    chainId: base.id
  });

  const allPollIds = useMemo(() => {
    if (!pollIds || !Array.isArray(pollIds)) return [];
    // 1. Filter ID 0 (padding dari kontrak)
    // 2. Reverse agar ID terbesar (terbaru) di index 0 (paling atas)
    // 3. ID 1 akan berakhir di index terakhir (paling bawah)
    return pollIds
      .filter((id: any) => id !== 0n)
      .map((id: any) => Number(id))
      .reverse(); 
  }, [pollIds]);

  const handleRefresh = async () => {
    await refetch();
    setGlobalIndex(0);
  };

  const handleSwipe = () => setGlobalIndex(prev => prev + 1);

  if (isLoading) return <div className="h-64 flex items-center justify-center text-gray-400 font-black animate-pulse uppercase text-[10px]">Syncing Base...</div>;

  return (
    <div className="relative w-full h-[400px] flex flex-col items-center justify-center">
      <button onClick={handleRefresh} className="absolute -top-12 right-4 p-2 text-gray-400 hover:text-blue-600 flex items-center gap-1 text-[10px] font-black uppercase">
        <MdRefresh /> Refresh
      </button>

      <div className="relative w-full h-80 flex items-center justify-center perspective-1000">
        <AnimatePresence mode="popLayout">
          {allPollIds.length === 0 || globalIndex >= allPollIds.length ? (
            <CycleMeme key="cycle" onRefresh={handleRefresh} />
          ) : (
            // Hanya render 2 kartu teratas untuk performa
            [0, 1].map((offset) => {
              const cardIdx = globalIndex + offset;
              if (cardIdx >= allPollIds.length) return null;
              const pid = allPollIds[cardIdx];
              return (
                <SwipeCard 
                  key={pid} // Gunakan PID murni sebagai key
                  pollId={pid} 
                  onSwipe={handleSwipe} 
                  index={offset} 
                />
              );
            }).reverse() // Reverse di sini agar offset 0 berada di atas offset 1 secara visual
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}