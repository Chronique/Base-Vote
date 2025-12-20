"use client";

import { useState, useMemo } from "react";
import { useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import SwipeCard from "./SwipeCard";
import CycleMeme from "./CycleMeme"; 
import { AnimatePresence } from "framer-motion";
import { MdRefresh, MdWarning } from "react-icons/md";

export default function QuestList() {
  const [globalIndex, setGlobalIndex] = useState(0);

  const { 
    data: pollIds, 
    isLoading, 
    error, // Ambil objek error
    isError, 
    refetch 
  } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollsPaged",
    args: [0n, 50n],
    chainId: base.id 
  });

  const allPollIds = useMemo(() => {
    if (!pollIds || !Array.isArray(pollIds)) return [];
    return [...pollIds].reverse().map(id => Number(id)); 
  }, [pollIds]);

  const handleRefresh = async () => {
    await refetch();
    setGlobalIndex(0);
  };

  const handleSwipe = () => setGlobalIndex(prev => prev + 1);

  // TAMPILAN JIKA ERROR (Sangat penting untuk debug)
  if (isError) return (
    <div className="h-64 flex flex-col items-center justify-center p-6 text-center">
      <MdWarning className="text-red-500 text-3xl mb-2" />
      <p className="text-red-600 font-black text-[10px] uppercase">Failed to load deck</p>
      <code className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-[8px] text-red-500 max-w-xs break-all">
        {error?.message || "Unknown Blockchain Error"}
      </code>
      <button onClick={handleRefresh} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase">
        Retry Sync
      </button>
    </div>
  );

  if (isLoading) return (
    <div className="h-64 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 font-black uppercase text-[10px] animate-pulse">Syncing with Base...</p>
    </div>
  );

  return (
    <div className="relative w-full h-[400px] flex flex-col items-center justify-center">
      <button onClick={handleRefresh} className="absolute -top-12 right-4 p-2 text-gray-400 hover:text-blue-600 flex items-center gap-1 text-[10px] font-black uppercase">
        <MdRefresh /> Refresh
      </button>

      <div className="relative w-full h-80 flex items-center justify-center perspective-1000">
        <AnimatePresence mode="popLayout">
          {/* Jika data kosong (0 poll), tampilkan CycleMeme */}
          {(allPollIds.length === 0 || globalIndex >= allPollIds.length) ? (
            <CycleMeme key="cycle" onRefresh={handleRefresh} />
          ) : (
            [0, 1].map((offset) => {
              const cardIdx = globalIndex + offset;
              if (cardIdx >= allPollIds.length) return null;
              const pid = allPollIds[cardIdx];
              return <SwipeCard key={pid} pollId={pid} onSwipe={handleSwipe} index={offset} />;
            }).reverse()
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}