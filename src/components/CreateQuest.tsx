"use client";

import { useState, useMemo, useEffect } from "react";
import { useSendCalls, useCapabilities } from "wagmi/experimental";
import { useWriteContract, useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import { MdCheckCircle, MdBolt } from "react-icons/md";
import { encodeFunctionData } from "viem";
import { Attribution } from "ox/erc8021";

export default function CreateQuest({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState("");
  const [opt1, setOpt1] = useState("");
  const [opt2, setOpt2] = useState("");
  const [duration, setDuration] = useState(86400); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usePaymaster, setUsePaymaster] = useState(true);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { address: userAddress, chain } = useAccount();
  const { data: availableCapabilities } = useCapabilities({ account: userAddress });
  const { sendCallsAsync } = useSendCalls(); 
  const { writeContractAsync } = useWriteContract();

  // Menunggu konfirmasi transaksi agar data masuk ke blockchain sebelum refresh feed
  const { isSuccess: isTxConfirmed, isLoading: isWaiting } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Jika transaksi sukses dikonfirmasi di blockchain
  useEffect(() => {
    if (isTxConfirmed) {
      queryClient.invalidateQueries({ queryKey: ['readContract'] }); // Hapus cache data lama
      onSuccess();
      setQuestion(""); setOpt1(""); setOpt2("");
      setIsSubmitting(false);
      setTxHash(undefined);
    }
  }, [isTxConfirmed, queryClient, onSuccess]);

  const canUsePaymaster = useMemo(() => {
    if (!availableCapabilities || !chain) return false;
    return !!availableCapabilities[chain.id]?.["paymasterService"]?.supported && !!process.env.NEXT_PUBLIC_PAYMASTER_URL;
  }, [availableCapabilities, chain]);

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

        // Catatan: sendCallsAsync mengembalikan bundle ID, untuk kepastian data, kita pakai writeContract sebagai fallback atau receipt
        const result = await sendCallsAsync({
            calls: [{ to: FACTORY_ADDRESS as `0x${string}`, data: encodedData }],
            capabilities: capabilities as any
        });
        
        // Sambil menunggu indexing (karena sendCalls receipt berbeda), kita beri delay atau manual refresh
        setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['readContract'] });
            onSuccess();
            setIsSubmitting(false);
        }, 3000);

    } catch (err) {
        try {
            const hash = await writeContractAsync({
                address: FACTORY_ADDRESS as `0x${string}`,
                abi: FACTORY_ABI,
                functionName: "createPoll",
                args: [question, opt1, opt2, BigInt(duration)]
            });
            setTxHash(hash); // Memicu useWaitForTransactionReceipt
        } catch (innerErr) {
            setIsSubmitting(false);
        }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border p-6 rounded-3xl shadow-lg flex flex-col gap-4">
      <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Question..." className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none" />
      <div className="grid grid-cols-2 gap-3">
          <input value={opt1} onChange={(e) => setOpt1(e.target.value)} placeholder="Option 1" className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl" />
          <input value={opt2} onChange={(e) => setOpt2(e.target.value)} placeholder="Option 2" className="p-3 bg-pink-50/50 dark:bg-pink-900/10 rounded-xl" />
      </div>

      <div className="grid grid-cols-4 gap-2">
    {[ 
        {l: '1D', v: 86400}, 
        {l: '1W', v: 604800}, 
        {l: '1M', v: 2592000},
        {l: '1Y', v: 31536000} 
    ].map((d) => (
        <button 
            key={d.v} 
            onClick={() => setDuration(d.v)} 
            className={`py-2 text-[10px] font-black rounded-lg border transition-all ${duration === d.v ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-50 text-gray-400'}`}
        >
            {d.l}
        </button>
    ))}
</div>

      {canUsePaymaster && (
          <div className="flex justify-center mt-2">
              <div className={`flex items-center gap-2 px-5 py-2 rounded-full cursor-pointer border ${usePaymaster ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-100 text-gray-500 border-transparent'}`} onClick={() => setUsePaymaster(!usePaymaster)}>
                  <span className="text-[10px] font-black uppercase flex items-center gap-1">GAS SPONSORED <MdBolt className={usePaymaster ? "text-yellow-300 animate-pulse" : ""} /></span>
              </div>
          </div>
      )}

      <button onClick={handleCreate} disabled={isSubmitting || isWaiting || !question} className="mt-2 w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl active:scale-95 disabled:opacity-50">
          {isSubmitting || isWaiting ? (isWaiting ? "CONFIRMING ON CHAIN..." : "CREATING...") : "CREATE POLL"}
      </button>
    </div>
  );
}