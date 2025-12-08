"use client";

import React, { useState } from 'react';
import { motion } from "framer-motion";

interface Props {
  onRefresh: () => void;
}

// 0 = Top, 1 = Right, 2 = Bottom, 3 = Left
type CycleStage = 0 | 1 | 2 | 3;

const CycleMeme: React.FC<Props> = ({ onRefresh }) => {
    // Stage Visual (Lingkaran)
    const [stage, setStage] = useState<CycleStage>(0); 
    
    // Stage Tombol (0 = Push Me, 4 = LFG)
    const [clickCount, setClickCount] = useState(0);

    const buttonTexts = [
        "Push Me",      // 0
        "Push Again",   // 1
        "Push Hard",    // 2
        "Harder!",      // 3
        "LFG"        // 4
    ];

    const handleInteraction = () => {
        // Jika sudah di tahap terakhir (LFG)
        if (clickCount === 4) {
            onRefresh(); // Balik ke Feed
            setClickCount(0); // Reset tombol
            return;
        }

        // Lanjut ke tahap berikutnya
        setStage((prev) => (prev + 1) % 4 as CycleStage);
        setClickCount((prev) => prev + 1);
    };

    // Helper warna teks visual
    const getTextColor = (index: number) => {
        if (stage !== index) return "text-gray-300 dark:text-gray-700 scale-90 blur-[1px] font-medium"; 
        
        if (index === 0 || index === 1) { // Over
            return "text-red-600 dark:text-red-500 scale-110 font-black drop-shadow-sm";
        } else { // Back
            return "text-green-600 dark:text-green-400 scale-110 font-black drop-shadow-sm";
        }
    };

    return (
        <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center mx-auto my-4">
            
            {/* === 1. GAMBAR PANAH SIKLUS (SVG) === */}
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

            {/* === 2. TEKS POSISI === */}
            <motion.div className={`absolute top-0 transition-all duration-300 ${getTextColor(0)}`}>
                it's over
            </motion.div>
            <motion.div className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 text-center w-24 transition-all duration-300 ${getTextColor(1)}`}>
                it's so<br/>over
            </motion.div>
            <motion.div className={`absolute bottom-0 transition-all duration-300 ${getTextColor(2)}`}>
                we're back
            </motion.div>
            <motion.div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 text-center w-24 transition-all duration-300 ${getTextColor(3)}`}>
                we're so<br/>back
            </motion.div>

            {/* === 3. TOMBOL TENGAH (SATU-SATUNYA INTERAKSI) === */}
            <div className="z-10 flex flex-col items-center">
                <button 
                    onClick={handleInteraction}
                    className={`border-2 text-xs font-bold px-6 py-3 rounded-full shadow-xl active:scale-90 transition-all text-white ${
                        clickCount === 4 
                        ? "bg-blue-600 border-blue-500 hover:bg-blue-700 scale-110 animate-bounce" // Gaya LFG (Spesial)
                        : stage === 0 || stage === 1 
                            ? "bg-red-600 border-red-700 hover:bg-red-700" // Gaya Merah
                            : "bg-green-600 border-green-700 hover:bg-green-700" // Gaya Hijau
                    }`}
                >
                    {buttonTexts[clickCount]}
                </button>
            </div>

        </div>
    );
};

export default CycleMeme;