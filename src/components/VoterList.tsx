"use client";

import { useReadContract } from "wagmi";
import { POLL_ABI } from "~/app/constants";
import { useEnsName } from "wagmi"; // Hook ajaib untuk ubah 0x jadi .eth
import { MdPerson } from "react-icons/md";

// Komponen Kecil untuk Baris per Voter (Supaya bisa pakai Hook useEnsName)
const VoterRow = ({ voter, choice, opt1, opt2 }: { voter: string, choice: number, opt1: string, opt2: string }) => {
  // Cek apakah alamat ini punya nama ENS/Base Name
  const { data: ensName } = useEnsName({ address: voter as `0x${string}` });

  // Format tampilan nama: Kalau ada ENS pakai ENS, kalau tidak potong address (0x12...AB)
  const displayName = ensName || `${voter.slice(0, 6)}...${voter.slice(-4)}`;
  
  // Tentukan warna berdasarkan pilihan (1 = Biru, 2 = Merah/Pink)
  const choiceText = choice === 1 ? opt1 : opt2;
  const choiceColor = choice === 1 ? "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300" : "text-pink-600 bg-pink-50 dark:bg-pink-900/30 dark:text-pink-300";

  return (
    <div className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500">
           {/* Avatar Placeholder */}
           <MdPerson />
        </div>
        <div className="flex flex-col">
            <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
                {displayName}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">{voter.slice(0,10)}...</span>
        </div>
      </div>
      
      <span className={`text-xs font-bold px-2 py-1 rounded-md ${choiceColor}`}>
        {choiceText}
      </span>
    </div>
  );
};

export default function VoterList({ pollAddress }: { pollAddress: string }) {
  // Ambil Data Poll Detail (Opsi 1 & 2)
  const { data: pollData } = useReadContract({
    address: pollAddress as `0x${string}`,
    abi: POLL_ABI,
    functionName: "getPollInfo",
  });

  // Ambil Data List Pemilih
  const { data: votersData, isLoading } = useReadContract({
    address: pollAddress as `0x${string}`,
    abi: POLL_ABI,
    functionName: "getVoters",
  });

  if (isLoading) return <p className="text-center p-4 text-sm text-gray-400">Loading voters...</p>;
  if (!votersData || (votersData as any[]).length === 0) return <p className="text-center p-4 text-sm text-gray-400">No voters yet.</p>;
  if (!pollData) return null;

  const [ , opt1, , opt2, ] = pollData as any;
  const voters = votersData as any[];

  return (
    <div className="max-h-60 overflow-y-auto">
      {/* Loop semua pemilih (dibalik biar yang terbaru di atas) */}
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