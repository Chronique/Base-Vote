"use client";

import { useState, memo, useMemo } from "react";
import { useReadContract, useAccount, useWriteContract } from "wagmi"; 
import { useSendCalls, useCapabilities } from "wagmi/experimental"; 
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { MdPeople, MdBolt, MdArrowBack, MdArrowForward } from "react-icons/md";
import { useTheme } from "next-themes";
import { encodeFunctionData } from "viem";
import { Attribution } from "ox/erc8021";

interface Props {
  pollId: number;
  onSwipe: (direction: "left" | "right") => void;
  index: number;
}

const SwipeCard = memo(function SwipeCard({ pollId, onSwipe, index }: Props) {
  const { resolvedTheme } = useTheme();
  const [showSelection, setShowSelection] = useState(false);
  const [confirmChoice, setConfirmChoice] = useState<number | null>(null);
  const [isVotingLoading, setIsVotingLoading] = useState(false);
  const [useGas, setUseGas] = useState(true); // State untuk Toggle Gas Sponsored

  const { address: userAddress, chain } = useAccount();
  const { data: availableCapabilities } = useCapabilities({ account: userAddress });
  const { sendCallsAsync } = useSendCalls();         
  const { writeContractAsync } = useWriteContract(); 

  const capabilities = useMemo(() => {
    const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;
    // Hanya gunakan paymaster jika toggle 'useGas' menyala
    if (useGas && paymasterUrl && availableCapabilities && chain && availableCapabilities[chain.id]?.["paymasterService"]?.supported) {
        return {
          paymasterService: { url: paymasterUrl },
          dataSuffix: Attribution.toDataSuffix({ codes: ["bc_2ivoo1oy"] })
        };
    }
    return { dataSuffix: Attribution.toDataSuffix({ codes: ["bc_2ivoo1oy"] }) };
  }, [availableCapabilities, chain, useGas]);

  const { data: pollData } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollInfo",
    args: [BigInt(pollId)]
  });

  const { data: hasVoted } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "hasVoted",
    args: userAddress ? [BigInt(pollId), userAddress] : undefined,
    query: { enabled: !!userAddress }
  });

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]); 
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);
  
  const bgLight = useTransform(x, [-200, 0, 200], ["#fee2e2", "#ffffff", "#dbeafe"]);
  const bgDark = useTransform(x, [-200, 0, 200], ["#450a0a", "#111827", "#172554"]);
  const activeBg = resolvedTheme === "dark" ? bgDark : bgLight;

  if (!pollData) return null;
  const [question, opt1, votes1, opt2, votes2, endTime] = pollData as any;
  const totalVotes = Number(votes1 || 0) + Number(votes2 || 0);
  const userHasVoted = Boolean(hasVoted);
  const isEnded = Number(endTime) < Date.now() / 1000;

  const handleVote = async () => {
    if (!confirmChoice || isVotingLoading) return;
    setIsVotingLoading(true);
    try {
        const encodedData = encodeFunctionData({
            abi: FACTORY_ABI,
            functionName: "vote",
            args: [BigInt(pollId), BigInt(confirmChoice)]
        });

        // Gunakan paymaster (Gas Sponsored) jika useGas true, jika tidak pakai writeContract standar
        if (useGas) {
            await sendCallsAsync({
                calls: [{ to: FACTORY_ADDRESS as `0x${string}`, data: encodedData }],
                capabilities: capabilities as any
            });
        } else {
            await writeContractAsync({ 
                address: FACTORY_ADDRESS as `0x${string}`, 
                abi: FACTORY_ABI, 
                functionName: "vote", 
                args: [BigInt(pollId), BigInt(confirmChoice)] 
            });
        }
        
        await animate(x, 1000, { duration: 0.3 });
        onSwipe("right");
    } catch (e) {
        console.error("Vote failed:", e);
    } finally { 
        setIsVotingLoading(false); 
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity, scale: index === 0 ? 1 : 0.95, backgroundColor: activeBg }}
      drag={index === 0 && !showSelection && !confirmChoice && !isEnded ? "x" : false} 
      dragConstraints={{ left: 0, right: 0 }}
      className={`absolute w-full max-w-sm h-80 rounded-3xl shadow-xl border dark:border-gray-800 flex flex-col items-center justify-center p-6 text-center z-${10-index} overflow-hidden touch-none`}
      onDragEnd={async (e, info) => {
        if (info.offset.x > 100 && !userHasVoted && !isEnded) {
            setShowSelection(true); 
            animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
        } else if (info.offset.x < -100) {
            await animate(x, -1000, { duration: 0.3 });
            onSwipe("left");
        } else {
            animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
        }
      }}
    >
      {/* VOTE COUNT (Akan tertutup overlay saat vote) */}
      <div className="absolute top-6 left-6 flex items-center gap-1 text-gray-400 font-black text-[10px] tracking-widest uppercase">
          <MdPeople className="text-sm" /> {totalVotes} Voters
      </div>

      {/* SELECTION OVERLAY (Dibuat solid agar tidak tembus) */}
      {(showSelection || confirmChoice) && !userHasVoted && !isEnded && (
        <div className="absolute inset-0 z-[60] bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-6 transition-colors">
            {!confirmChoice ? (
                <div className="w-full flex flex-col gap-3 px-4">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Choose Answer</p>
                    <button onClick={() => setConfirmChoice(1)} className="w-full py-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 font-bold rounded-2xl active:scale-95 transition-transform">{opt1}</button>
                    <button onClick={() => setConfirmChoice(2)} className="w-full py-4 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-400 font-bold rounded-2xl active:scale-95 transition-transform">{opt2}</button>
                    <button onClick={() => { setShowSelection(false); animate(x, 0); }} className="mt-4 text-[10px] font-black text-gray-400 uppercase">Cancel</button>
                </div>
            ) : (
                <div className="w-full flex flex-col items-center px-4">
                    <p className="text-xl font-black mb-6 dark:text-white leading-tight">"{confirmChoice === 1 ? opt1 : opt2}"</p>
                    
                    {/* TOGGLE GAS SPONSORED */}
                    <div className="mb-6 w-full flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1">
                                <MdBolt className={useGas ? "text-yellow-400" : "text-gray-400"} /> Gas Sponsored
                            </span>
                            <span className="text-[9px] text-gray-500 font-medium">No transaction fee</span>
                        </div>
                        {/* Custom Switch Toggle */}
                        <button 
                            onClick={() => setUseGas(!useGas)}
                            className={`relative w-10 h-5 rounded-full transition-colors ${useGas ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${useGas ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <button 
                        onClick={handleVote} 
                        disabled={isVotingLoading} 
                        className={`w-full py-4 ${useGas ? 'bg-blue-600' : 'bg-gray-800'} text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all disabled:opacity-50`}
                    >
                        {isVotingLoading ? "SIGNING..." : "SIGN & VOTE"}
                    </button>
                    
                    <button 
                        onClick={() => setConfirmChoice(null)} 
                        disabled={isVotingLoading}
                        className="mt-4 text-xs font-bold text-gray-400 underline decoration-2 underline-offset-4 tracking-widest"
                    >
                        Change Option
                    </button>
                </div>
            )}
        </div>
      )}

      {isEnded && <div className="absolute top-4 right-4 bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Expired</div>}
      
      <h3 className="text-2xl font-black leading-tight px-4 text-gray-900 dark:text-white">
        {question}
      </h3>

      {userHasVoted && (
        <div className="mt-4 flex flex-col items-center gap-1">
            <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">Already Voted</p>
        </div>
      )}
      
      {/* BOTTOM HINTS (Tertutup saat overlay muncul) */}
      <div className="absolute bottom-6 flex justify-between w-full px-10 font-black text-[10px] tracking-widest uppercase">
        <div className="text-orange-500 flex items-center gap-1"><MdArrowBack /> SKIP</div>
        <div className={`${userHasVoted ? 'text-green-500' : 'text-blue-600 animate-pulse'} flex items-center gap-1`}>
            {userHasVoted ? "DONE" : "VOTE"} <MdArrowForward />
        </div>
      </div>
    </motion.div>
  );
});

export default SwipeCard;