"use client";

import { useState, useEffect } from "react";
import { MdPerson } from "react-icons/md";
import { usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";

// Voter Data Type
interface VoterData {
  voter: string;
  choice: number;
  timestamp: bigint;
}

// --- Row Component (Optimized) ---
const VoterRow = ({ voter, choice, opt1, opt2 }: { voter: string, choice: number, opt1: string, opt2: string }) => {
  // OPTIMIZATION: Removed useEnsName hook to prevent RPC rate limiting / freezing.
  // Just show a truncated address instead.
  const displayName = `${voter.slice(0, 6)}...${voter.slice(-4)}`;
  
  const choiceText = choice === 1 ? opt1 : opt2;
  const choiceColor = choice === 1 
    ? "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300" 
    : "text-pink-600 bg-pink-50 dark:bg-pink-900/30 dark:text-pink-300";

  return (
    <div className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
            <MdPerson />
        </div>
        <span className="font-medium text-gray-800 dark:text-gray-200 font-mono text-sm">{displayName}</span>
      </div>
      <span className={`text-xs font-bold px-3 py-1 rounded-full ${choiceColor}`}>{choiceText}</span>
    </div>
  );
};

// --- Main VoterList Component ---
interface Props {
  address: string;
  opt1: string;
  opt2: string;
}

export default function VoterList({ address, opt1, opt2 }: Props) {
  const publicClient = usePublicClient();
  const [voters, setVoters] = useState<VoterData[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Define Event ABI
  const voteCastEvent = parseAbiItem("event VoteCast(address indexed voter, uint256 choice, uint256 timestamp)");

  useEffect(() => {
    async function fetchVoters() {
      if (!publicClient) return;
      setIsLoadingLogs(true);
      setErrorMsg(null);
      
      try {
        // 1. Get current block number
        const currentBlock = await publicClient.getBlockNumber();
        
        // 2. CRITICAL FIX: Limit the search range.
        // Searching from block 0 (genesis) causes RPC Timeout errors on public nodes.
        // We limit to the last 50,000 blocks (approx. 24-48 hours on Base).
        // If your poll is older, you might need an Indexer (The Graph) instead of raw RPC calls.
        const range = 50000n; 
        const fromBlockCalc = currentBlock - range > 0n ? currentBlock - range : 0n;

        // console.log(`Fetching logs from block ${fromBlockCalc} to ${currentBlock}...`);

        const logs = await publicClient.getLogs({
          address: address as `0x${string}`,
          event: voteCastEvent,
          fromBlock: fromBlockCalc, 
          toBlock: 'latest' 
        });

        // 3. Format logs
        const formattedVoters: VoterData[] = logs.map(log => ({
          voter: log.args.voter as string,
          choice: Number(log.args.choice),
          timestamp: log.args.timestamp as bigint,
        })).sort((a, b) => Number(b.timestamp) - Number(a.timestamp)); // Sort: Newest first

        setVoters(formattedVoters);
      } catch (e: any) {
        console.error("Error fetching vote logs:", e);
        setErrorMsg("Failed to load voters (RPC Error). Please try again later.");
      } finally {
        setIsLoadingLogs(false);
      }
    }

    fetchVoters();
  }, [publicClient, address]); 
  
  if (isLoadingLogs) {
    return (
        <div className="text-center p-6 text-gray-500 dark:text-gray-400 animate-pulse">
            Fetching blockchain data...
        </div>
    );
  }

  if (errorMsg) {
    return (
        <div className="text-center p-6 text-red-500 text-sm">
            {errorMsg}
        </div>
    );
  }

  if (voters.length === 0) {
    return (
        <div className="text-center p-6 text-gray-500 dark:text-gray-400">
            No votes found recently.
        </div>
    );
  }
  
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {voters.map((v, index) => (
        <VoterRow 
          key={`${v.voter}-${index}`} 
          voter={v.voter} 
          choice={v.choice} 
          opt1={opt1} 
          opt2={opt2} 
        />
      ))}
    </div>
  );
}