"use client";

import { useReadContract } from "wagmi";
import { POLL_ABI } from "~/app/constants";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { MdHowToVote, MdArrowBack, MdArrowForward } from "react-icons/md"; // Tambah icon panah biar jelas
import { useTheme } from "next-themes"; 

interface Props {
  address: string;
  onSwipe: (direction: "left" | "right") => void;
  index: number;
}

export default function SwipeCard({ address, onSwipe, index }: Props) {
  const { resolvedTheme } = useTheme();

  const { data: pollData } = useReadContract({
    address: address as `0x${string}`,
    abi: POLL_ABI,
    functionName: "getPollInfo",
  });

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  const bgLight = useTransform(x, [-200, 0, 200], ["#fee2e2", "#ffffff", "#dbeafe"]);
  const bgDark = useTransform(x, [-200, 0, 200], ["#450a0a", "#1f2937", "#172554"]);
  
  const activeBg = resolvedTheme === "dark" ? bgDark : bgLight;

  if (!pollData) return null;

  const [question, , count1, , count2] = pollData as [string, string, bigint, string, bigint, bigint];
  
  const total = Number(count1) + Number(count2);
  const scale = index === 0 ? 1 : 0.95;
  const y = index === 0 ? 0 : 10;

  return (
    <motion.div
      style={{ x, rotate, opacity, scale, y, backgroundColor: activeBg }}
      drag={index === 0 ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, info) => {
        if (info.offset.x > 100) onSwipe("right");
        else if (info.offset.x < -100) onSwipe("left");
      }}
      className={`absolute w-full max-w-sm h-80 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-6 cursor-grab active:cursor-grabbing text-center z-${10 - index}`}
    >
      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-full text-blue-500">
        <MdHowToVote className="text-4xl" />
      </div>

      <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-2 leading-tight">
        {question}
      </h3>

      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mt-2">
        {total} people voted
      </p>

      {/* === BAGIAN INI YANG DIUPDATE === */}
      <div className="absolute bottom-6 flex justify-between w-full px-8">
        
        {/* Tombol Kiri (SKIP) */}
        <div className="flex items-center gap-1 text-red-400/80 dark:text-red-500/80 font-black text-xs tracking-widest">
            <MdArrowBack /> SKIP
        </div>

        {/* Tombol Kanan (VOTE) */}
        <div className="flex items-center gap-1 text-blue-500/80 dark:text-blue-400/80 font-black text-xs tracking-widest">
            VOTE <MdArrowForward />
        </div>

      </div>
    </motion.div>
  );
}