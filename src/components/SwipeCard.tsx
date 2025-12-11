"use client";

import { useReadContract, useWriteContract, useAccount } from "wagmi";
import { POLL_ABI } from "~/app/constants";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { MdHowToVote, MdArrowBack, MdArrowForward, MdCheckCircle } from "react-icons/md";
import { useTheme } from "next-themes"; 

interface Props {
  address: string;
  onSwipe: (direction: "left" | "right") => void;
  index: number;
}

export default function SwipeCard({ address, onSwipe, index }: Props) {
  const { resolvedTheme } = useTheme();
  
  // 1. AMBIL ADDRESS USER
  const { address: userAddress } = useAccount();

  // 2. WRITE CONTRACT (Wallet)
  const { writeContract } = useWriteContract();

  // 3. READ POLL DATA
  const { data: pollData } = useReadContract({
    address: address as `0x${string}`,
    abi: POLL_ABI,
    functionName: "getPollInfo",
  });

  // 4. CEK STATUS: APAKAH SUDAH VOTE? (Tambahkan isLoading)
  const { data: hasVoted, isLoading: isLoadingVote } = useReadContract({
    address: address as `0x${string}`,
    abi: POLL_ABI,
    functionName: "hasVoted",
    args: userAddress ? [userAddress] : undefined,
    query: {
        enabled: !!userAddress, // Hanya jalan kalau user sudah connect wallet
    }
  });

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  const bgLight = useTransform(x, [-200, 0, 200], ["#fee2e2", "#ffffff", "#dbeafe"]);
  const bgDark = useTransform(x, [-200, 0, 200], ["#450a0a", "#1f2937", "#172554"]);
  
  const activeBg = resolvedTheme === "dark" ? bgDark : bgLight;

  if (!pollData) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [question, , count1, , count2] = pollData as any;
  const total = Number(count1) + Number(count2);
  const scale = index === 0 ? 1 : 0.95;
  const y = index === 0 ? 0 : 10;

  // Helper untuk status vote (Pastikan boolean)
  const userHasVoted = Boolean(hasVoted);

  return (
    <motion.div
      style={{ x, rotate, opacity, scale, y, backgroundColor: activeBg }}
      drag={index === 0 ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, info) => {
        
        // === SWIPE KANAN (VOTE YES) ===
        if (info.offset.x > 100) {
            
            // 1. CEK LOADING DULU (PENTING!)
            // Kalau data belum siap, jangan lakukan apa-apa
            if (isLoadingVote) {
                 console.log("Data vote masih loading...");
                 return; 
            }

            // 2. CEK STATUS SUDAH VOTE ATAU BELUM
            if (userHasVoted) {
                alert("⚠️ You already voted on this poll! Skipping transaction.");
                onSwipe("right");
            } else {
                // 3. BARU PANGGIL WALLET (Jika belum vote)
                writeContract({
                    address: address as `0x${string}`,
                    abi: POLL_ABI,
                    functionName: "vote",
                    args: [1], 
                });
                onSwipe("right");
            }

        } 
        // === SWIPE KIRI (SKIP) ===
        else if (info.offset.x < -100) {
            onSwipe("left");
        }
      }}
      className={`absolute w-full max-w-sm h-80 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-6 cursor-grab active:cursor-grabbing text-center z-${10 - index}`}
    >
      <div className={`mb-4 p-4 rounded-full ${userHasVoted ? 'bg-green-100 text-green-600' : 'bg-gray-50 dark:bg-gray-800 text-blue-500'}`}>
        {userHasVoted ? <MdCheckCircle className="text-4xl" /> : <MdHowToVote className="text-4xl" />}
      </div>

      <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-2 leading-tight">
        {question}
      </h3>

      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mt-2">
        {total} people voted {userHasVoted && <span className="text-green-500 font-bold ml-1">(You Voted)</span>}
      </p>

      {/* Indikator Loading Kecil jika data belum siap */}
      {isLoadingVote && userAddress && index === 0 && (
          <p className="text-[10px] text-blue-500 animate-pulse mt-1">Checking vote status...</p>
      )}

      <div className="absolute bottom-6 flex justify-between w-full px-8">
        
        <div className="flex items-center gap-1 text-red-400/80 dark:text-red-500/80 font-black text-xs tracking-widest">
            <MdArrowBack /> SKIP
        </div>

        <div className={`flex items-center gap-1 font-black text-xs tracking-widest ${userHasVoted ? 'text-gray-400' : 'text-blue-500/80 dark:text-blue-400/80'}`}>
            {userHasVoted ? "ALREADY VOTED" : "VOTE (YES)"} <MdArrowForward />
        </div>

      </div>
    </motion.div>
  );
}