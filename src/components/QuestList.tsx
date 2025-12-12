"use client";

import { useState, useMemo } from "react";
import { useReadContract } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS } from "~/app/constants";
import { AnimatePresence } from "framer-motion";
import SwipeCard from "./SwipeCard";
import CycleMeme from "./CycleMeme"; 

const BATCH_SIZE = 10; // Batas jumlah kartu per sesi

export default function QuestList() {
  // 1. Ambil SEMUA data poll (misal ada 50 poll)
  const { data: allPollsData, isLoading, refetch } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getAllPolls",
  });

  const [page, setPage] = useState(0);         // Halaman saat ini (0, 1, 2...)
  const [currentIndex, setCurrentIndex] = useState(0); // Indeks kartu dalam batch (0 sampai 9)

  // 2. Olah data: Reverse biar yang baru di depan
  const allPolls = useMemo(() => {
    return (allPollsData as string[] || []).slice().reverse();
  }, [allPollsData]);

  // 3. Potong data berdasarkan Page (Logic Pagination)
  // Page 0: ambil index 0-10
  // Page 1: ambil index 10-20
  const currentBatch = useMemo(() => {
    const start = page * BATCH_SIZE;
    const end = start + BATCH_SIZE;
    return allPolls.slice(start, end);
  }, [allPolls, page]);

  const handleSwipe = () => {
    setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
    }, 200); 
  };

  // Logic saat CycleMeme selesai (Tombol LFG ditekan)
  const handleCycleComplete = () => {
    const nextStart = (page + 1) * BATCH_SIZE;
    
    // Cek apakah masih ada poll tersisa di halaman berikutnya?
    if (nextStart < allPolls.length) {
        // Lanjut ke 10 kartu berikutnya
        setPage((prev) => prev + 1);
        setCurrentIndex(0); 
    } else {
        // Data habis total! Reset ke awal & Refetch buat cek poll baru
        refetch();
        setPage(0);
        setCurrentIndex(0);
    }
  };

  // TAMPILAN LOADING (Awal Buka)
  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-40 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-xs text-gray-400 animate-pulse">Loading deck...</p>
    </div>
  );

  // KONDISI 1: JIKA KARTU DALAM BATCH HABIS -> TAMPILKAN CYCLE MEME
  // User harus mainkan meme dulu sebelum lanjut ke batch berikutnya
  if (currentIndex >= currentBatch.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[65vh] w-full px-6">
        <CycleMeme onRefresh={handleCycleComplete} />
        
        {/* Info kecil buat user */}
        <p className="text-[10px] text-gray-400 mt-8 animate-pulse">
           {((page + 1) * BATCH_SIZE) >= allPolls.length ? "You've seen all polls! Looping back..." : "Complete the cycle to load more..."}
        </p>
      </div>
    );
  }

  // KONDISI 2: TAMPILKAN KARTU (Hanya render 2 kartu teratas dari batch 10)
  return (
    <div className="relative h-[65vh] w-full flex justify-center items-center mt-4">
      <AnimatePresence>
        {currentBatch.slice(currentIndex, currentIndex + 2).map((pollAddress, i) => {
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
      
      {/* Indikator Sisa Kartu dalam Batch ini */}
      <div className="absolute top-0 right-4 text-[10px] font-bold text-gray-300 dark:text-gray-700">
        {currentIndex + 1} / {currentBatch.length}
      </div>
    </div>
  );
}