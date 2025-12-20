"use client";

import { useState, useMemo } from "react";
import { useSendCalls, useCapabilities } from "wagmi/experimental";
import { useWriteContract, useAccount } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import { MdCheckCircle, MdBolt, MdAccessTime } from "react-icons/md";
import { encodeFunctionData } from "viem";
import { Attribution } from "ox/erc8021";

export default function CreateQuest({ onSuccess }: { onSuccess: () => void }) {
  const [question, setQuestion] = useState("");
  const [opt1, setOpt1] = useState("");
  const [opt2, setOpt2] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usePaymaster, setUsePaymaster] = useState(true);

  // STATE DURASI: Default 1 Hari (86400 detik)
  const [duration, setDuration] = useState(86400);

  const { address: userAddress, chain } = useAccount();
  const { data: availableCapabilities } = useCapabilities({ account: userAddress });
  const { sendCallsAsync } = useSendCalls(); 
  const { writeContractAsync } = useWriteContract();

  const canUsePaymaster = useMemo(() => {
    if (!availableCapabilities || !chain) return false;
    const capabilitiesForChain = availableCapabilities[chain.id];
    return !!capabilitiesForChain?.["paymasterService"]?.supported && !!process.env.NEXT_PUBLIC_PAYMASTER_URL;
  }, [availableCapabilities, chain]);

  // FIX TYPE ERROR
  const capabilities = useMemo(() => {
    const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;
    if (usePaymaster && canUsePaymaster && paymasterUrl) {
        return {
          paymasterService: { url: paymasterUrl },
          dataSuffix: Attribution.toDataSuffix({ codes: ["bc_2ivoo1oy"] })
        };
    }
    return { dataSuffix: Attribution.toDataSuffix({ codes: ["bc_2ivoo1oy"] }) };
  }, [canUsePaymaster, usePaymaster]);

  const handleCreate = async () => {
    if (!question || !opt1 || !opt2) return;
    setIsSubmitting(true);
    try {
        const encodedData = encodeFunctionData({
            abi: FACTORY_ABI,
            functionName: "createPoll",
            args: [question, opt1, opt2, BigInt(duration)] 
        });

        await sendCallsAsync({
            calls: [{ to: FACTORY_ADDRESS as `0x${string}`, data: encodedData }],
            // Cast as any untuk menghindari error type strict dari viem
            capabilities: capabilities as any
        });
        
        onSuccess();
        // Reset Form
        setQuestion("");
        setOpt1("");
        setOpt2("");
    } catch (err) {
        try {
            await writeContractAsync({
                address: FACTORY_ADDRESS as `0x${string}`,
                abi: FACTORY_ABI,
                functionName: "createPoll",
                args: [question, opt1, opt2, BigInt(duration)]
            });
            onSuccess();
        } catch (e) {
            console.error(e);
        }
    } finally {
        setIsSubmitting(false); 
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-3xl shadow-lg">
      <div className="flex flex-col gap-4">
        <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Question</label>
            <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Poll Question" className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-800 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
            <input value={opt1} onChange={(e) => setOpt1(e.target.value)} placeholder="Yes" className="p-3 bg-blue-50/50 dark:bg-blue-900/10 border rounded-xl outline-none" />
            <input value={opt2} onChange={(e) => setOpt2(e.target.value)} placeholder="No" className="p-3 bg-pink-50/50 dark:bg-pink-900/10 border rounded-xl outline-none" />
        </div>

        {/* SELEKTOR DURASI: 4 PILIHAN */}
        <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-1 mb-2">
                <MdAccessTime /> Duration
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                    { label: '1 Day', value: 86400 },
                    { label: '1 Week', value: 604800 },
                    { label: '1 Month', value: 2592000 }, // 30 Hari
                    { label: '1 Year', value: 31536000 }
                ].map((item) => (
                    <button
                        key={item.value}
                        onClick={() => setDuration(item.value)}
                        className={`py-2 text-[10px] font-black rounded-lg border transition-all ${
                            duration === item.value 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 text-gray-400'
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </div>

        {/* GAS SPONSORED: BIRU SOLID SAAT AKTIF */}
        {canUsePaymaster && (
            <div className="flex justify-center mt-2">
                <div 
                    className={`flex items-center gap-2 px-5 py-2 rounded-full cursor-pointer transition-all border shadow-sm ${
                        usePaymaster ? 'bg-blue-600 border-blue-600 text-white shadow-blue-500/20' : 'bg-gray-100 text-gray-500'
                    }`} 
                    onClick={() => setUsePaymaster(!usePaymaster)}
                >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${usePaymaster ? 'bg-white' : 'bg-transparent'}`}>
                        {usePaymaster && <MdCheckCircle className="text-blue-600 text-[10px]" />}
                    </div>
                    <span className="text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                       GAS SPONSORED <MdBolt className={usePaymaster ? "text-yellow-300 animate-pulse" : ""} />
                    </span>
                </div>
            </div>
        )}

        <button onClick={handleCreate} disabled={isSubmitting || !question} className="mt-2 w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95">
            {isSubmitting ? "Creating..." : "Create Poll"}
        </button>
      </div>
    </div>
  );
}