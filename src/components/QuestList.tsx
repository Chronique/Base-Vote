"use client";

import { useState, useMemo, useEffect } from "react";
import { useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import SwipeCard from "./SwipeCard";
import CycleMeme from "./CycleMeme"; 
import { AnimatePresence, motion } from "framer-motion";

export default function QuestList({ initialMeme = false }: { initialMeme?: boolean }) {
  const [globalIndex, setGlobalIndex] = useState(0);
  const [isCycleActive, setIsCycleActive] = useState(initialMeme);

  // Mengambil data poll (di sini saya set 120 sesuai permintaan "unlimited" Anda)
  const { data: pollIds, isLoading } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollsPaged",
    args: [0n, 120n], 
    chainId: base.id
  });

  const allPollIds = useMemo(() => {
    if (!pollIds || !Array.isArray(pollIds)) return [];
    return pollIds.map(id => Number(id)); 
  }, [pollIds]);

  useEffect(() => {
    if (initialMeme) setIsCycleActive(true);
  }, [initialMeme]);

  /**
   * Fungsi untuk melanjutkan setelah CycleMeme selesai
   * Jika masih ada kartu tersisa, lanjut tampilkan kartu.
   * Jika kartu sudah habis, baru lakukan reload.
   */
  const handleContinue = () => {
    if (globalIndex >= allPollIds.length) {
      window.location.reload();
    } else {
      setIsCycleActive(false);
    }
  };

  const handleSwipe = (direction: "left" | "right") => {
    const nextIndex = globalIndex + 1;

    if (direction === "right") {
      // VOTE Berhasil -> Update index dan tampilkan meme
      setGlobalIndex(nextIndex);
      setIsCycleActive(true);
    } else {
      // LOGIKA SKIP / CANCEL
      setGlobalIndex(nextIndex);
      
      // Cek apakah sudah mencapai kelipatan 10 kartu
      if (nextIndex > 0 && nextIndex % 10 === 0) {
        setIsCycleActive(true);
      } 
      // Cek apakah kartu sudah habis di daftar
      else if (nextIndex >= allPollIds.length) {
        setIsCycleActive(true);
      }
    }
  };

  if (isLoading) return (
    <div className="h-64 flex items-center justify-center text-gray-400 font-black animate-pulse uppercase text-[10px]">
      Syncing Base...
    </div>
  );

  return (
    <div className="relative w-full h-[400px] flex flex-col items-center justify-center">
      <div className="relative w-full h-80 flex items-center justify-center perspective-1000">
        <AnimatePresence mode="wait">
          {isCycleActive || allPollIds.length === 0 ? (
            <motion.div 
              key="meme-screen"
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className="w-full h-full flex items-center justify-center"
            >
              <CycleMeme onRefresh={handleContinue} />
            </motion.div>
          ) : (
            <motion.div 
              key={`stack-${globalIndex}`} 
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
                    key={pid} 
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