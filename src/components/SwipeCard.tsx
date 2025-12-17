"use client";

import { useState, memo } from "react";
// HAPUS useCapabilities (Balik ke import standar)
import { useReadContract, useAccount, useWriteContract } from "wagmi"; 
import { useSendCalls } from "wagmi/experimental"; 
import { POLL_ABI } from "~/app/constants";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { MdHowToVote, MdArrowBack, MdArrowForward, MdCheckCircle, MdThumbUp, MdTouchApp } from "react-icons/md";
import { useTheme } from "next-themes"; 
import { encodeFunctionData } from "viem";
import { Attribution } from "ox/erc8021";

interface Props {
  address: string;
  onSwipe: (direction: "left" | "right") => void;
  index: number;
}

const SwipeCard = memo(function SwipeCard({ address, onSwipe, index }: Props) {
  const { resolvedTheme } = useTheme();
  const [showSelection, setShowSelection] = useState(false);
  const [confirmChoice, setConfirmChoice] = useState<number | null>(null);
  const [isVotingLoading, setIsVotingLoading] = useState(false);

  const { address: userAddress } = useAccount();

  // 1. WAGMI HOOKS
  const { sendCallsAsync } = useSendCalls();         
  const { writeContractAsync } = useWriteContract(); 

  const { data: pollData } = useReadContract({
    address: address as `0x${string}`,
    abi: POLL_ABI,
    functionName: "getPollInfo",
    query: { staleTime: 1000 * 60 * 5 }
  });

  const { data: hasVoted, isLoading: isLoadingVote } = useReadContract({
    address: address as `0x${string}`,
    abi: POLL_ABI,
    functionName: "hasVoted",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress, staleTime: 1000 * 60 * 5 }
  });

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const bgLight = useTransform(x, [-200, 0, 200], ["#fee2e2", "#ffffff", "#dbeafe"]);
  const bgDark = useTransform(x, [-200, 0, 200], ["#450a0a", "#1f2937", "#172554"]);
  const activeBg = resolvedTheme === "dark" ? bgDark : bgLight;

  if (!pollData) return <div className="hidden">Loading...</div>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [question, opt1, count1, opt2, count2] = pollData as any;
  const total = Number(count1) + Number(count2);
  const scale = index === 0 ? 1 : 0.95;
  const y = index === 0 ? 0 : 10;
  const userHasVoted = Boolean(hasVoted);

  const handleFinalVote = async () => {
    if (!confirmChoice || isVotingLoading) return;
    setIsVotingLoading(true); 

    const onSuccessUI = async () => {
        setIsVotingLoading(false);
        await animate(x, 500, { duration: 0.2 });
        onSwipe("right");
        setConfirmChoice(null);
        setShowSelection(false);
    };

    try {
        console.log("🗳️ Vote (Mode: Standard/BuilderCode)...");
        
        const encodedData = encodeFunctionData({
            abi: POLL_ABI,
            functionName: "vote",
            args: [confirmChoice]
        });

        // METHOD 1: useSendCalls (Builder Code Only)
        // Tanpa Paymaster -> Base App biasanya tetap mensponsori vote ini secara native
        await sendCallsAsync({
            calls: [{
                to: address as `0x${string}`,
                data: encodedData,
            }],
            capabilities: {
                dataSuffix: Attribution.toDataSuffix({
                    codes: ["bc_2ivoo1oy"] // Builder Code Tetap Jalan
                })
            }
        });
        
        await onSuccessUI();

    } catch (error) {
        console.warn("⚠️ useSendCalls failed, fallback to writeContract...", error);
        
        try {
            // METHOD 2: FALLBACK (Standard EOA)
            await writeContractAsync({
                address: address as `0x${string}`,
                abi: POLL_ABI,
                functionName: "vote",
                args: [confirmChoice],
            });
            await onSuccessUI();
        } catch (finalError: any) {
            console.error("❌ Total Failure:", finalError);
            setIsVotingLoading(false); 
            if (!finalError.message.includes("User rejected")) {
                alert("Vote Failed. Check connection.");
            }
        }
    }
  };

  const selectedOptionName = confirmChoice === 1 ? opt1 : opt2;

  // ... (Return JSX sama persis seperti sebelumnya) ...
  return (
    <motion.div
      style={{ x, rotate, opacity, scale, y, backgroundColor: activeBg }}
      drag={index === 0 && !showSelection && !confirmChoice ? "x" : false} 
      dragConstraints={{ left: -1000, right: userHasVoted ? 0 : 1000 }}
      dragElastic={userHasVoted ? { right: 0 } : 0.5}
      className={`absolute w-full max-w-sm h-80 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-6 text-center z-${10 - index} overflow-hidden will-change-transform cursor-grab active:cursor-grabbing`}
      onDragEnd={async (e, info) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;
        if ((offset > 100 || velocity > 500) && !userHasVoted) {
            if (isLoadingVote) return;
            animate(x, 0, { duration: 0.2 });
            setShowSelection(true);
        } else if (offset < -100 || velocity < -500) {
            await animate(x, -500, { duration: 0.15 });
            onSwipe("left");
        } else {
            animate(x, 0, { duration: 0.2 });
        }
      }}
    >
      {showSelection && !confirmChoice && (
        <div className="absolute inset-0 z-40 bg-white/95 dark:bg-gray-900/95 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
             <div className="mb-4 text-blue-600 dark:text-blue-400"><MdTouchApp className="text-4xl" /></div>
             <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-4">Choose Option</h3>
             <div className="flex flex-col gap-3 w-full">
                <button onClick={() => setConfirmChoice(1)} className="w-full py-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold rounded-xl active:scale-95 transition-transform">{opt1}</button>
                <button onClick={() => setConfirmChoice(2)} className="w-full py-4 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300 font-bold rounded-xl active:scale-95 transition-transform">{opt2}</button>
                <button onClick={() => { setShowSelection(false); x.set(0); }} className="mt-2 text-sm text-gray-400 underline">Cancel</button>
             </div>
        </div>
      )}

      {confirmChoice && (
        <div className="absolute inset-0 z-50 bg-white/95 dark:bg-gray-900/95 flex flex-col items-center justify-center p-6 animate-in slide-in-from-right-10 duration-200">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 text-green-600 dark:text-green-400"><MdThumbUp className="text-3xl" /></div>
            <p className="text-xl font-black text-gray-900 dark:text-white mb-6 leading-tight px-4 border-l-4 border-blue-500">"{selectedOptionName}"</p>
            <div className="flex flex-col gap-3 w-full">
                <button 
                    onClick={handleFinalVote} 
                    disabled={isVotingLoading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                    {isVotingLoading ? "Confirming..." : <>Sign & Vote <MdCheckCircle /></>}
                </button>
                <button 
                    onClick={() => setConfirmChoice(null)} 
                    disabled={isVotingLoading}
                    className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-xl"
                >
                    Back
                </button>
            </div>
        </div>
      )}

      <div className={`mb-4 p-4 rounded-full ${userHasVoted ? 'bg-green-100 text-green-600' : 'bg-gray-50 dark:bg-gray-800 text-blue-500'}`}>
        {userHasVoted ? <MdCheckCircle className="text-4xl" /> : <MdHowToVote className="text-4xl" />}
      </div>
      <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-2 leading-tight">{question}</h3>
      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mt-2">{total} votes {userHasVoted && <span className="text-green-500 font-bold ml-1">(Voted)</span>}</p>
      
      <div className="absolute bottom-6 flex justify-between w-full px-8">
        <div className="flex items-center gap-1 text-red-400/80 dark:text-red-500/80 font-black text-xs tracking-widest"><MdArrowBack /> SKIP</div>
        <div className={`flex items-center gap-1 font-black text-xs tracking-widest ${userHasVoted ? 'text-gray-300 dark:text-gray-600' : 'text-blue-500/80 dark:text-blue-400/80'}`}>
            {userHasVoted ? "DONE" : "VOTE"} <MdArrowForward />
        </div>
      </div>
    </motion.div>
  );
});

export default SwipeCard;