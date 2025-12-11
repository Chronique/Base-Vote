"use client";

import { useState } from "react"; // Tambah useState untuk state konfirmasi
import { useReadContract, useWriteContract, useAccount } from "wagmi";
import { POLL_ABI } from "~/app/constants";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { MdHowToVote, MdArrowBack, MdArrowForward, MdCheckCircle, MdThumbUp } from "react-icons/md";
import { useTheme } from "next-themes"; 

interface Props {
  address: string;
  onSwipe: (direction: "left" | "right") => void;
  index: number;
}

export default function SwipeCard({ address, onSwipe, index }: Props) {
  const { resolvedTheme } = useTheme();
  
  // === STATE BARU: KONFIRMASI ===
  // null = belum swipe
  // 1 = swipe kanan (vote yes) menunggu konfirmasi
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

  // Animasi Framer Motion
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  const bgLight = useTransform(x, [-200, 0, 200], ["#fee2e2", "#ffffff", "#dbeafe"]);
  const bgDark = useTransform(x, [-200, 0, 200], ["#450a0a", "#1f2937", "#172554"]);
  const activeBg = resolvedTheme === "dark" ? bgDark : bgLight;

  if (!pollData) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [question, opt1, count1, , count2] = pollData as any;
  const total = Number(count1) + Number(count2);
  const scale = index === 0 ? 1 : 0.95;
  const y = index === 0 ? 0 : 10;
  const userHasVoted = Boolean(hasVoted);

  // === FUNGSI EKSEKUSI VOTE SETELAH KLIK TOMBOL ===
  const handleConfirmVote = () => {
    if (!confirmChoice) return;

    // INI YANG MEMANGGIL WALLET
    writeContract({
        address: address as `0x${string}`,
        abi: POLL_ABI,
        functionName: "vote",
        args: [confirmChoice], 
    });

    // Geser kartu setelah user klik konfirmasi
    onSwipe("right");
    setConfirmChoice(null);
  };

  return (
    <motion.div
      style={{ x, rotate, opacity, scale, y, backgroundColor: activeBg }}
      drag={index === 0 && !confirmChoice ? "x" : false} // Kunci kartu kalau lagi mode konfirmasi
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, info) => {
        // === SAAT GESER KANAN ===
        if (info.offset.x > 100) {
            if (isLoadingVote) return;

            if (userHasVoted) {
                alert("⚠️ You already voted!");
                onSwipe("right");
            } else {
                // JANGAN TRANSAKSI! TAPI BUKA MENU KONFIRMASI
                setConfirmChoice(1); // Set ke mode konfirmasi opsi 1
            }
        } 
        // === SAAT GESER KIRI (SKIP) ===
        else if (info.offset.x < -100) {
            onSwipe("left");
        }
      }}
      className={`absolute w-full max-w-sm h-80 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-6 text-center z-${10 - index} overflow-hidden`}
    >
      
      {/* === LAYER POP-UP KONFIRMASI (Muncul setelah geser kanan) === */}
      {confirmChoice === 1 && (
        <div className="absolute inset-0 z-50 bg-white/95 dark:bg-gray-900/95 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                <MdThumbUp className="text-3xl" />
            </div>
            
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Confirm Vote</h3>
            <p className="text-xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                "{opt1}"
            </p>

            <div className="flex flex-col gap-3 w-full">
                {/* Tombol INI yang akan memanggil Wallet */}
                <button 
                    onClick={handleConfirmVote}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    Sign & Vote <MdCheckCircle />
                </button>

                {/* Tombol Batal / Kembali */}
                <button 
                    onClick={() => {
                        setConfirmChoice(null); // Tutup konfirmasi
                        x.set(0); // Balikin kartu ke tengah
                    }}
                    className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                    Cancel
                </button>
            </div>
        </div>
      )}

      {/* === TAMPILAN KARTU BIASA === */}
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
            <MdArrowBack /> SKIP
        </div>
        <div className={`flex items-center gap-1 font-black text-xs tracking-widest ${userHasVoted ? 'text-gray-400' : 'text-blue-500/80 dark:text-blue-400/80'}`}>
            {userHasVoted ? "ALREADY VOTED" : "SWIPE TO VOTE"} <MdArrowForward />
        </div>
      </div>

    </motion.div>
  );
}