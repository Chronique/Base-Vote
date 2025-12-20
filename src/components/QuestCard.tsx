"use client";

import { useAccount, useReadContract } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants"; // Pastikan impor ini benar
import { MdPeople } from "react-icons/md";

interface Props {
  pollId: number; // Menggunakan pollId (angka), bukan address lagi
}

export default function QuestCard({ pollId }: Props) {
  const { address: userAddress } = useAccount();

  // 1. Ambil data informasi Poll (Mengembalikan 7 data sesuai ABI baru Anda)
  const { data: pollData } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollInfo",
    args: [BigInt(pollId)], // Konversi number ke bigint
  });

  // 2. Baca status voter (Memerlukan 2 parameter: pollId dan userAddress)
  const { data: hasVotedData } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "hasVoted", 
    args: userAddress ? [BigInt(pollId), userAddress] : undefined,
    query: {
      enabled: !!userAddress, 
    },
  });

  const hasVoted = Boolean(hasVotedData); 

  if (!pollData) return null;

  // Sesuai ABI: [question, opt1, votes1, opt2, votes2, endTime, creator]
  const [question, , votes1, , votes2] = pollData as any;
  
  const count1 = Number(votes1 || 0);
  const count2 = Number(votes2 || 0);
  const totalVotes = count1 + count2;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm mb-4">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight pr-4">
            {question}
        </h3>
        <div className="flex items-center gap-1 text-[10px] font-black text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg shrink-0">
          <MdPeople className="text-sm" /> {totalVotes}
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center text-xs text-gray-400 font-bold uppercase tracking-widest">
        <span>{hasVoted ? "Already Voted ✅" : "Not Voted Yet"}</span>
      </div>
    </div>
  );
}