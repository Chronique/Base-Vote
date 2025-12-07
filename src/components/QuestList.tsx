"use client";

import { useState } from "react";
import { useReadContract } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS } from "~/app/constants";
import SwipeCard from "./SwipeCard";
import QuestCard from "./QuestCard";
import { MdClose } from "react-icons/md";

export default function QuestList() {
  const { data: allPolls, isLoading } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getAllPolls",
  });

  // State untuk melacak kartu mana yang sedang dilihat
  const [currentIndex, setCurrentIndex] = useState(0);
  // State jika user swipe kanan -> Buka mode voting
  const [votingAddress, setVotingAddress] = useState<string | null>(null);

  if (isLoading) return <p className="text-center mt-20 animate-pulse">Loading Stack...</p>;
  if (!allPolls || allPolls.length === 0) return <p className="text-center mt-20 text-gray-400">No polls yet.</p>;

  // Ambil daftar poll yang belum diswipe
  // Kita reverse biar yang terbaru muncul duluan
  const polls = [...allPolls].reverse(); 
  
  // Jika sudah habis swipe semua
  if (currentIndex >= polls.length) {
    return (
      <div className="text-center mt-20">
        <h3 className="text-xl font-bold mb-2">You've seen it all! 🎉</h3>
        <button 
          onClick={() => setCurrentIndex(0)} 
          className="text-blue-600 font-bold underline"
        >
          Start Over
        </button>
      </div>
    );
  }

  // === JIKA LAGI MODE VOTING (SWIPE KANAN) ===
  if (votingAddress) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-2xl w-full max-w-md p-2 relative">
          <button 
            onClick={() => setVotingAddress(null)} // Tutup mode vote
            className="absolute top-[-40px] right-0 bg-white/20 p-2 rounded-full text-white hover:bg-white/40"
          >
            <MdClose className="text-2xl" />
          </button>
          
          {/* Tampilkan QuestCard Full (Vote Yes/No) */}
          <QuestCard address={votingAddress} />
        </div>
      </div>
    );
  }

  // === TAMPILAN TUMPUKAN KARTU (TINDER) ===
  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "right") {
      // Buka mode voting untuk kartu saat ini
      setVotingAddress(polls[currentIndex]);
    }
    // Lanjut ke kartu berikutnya (baik skip maupun vote)
    setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
    }, 200);
  };

  return (
    <div className="relative w-full h-[400px] flex justify-center items-center mt-4">
      {/* Render 2 Kartu Saja: Yang aktif & 1 di belakangnya (biar hemat performa) */}
      {polls.slice(currentIndex, currentIndex + 2).reverse().map((pollAddress, i) => {
        // Logika index: kalau i=1 berarti kartu paling atas (karena direverse slice-nya)
        // Kita butuh index relatif terhadap tumpukan visual
        const isTopCard = i === 1 || (polls.slice(currentIndex, currentIndex + 2).length === 1);
        
        return (
            <SwipeCard 
                key={pollAddress} 
                address={pollAddress} 
                index={isTopCard ? 0 : 1}
                onSwipe={handleSwipe}
            />
        );
      })}
    </div>
  );
}