"use client";

import { useState, useEffect } from "react";
import { useReadContract, useEnsName } from "wagmi";
import { POLL_ABI } from "~/app/constants";
import { MdPerson } from "react-icons/md";
// Import Public Client untuk baca Event Logs
import { usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";

// Tipe Data Voter (Kita definisikan sendiri karena tidak ada di contract lagi)
interface VoterData {
  voter: string;
  choice: number;
  timestamp: bigint;
}

// Component Baris per Voter
const VoterRow = ({ voter, choice, opt1, opt2 }: { voter: string, choice: number, opt1: string, opt2: string }) => {
  
  // Resolve Base Name / ENS
  const { data: ensName } = useEnsName({ 
    address: voter as `0x${string}`, 
    chainId: 8453 
  });

  const displayName = ensName ? ensName : `${voter.slice(0, 6)}...${voter.slice(-4)}`;
  const choiceText = choice === 1 ? opt1 : opt2;
  const choiceColor = choice === 1 ? "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300" : "text-pink-600 bg-pink-50 dark:bg-pink-900/30 dark:text-pink-300";

  return (
    <div className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 overflow-hidden">
           <MdPerson />
        </div>
        
        <div className="flex flex-col">
            <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
                {displayName}
            </span>
            {ensName && (
                <span className="text-[10px] text-gray-400 font-mono">{voter.slice(0,6)}...</span>
            )}
        </div>
      </div>
      
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${choiceColor}`}>
        {choiceText}
      </span>
    </div>
  );
};

export default function VoterList({ pollAddress }: { pollAddress: string }) {
  const publicClient = usePublicClient();
  const [voters, setVoters] = useState<VoterData[]>([]);
  const [loadingVoters, setLoadingVoters] = useState(true);

  // Ambil Data Detail Poll (Judul Opsi)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pollData } = useReadContract({
    address: pollAddress as `0x${string}`,
    abi: POLL_ABI,
    functionName: "getPollInfo",
  });

  // LOGIKA BARU: Fetch Event Logs Manual
  useEffect(() => {
    const fetchLogs = async () => {
      if (!publicClient || !pollAddress) return;
      
      try {
        setLoadingVoters(true);
        // Kita cari event 'NewVote' dari alamat poll ini
        // Mengambil log dari blok awal (0n) sampai sekarang
        const logs = await publicClient.getLogs({
          address: pollAddress as `0x${string}`,
          event: parseAbiItem('event NewVote(address indexed voter, uint8 choice, uint256 timestamp)'),
          fromBlock: 'earliest' 
        });

        // Format data log menjadi array voter yang bersih
        const formattedVoters: VoterData[] = logs.map(log => ({
          voter: log.args.voter as string,
          choice: Number(log.args.choice),
          timestamp: log.args.timestamp as bigint
        }));

        setVoters(formattedVoters);
      } catch (error) {
        console.error("Error fetching vote logs:", error);
      } finally {
        setLoadingVoters(false);
      }
    };

    fetchLogs();
  }, [publicClient, pollAddress]);

  if (loadingVoters) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>;
  
  if (voters.length === 0) return <p className="text-center p-8 text-sm text-gray-400">No voters yet. Be the first!</p>;
  if (!pollData) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ , opt1, , opt2, ] = pollData as any;

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