"use client";

import { useState, memo, useMemo } from "react";
import { useReadContract, useAccount, useWriteContract } from "wagmi"; 
import { useSendCalls, useCapabilities } from "wagmi/experimental"; 
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { MdHowToVote, MdCheckCircle, MdThumbUp, MdBolt, MdArrowBack, MdArrowForward, MdPeople } from "react-icons/md";
import { encodeFunctionData } from "viem";
import { Attribution } from "ox/erc8021";

interface Props {
  pollId: number;
  onSwipe: (direction: "left" | "right") => void;
  index: number;
}

const SwipeCard = memo(function SwipeCard({ pollId, onSwipe, index }: Props) {
  const [showSelection, setShowSelection] = useState(false);
  const [confirmChoice, setConfirmChoice] = useState<number | null>(null);
  const [isVotingLoading, setIsVotingLoading] = useState(false);

  const { address: userAddress, chain } = useAccount();
  const { data: availableCapabilities } = useCapabilities({ account: userAddress });
  const { sendCallsAsync } = useSendCalls();         
  const { writeContractAsync } = useWriteContract(); 

  const capabilities = useMemo(() => {
    const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;
    if (paymasterUrl && availableCapabilities && chain && availableCapabilities[chain.id]?.["paymasterService"]?.supported) {
        return {
          paymasterService: { url: paymasterUrl },
          dataSuffix: Attribution.toDataSuffix({ codes: ["bc_2ivoo1oy"] })
        };
    }
    return { dataSuffix: Attribution.toDataSuffix({ codes: ["bc_2ivoo1oy"] }) };
  }, [availableCapabilities, chain]);

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
    args: [BigInt(pollId), userAddress as `0x${string}`],
    query: { enabled: !!userAddress }
  });

  const x = useMotionValue(0);
  // Meluruskan kartu: Rotasi dikurangi agar tidak terlalu miring
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  if (!pollData) return null;

  // Destruktur data sesuai ABI kontrak baru
  const [question, opt1, votes1, opt2, votes2, endTime] = pollData as any;
  const isEnded = Number(endTime) < Date.now() / 1000;
  const userHasVoted = Boolean(hasVoted);
  
  // Hitung total vote
  const totalVotes = Number(votes1 || 0) + Number(votes2 || 0);

  const handleVote = async () => {
    if (!confirmChoice || isVotingLoading) return;
    setIsVotingLoading(true);
    try {
        const encodedData = encodeFunctionData({
            abi: FACTORY_ABI,
            functionName: "vote",
            args: [BigInt(pollId), BigInt(confirmChoice)]
        });
        await sendCallsAsync({
            calls: [{ to: FACTORY_ADDRESS as `0x${string}`, data: encodedData }],
            capabilities: capabilities as any
        });
        onSwipe("right");
    } catch (e) {
        try {
            await writeContractAsync({ address: FACTORY_ADDRESS as `0x${string}`, abi: FACTORY_ABI, functionName: "vote", args: [BigInt(pollId), BigInt(confirmChoice)] });
            onSwipe("right");
        } catch (err) {}
    } finally { setIsVotingLoading(false); }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity, scale: index === 0 ? 1 : 0.95 }}
      drag={index === 0 && !showSelection && !confirmChoice && !isEnded ? "x" : false} 
      className={`absolute w-full max-w-sm h-80 rounded-3xl shadow-xl border bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-6 text-center z-${20-index} overflow-hidden`}
      onDragEnd={(e, info) => {
        // Threshold diperpendek ke 50 agar swipe lebih ringan
        if (info.offset.x > 50 && !userHasVoted && !isEnded) {
            setShowSelection(true); 
            animate(x, 120);
        } else if (info.offset.x < -50) {
            onSwipe("left");
        } else {
            animate(x, 0);
        }
      }}
    >
      {(showSelection || confirmChoice) && !userHasVoted && !isEnded && (
        <div className="absolute inset-0 z-50 bg-white/98 dark:bg-gray-950 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
            {!confirmChoice ? (
                <div className="w-full flex flex-col gap-3 px-4 text-center">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Choose Answer</p>
                    <button onClick={() => setConfirmChoice(1)} className="w-full py-4 bg-blue-50 border border-blue-200 text-blue-700 font-bold rounded-2xl active:scale-95 transition-transform">{opt1}</button>
                    <button onClick={() => setConfirmChoice(2)} className="w-full py-4 bg-pink-50 border border-pink-200 text-pink-700 font-bold rounded-2xl active:scale-95 transition-transform">{opt2}</button>
                    <button onClick={() => { setShowSelection(false); animate(x, 0); }} className="mt-2 text-[10px] font-black text-gray-400 uppercase">Cancel</button>
                </div>
            ) : (
                <div className="w-full flex flex-col items-center px-4">
                    <p className="text-xl font-black mb-6">"{confirmChoice === 1 ? opt1 : opt2}"</p>
                    
                    <div className="mb-6 flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 text-white border border-blue-400 shadow-lg">
                        <span className="text-[10px] font-black uppercase flex items-center gap-1 tracking-widest">
                            <MdBolt className="text-yellow-300 animate-pulse" /> GAS SPONSORED
                        </span>
                    </div>

                    <button onClick={handleVote} disabled={isVotingLoading} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all">
                        {isVotingLoading ? "SIGNING..." : "SIGN & VOTE"}
                    </button>
                    <button onClick={() => setConfirmChoice(null)} className="mt-4 text-xs font-bold text-gray-400 underline decoration-2 underline-offset-4">Change Option</button>
                </div>
            )}
        </div>
      )}

      {isEnded && <div className="absolute top-4 right-4 bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Expired</div>}
      
      {/* Vote Count Indicator */}
      <div className="absolute top-6 left-6 flex items-center gap-1.5 text-gray-400">
          <MdPeople className="text-lg" />
          <span className="text-[11px] font-black tracking-tighter">{totalVotes} VOTES</span>
      </div>

      <h3 className="text-2xl font-black leading-tight px-4 text-gray-800 dark:text-white mt-4">{question}</h3>
      {userHasVoted && <p className="text-[10px] text-green-500 font-black mt-2 uppercase tracking-widest">Already Voted</p>}
      
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