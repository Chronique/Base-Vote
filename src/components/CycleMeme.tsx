"use client";

import React, { useState } from 'react';
import { motion } from "framer-motion";

interface Props {
  onRefresh: () => void;
}

// 0 = Top, 1 = Right, 2 = Bottom, 3 = Left
type CycleStage = 0 | 1 | 2 | 3;

const CycleMeme: React.FC<Props> = ({ onRefresh }) => {
    const [stage, setStage] = useState<CycleStage>(0); 
    const [clickCount, setClickCount] = useState(0);

    const buttonTexts = [
        "Push Me",      // 0
        "Push Again",   // 1
        "Push Hard",    // 2
        "Harder!",      // 3
        "LFG 🚀"        // 4
    ];

    const handleInteraction = () => {
        if (clickCount === 4) {
            onRefresh(); 
            setClickCount(0); 
            return;
        }
        setStage((prev) => (prev + 1) % 4 as CycleStage);
        setClickCount((prev) => prev + 1);
    };

    const getTextColor = (index: number) => {
        if (stage !== index) return "text-gray-300 dark:text-gray-700 scale-90 blur-[1px] font-medium"; 
        
        if (index === 0 || index === 1) { // Over
            return "text-red-600 dark:text-red-500 scale-110 font-black drop-shadow-sm";
        } else { // Back
            return "text-green-600 dark:text-green-400 scale-110 font-black drop-shadow-sm";
        }
    };

    return (
        // === 1. CONTAINER UTAMA (FIXED SIZE) ===
        // Ukuran disamakan dengan SwipeCard: w-full max-w-sm h-80
        <div className="relative w-full max-w-sm h-80 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 flex items-center justify-center mx-auto overflow-hidden">
            
            {/* Dekorasi Background (Opsional, biar cantik) */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl -translate-y-10 translate-x-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-100 dark:bg-pink-900/20 rounded-full blur-3xl translate-y-10 -translate-x-10 pointer-events-none"></div>

            {/* === 2. WRAPPER VISUAL (Agar elemen siklus tetap rapi di tengah) === */}
            <div className="relative w-64 h-64 flex items-center justify-center">
                
                {/* SVG PANAH */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50 dark:opacity-80" viewBox="0 0 200 200">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" className="fill-gray-400 dark:fill-gray-600" />
                        </marker>
                    </defs>
                    <path d="M 60 40 Q 100 10 140 40" fill="none" className="stroke-gray-300 dark:stroke-gray-700" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <path d="M 160 60 Q 190 100 160 140" fill="none" className="stroke-gray-300 dark:stroke-gray-700" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <path d="M 140 160 Q 100 190 60 160" fill="none" className="stroke-gray-300 dark:stroke-gray-700" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <path d="M 40 140 Q 10 100 40 60" fill="none" className="stroke-gray-300 dark:stroke-gray-700" strokeWidth="2" markerEnd="url(#arrowhead)" />
                </svg>

                {/* TEKS POSISI */}
                <motion.div className={`absolute top-0 transition-all duration-300 ${getTextColor(0)}`}>
                    it's over
                </motion.div>
                <motion.div className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 text-center w-20 leading-tight transition-all duration-300 ${getTextColor(1)}`}>
                    it's so<br/>over
                </motion.div>
                <motion.div className={`absolute bottom-0 transition-all duration-300 ${getTextColor(2)}`}>
                    we're back
                </motion.div>
                <motion.div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 text-center w-20 leading-tight transition-all duration-300 ${getTextColor(3)}`}>
                    we're so<br/>back
                </motion.div>

                {/* TOMBOL TENGAH */}
                <div className="z-10 flex flex-col items-center justify-center">
                    <button 
                        onClick={handleInteraction}
                        className={`border-2 text-xs font-bold px-6 py-3 rounded-full shadow-lg active:scale-95 transition-all text-white ${
                            clickCount === 4 
                            ? "bg-blue-600 border-blue-500 hover:bg-blue-700 scale-110 animate-pulse" 
                            : stage === 0 || stage === 1 
                                ? "bg-red-500 border-red-600 hover:bg-red-600" 
                                : "bg-green-500 border-green-600 hover:bg-green-600"
                        }`}
                    >
                        {buttonTexts[clickCount]}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CycleMeme;