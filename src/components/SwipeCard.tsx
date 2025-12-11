"use client";

import { useState } from "react";
import { useReadContract, useWriteContract, useAccount } from "wagmi";
import { POLL_ABI } from "~/app/constants";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { MdHowToVote, MdArrowBack, MdArrowForward, MdCheckCircle, MdThumbUp, MdTouchApp } from "react-icons/md";
import { useTheme } from "next-themes"; 

interface Props {
  address: string;
  onSwipe: (direction: "left" | "right") => void;
  index: number;
}

export default function SwipeCard({ address, onSwipe, index }: Props) {
  const { resolvedTheme } = useTheme();
  
  // === STATE MANAGEMENT ===
  // 1. Apakah Menu Pilihan (Option 1 vs 2) sedang terbuka?
  const [showSelection, setShowSelection] = useState(false);
  
  // 2. Opsi mana yang dipilih untuk dikonfirmasi? (1 atau 2)
  const [confirmChoice, setConfirmChoice] = useState<number | null>(null);

  const { address: userAddress } = useAccount();
  const { writeContract } = useWriteContract();

  const { data: pollData } = useReadContract({
    address: address as `0x${string}`,
    abi: POLL_ABI,
    functionName: "getPollInfo",
  });

  const { data: hasVoted, isLoading: isLoadingVote } = useReadContract({
    address: address as `0x${string}`,
    abi: POLL_ABI,
    functionName: "hasVoted",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress }
  });

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  const bgLight = useTransform(x, [-200, 0, 200], ["#fee2e2", "#ffffff", "#dbeafe"]);
  const bgDark = useTransform(x, [-200, 0, 200], ["#450a0a", "#1f2937", "#172554"]);
  const activeBg = resolvedTheme === "dark" ? bgDark : bgLight;

  if (!pollData) return null;

  // Destructure Data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [question, opt1, count1, opt2, count2] = pollData as any;
  const total = Number(count1) + Number(count2);
  const scale = index === 0 ? 1 : 0.95;
  const y = index === 0 ? 0 : 10;
  const userHasVoted = Boolean(hasVoted);

  // === STEP 3: EKSEKUSI TRANSAKSI ===
  const handleFinalVote = () => {
    if (!confirmChoice) return;

    writeContract({
        address: address as `0x${string}`,
        abi: POLL_ABI,
        functionName: "vote",
        args: [confirmChoice], 
    });

    onSwipe("right");
    setConfirmChoice(null);
    setShowSelection(false);
  };

  // Helper: Ambil nama opsi yang dipilih
  const selectedOptionName = confirmChoice === 1 ? opt1 : opt2;

  return (
    <motion.div
      style={{ x, rotate, opacity, scale, y, backgroundColor: activeBg }}
      // Disable drag kalau lagi buka menu pilihan atau konfirmasi
      drag={index === 0 && !showSelection && !confirmChoice ? "x" : false} 
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, info) => {
        // === SWIPE KANAN ===
        if (info.offset.x > 100) {
            if (isLoadingVote) return;

            if (userHasVoted) {
                alert("⚠️ You already voted!");
                onSwipe("right");
            } else {
                // BUKA MENU PILIHAN (STEP 1)
                setShowSelection(true);
            }
        } 
        // === SWIPE KIRI ===
        else if (info.offset.x < -100) {
            onSwipe("left");
        }
      }}
      className={`absolute w-full max-w-sm h-80 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-6 text-center z-${10 - index} overflow-hidden`}
    >
      
      {/* === LAYER 1: MENU PILIH OPSI (Muncul setelah swipe) === */}
      {showSelection && !confirmChoice && (
        <div className="absolute inset-0 z-40 bg-white/95 dark:bg-gray-900/95 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
             <div className="mb-4 text-blue-600 dark:text-blue-400">
                <MdTouchApp className="text-4xl" />
             </div>
             <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-4">Choose an Option</h3>
             
             <div className="flex flex-col gap-3 w-full">
                {/* PILIHAN 1 */}
                <button 
                    onClick={() => setConfirmChoice(1)} // Lanjut ke Step 2
                    className="w-full py-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold rounded-xl hover:scale-[1.02] transition-transform"
                >
                    {opt1}
                </button>

                {/* PILIHAN 2 */}
                <button 
                    onClick={() => setConfirmChoice(2)} // Lanjut ke Step 2
                    className="w-full py-4 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300 font-bold rounded-xl hover:scale-[1.02] transition-transform"
                >
                    {opt2}
                </button>

                {/* BATAL */}
                <button 
                    onClick={() => { setShowSelection(false); x.set(0); }}
                    className="mt-2 text-sm text-gray-400 underline"
                >
                    Cancel
                </button>
             </div>
        </div>
      )}

      {/* === LAYER 2: KONFIRMASI AKHIR (Muncul setelah pilih opsi) === */}
      {confirmChoice && (
        <div className="absolute inset-0 z-50 bg-white/95 dark:bg-gray-900/95 flex flex-col items-center justify-center p-6 animate-in slide-in-from-right-10 duration-200">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                <MdThumbUp className="text-3xl" />
            </div>
            
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">You are voting for</h3>
            <p className="text-xl font-black text-gray-900 dark:text-white mb-6 leading-tight px-4 border-l-4 border-blue-500">
                "{selectedOptionName}"
            </p>

            <div className="flex flex-col gap-3 w-full">
                {/* TOMBOL SIGN TRANSAKSI */}
                <button 
                    onClick={handleFinalVote}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    Sign & Vote <MdCheckCircle />
                </button>

                {/* TOMBOL KEMBALI KE PILIHAN */}
                <button 
                    onClick={() => setConfirmChoice(null)}
                    className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-xl"
                >
                    Back
                </button>
            </div>
        </div>
      )}

      {/* === TAMPILAN KARTU UTAMA === */}
      <div className={`mb-4 p-4 rounded-full ${userHasVoted ? 'bg-green-100 text-green-600' : 'bg-gray-50 dark:bg-gray-800 text-blue-500'}`}>
        {userHasVoted ? <MdCheckCircle className="text-4xl" /> : <MdHowToVote className="text-4xl" />}
      </div>

      <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-2 leading-tight">
        {question}
      </h3>

      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mt-2">
        {total} people voted {userHasVoted && <span className="text-green-500 font-bold ml-1">(You Voted)</span>}
      </p>

      {/* INDIKATOR SWIPE */}
      <div className="absolute bottom-6 flex justify-between w-full px-8">
        <div className="flex items-center gap-1 text-red-400/80 dark:text-red-500/80 font-black text-xs tracking-widest">
            <MdArrowBack /> NO (SKIP)
        </div>
        <div className={`flex items-center gap-1 font-black text-xs tracking-widest ${userHasVoted ? 'text-gray-400' : 'text-blue-500/80 dark:text-blue-400/80'}`}>
            {userHasVoted ? "ALREADY VOTED" : "YES (VOTE)"} <MdArrowForward />
        </div>
      </div>

    </motion.div>
  );
}