"use client";

import { useReadContract, useEnsName } from "wagmi";
import { POLL_ABI } from "~/app/constants";
import { MdPerson } from "react-icons/md";

// Component Baris per Voter
const VoterRow = ({ voter, choice, opt1, opt2 }: { voter: string, choice: number, opt1: string, opt2: string }) => {
  
  // 1. RESOLVE BASE NAME / ENS
  // Ini akan otomatis mencari nama seperti 'jesse.base.eth' atau 'user.eth'
  const { data: ensName } = useEnsName({ 
    address: voter as `0x${string}`, 
    chainId: 8453 // Chain ID Base Mainnet (Penting biar bacanya ke Base L2 resolver)
  });

  // 2. LOGIKA NAMA (Sesuai request)
  // Prioritas 1: Base Name / ENS (misal: vitalik.eth)
  // Prioritas 2: Wallet Address dipotong (misal: 0x123...ABCD)
  const displayName = ensName ? ensName : `${voter.slice(0, 6)}...${voter.slice(-4)}`;
  
  const choiceText = choice === 1 ? opt1 : opt2;
  const choiceColor = choice === 1 ? "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300" : "text-pink-600 bg-pink-50 dark:bg-pink-900/30 dark:text-pink-300";

  return (
    <div className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
      <div className="flex items-center gap-3">
        {/* Avatar Bulat */}
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 overflow-hidden">
           {/* Kalau mau advanced, bisa ambil avatar ENS juga, tapi icon person sudah cukup rapi */}
           <MdPerson />
        </div>
        
        <div className="flex flex-col">
            {/* Nama User */}
            <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
                {displayName}
            </span>
            {/* Jika punya ENS, tampilkan address kecil di bawahnya. Kalau tidak, sembunyikan */}
            {ensName && (
                <span className="text-[10px] text-gray-400 font-mono">{voter.slice(0,6)}...</span>
            )}
        </div>
      </div>
      
      {/* Pilihan Vote */}
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${choiceColor}`}>
        {choiceText}
      </span>
    </div>
  );
};

export default function VoterList({ pollAddress }: { pollAddress: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pollData } = useReadContract({
    address: pollAddress as `0x${string}`,
    abi: POLL_ABI,
    functionName: "getPollInfo",
  });

  const { data: votersData, isLoading } = useReadContract({
    address: pollAddress as `0x${string}`,
    abi: POLL_ABI,
    functionName: "getVoters",
  });

  if (isLoading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!votersData || (votersData as any[]).length === 0) return <p className="text-center p-8 text-sm text-gray-400">No voters yet. Be the first!</p>;
  if (!pollData) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ , opt1, , opt2, ] = pollData as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const voters = votersData as any[];

  return (
    <div className="max-h-[60vh] overflow-y-auto scrollbar-hide">
      {[...voters].reverse().map((v, i) => (
        <VoterRow 
            key={i} 
            voter={v.voter} 
            choice={Number(v.choice)} 
            opt1={opt1} 
            opt2={opt2} 
        />
      ))}
    </div>
  );
}