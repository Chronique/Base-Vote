"use client";

import { useState, memo, useMemo } from "react";
import { useReadContract, useAccount, useWriteContract } from "wagmi"; 
import { useSendCalls, useCapabilities } from "wagmi/experimental"; 
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { MdHowToVote, MdCheckCircle, MdThumbUp, MdBolt, MdTimerOff } from "react-icons/md";
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
  const [usePaymaster, setUsePaymaster] = useState(true);

  const { address: userAddress, chain } = useAccount();
  const { data: availableCapabilities } = useCapabilities({ account: userAddress });
  const { sendCallsAsync } = useSendCalls();         
  const { writeContractAsync } = useWriteContract(); 

  const canUsePaymaster = useMemo(() => {
    if (!availableCapabilities || !chain) return false;
    const capabilitiesForChain = availableCapabilities[chain.id];
    return !!capabilitiesForChain?.["paymasterService"]?.supported && !!process.env.NEXT_PUBLIC_PAYMASTER_URL;
  }, [availableCapabilities, chain]);

  // LOGIKA NORMAL: ON = Sponsored
  const capabilities = useMemo(() => {
    const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;
    if (usePaymaster && canUsePaymaster && paymasterUrl) {
        return {
          paymasterService: { url: paymasterUrl },
          dataSuffix: Attribution.toDataSuffix({ codes: ["bc_2ivoo1oy"] })
        };
    }
    return { dataSuffix: Attribution.toDataSuffix({ codes: ["bc_2ivoo1oy"] }) };
  }, [usePaymaster, canUsePaymaster]);

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
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  if (!pollData) return null;

  const [question, opt1, , opt2, , endTime] = pollData as any;
  const isEnded = endTime ? Number(endTime) < Date.now() / 1000 : false;
  const userHasVoted = Boolean(hasVoted);

  const handleFinalVote = async () => {
    if (!confirmChoice || isVotingLoading || isEnded) return;
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
        await animate(x, 500, { duration: 0.2 });
        onSwipe("right");
    } catch (error) {
        try {
            await writeContractAsync({ 
              address: FACTORY_ADDRESS as `0x${string}`, 
              abi: FACTORY_ABI, 
              functionName: "vote", 
              args: [BigInt(pollId), BigInt(confirmChoice)] 
            });
            onSwipe("right");
        } catch (e) {}
    } finally {
        setIsVotingLoading(false);
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity, scale: index === 0 ? 1 : 0.95 }}
      drag={index === 0 && !showSelection && !confirmChoice && !isEnded ? "x" : false} 
      className={`absolute w-full max-w-sm h-80 rounded-3xl shadow-xl border bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-6 text-center z-${10-index}`}
      onDragEnd={(e, info) => {
        if (info.offset.x > 100 && !userHasVoted && !isEnded) setShowSelection(true);
        else if (info.offset.x < -100) onSwipe("left");
        else animate(x, 0, { duration: 0.2 });
      }}
    >
      {isEnded && <div className="absolute top-4 right-4 bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black">VOTE ENDED</div>}
      
      {showSelection && !confirmChoice && (
        <div className="absolute inset-0 z-40 bg-white/95 dark:bg-gray-900/95 flex flex-col items-center justify-center p-6">
             <h3 className="font-black mb-4 uppercase text-sm">Choose Option</h3>
             <div className="flex flex-col gap-3 w-full">
                <button onClick={() => setConfirmChoice(1)} className="w-full py-4 bg-blue-50 border border-blue-200 text-blue-700 font-bold rounded-xl">{opt1}</button>
                <button onClick={() => setConfirmChoice(2)} className="w-full py-4 bg-pink-50 border border-pink-200 text-pink-700 font-bold rounded-xl">{opt2}</button>
                <button onClick={() => { setShowSelection(false); x.set(0); }} className="mt-2 text-xs text-gray-400">Cancel</button>
             </div>
        </div>
      )}

      {confirmChoice && (
        <div className="absolute inset-0 z-50 bg-white/95 dark:bg-gray-900/95 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-xl font-black mb-6">"{confirmChoice === 1 ? opt1 : opt2}"</p>
            {canUsePaymaster && (
                <div className={`mb-6 flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer border ${usePaymaster ? 'bg-blue-600 border-blue-600 text-white shadow-blue-500/20' : 'bg-gray-100 text-gray-400'}`} onClick={() => setUsePaymaster(!usePaymaster)}>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${usePaymaster ? 'bg-white' : 'bg-transparent'}`}>
                        {usePaymaster && <MdCheckCircle className="text-blue-600 text-[10px]" />}
                    </div>
                    <span className="text-[10px] font-black uppercase">GAS SPONSORED <MdBolt className={usePaymaster ? "text-yellow-300 animate-pulse" : ""} /></span>
                </div>
            )}
            <button onClick={handleFinalVote} disabled={isVotingLoading} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all">SIGN & VOTE</button>
            <button onClick={() => setConfirmChoice(null)} className="mt-4 text-xs text-gray-400">Back</button>
        </div>
      )}

      <div className={`mb-4 p-4 rounded-full ${userHasVoted ? 'bg-green-100 text-green-600' : 'bg-gray-50 text-blue-500'}`}>
        {userHasVoted ? <MdCheckCircle className="text-4xl" /> : <MdHowToVote className="text-4xl" />}
      </div>
      <h3 className="text-2xl font-black leading-tight">{question}</h3>
      {userHasVoted && <p className="text-[10px] text-green-500 font-black mt-2 uppercase">Already Voted</p>}
    </motion.div>
  );
});

export default SwipeCard;