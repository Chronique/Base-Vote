"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { POLL_ABI } from "~/app/constants";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Props {
  address: string;
}

export default function QuestCard({ address }: Props) {
  const { address: userAddress } = useAccount();
  const [isVoting, setIsVoting] = useState(false);

  // 1. READ POLL DATA
  const { data: pollData } = useReadContract({
    address: address as `0x${string}`,
    abi: POLL_ABI,
    functionName: "getPollInfo",
  });

  // 2. READ VOTER STATUS (Fix: functionName harus 'hasVoted')
  const { data: hasVotedData } = useReadContract({
    address: address as `0x${string}`,
    abi: POLL_ABI,
    functionName: "hasVoted", // <-- NAMA FUNGSI DIPERBAIKI (Sesuai Solidity)
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress, // Hanya jalan kalau user sudah connect wallet
    },
  });

  // 3. WRITE VOTE
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed) setIsVoting(false);
  }, [isConfirmed]);

  const handleVote = (option: number) => {
    setIsVoting(true);
    writeContract({
      address: address as `0x${string}`,
      abi: POLL_ABI,
      functionName: "vote",
      args: [option],
    });
  };

  // Konversi hasVotedData ke Boolean murni untuk prop 'disabled'
  const hasVoted = Boolean(hasVotedData); 

  if (!pollData) return null;

  // Destructure dan Konversi BigInt ke Number (Fix Error Matematika)
  const [question, opt1, count1Big, opt2, count2Big, endTime] = pollData as [string, string, bigint, string, bigint, bigint];
  
  const count1 = Number(count1Big);
  const count2 = Number(count2Big);
  const totalVotes = count1 + count2;

  // Hitung Persentase
  const pct1 = totalVotes === 0 ? 0 : Math.round((count1 / totalVotes) * 100);
  const pct2 = totalVotes === 0 ? 0 : Math.round((count2 / totalVotes) * 100);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm mb-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{question}</h3>

      <div className="space-y-3">
        {/* OPTION 1 */}
        <div className="relative">
          <button
            onClick={() => handleVote(1)}
            disabled={hasVoted || isPending || isVoting} // Fix: Value harus boolean
            aria-label={`Vote for ${opt1}`} // Fix: Accessibility
            className="w-full relative z-10 flex justify-between items-center p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-left"
          >
            <span className="font-semibold text-blue-700 dark:text-blue-300">{opt1}</span>
            {hasVoted && <span className="text-sm font-bold">{pct1}%</span>}
          </button>
          
          {/* Progress Bar Background */}
          {hasVoted && (
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${pct1}%` }}
              className="absolute top-0 left-0 h-full bg-blue-100/50 dark:bg-blue-900/40 rounded-xl z-0"
            />
          )}
        </div>

        {/* OPTION 2 */}
        <div className="relative">
          <button
            onClick={() => handleVote(2)}
            disabled={hasVoted || isPending || isVoting} // Fix: Value harus boolean
            aria-label={`Vote for ${opt2}`} // Fix: Accessibility
            className="w-full relative z-10 flex justify-between items-center p-3 rounded-xl border border-pink-100 dark:border-pink-900/30 hover:bg-pink-50 dark:hover:bg-pink-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-left"
          >
            <span className="font-semibold text-pink-700 dark:text-pink-300">{opt2}</span>
            {hasVoted && <span className="text-sm font-bold">{pct2}%</span>}
          </button>

          {/* Progress Bar Background */}
          {hasVoted && (
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${pct2}%` }}
              className="absolute top-0 left-0 h-full bg-pink-100/50 dark:bg-pink-900/40 rounded-xl z-0"
            />
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
        <span>Total Votes: {totalVotes}</span>
        <span>{hasVoted ? "You voted ✅" : "Tap to vote"}</span>
      </div>
    </div>
  );
}