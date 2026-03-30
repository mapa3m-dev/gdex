"use client";

import { useMemo } from "react";
import { DifficultyEasy, DifficultyNormal, DifficultyHard, DifficultyHarder, DifficultyInsane, DifficultyDemon, DifficultyNA } from "@/components/icons";

interface DifficultyIconProps {
  difficulty: string;
  className?: string;
}

export function DifficultyIcon({ difficulty, className = "w-8 h-8" }: DifficultyIconProps) {
  const icon = useMemo(() => {
    const diff = difficulty.toLowerCase();
    
    if (diff.includes("easy") && !diff.includes("demon")) return <DifficultyEasy className={className} />;
    if (diff === "normal" || diff === "medium") return <DifficultyNormal className={className} />;
    if (diff.includes("hard") && !diff.includes("demon")) return <DifficultyHard className={className} />;
    if (diff.includes("harder")) return <DifficultyHarder className={className} />;
    if (diff.includes("insane") && !diff.includes("demon")) return <DifficultyInsane className={className} />;
    if (diff.includes("demon")) {
      if (diff.includes("extreme")) return <DifficultyDemon className={`${className} text-red-600`} />;
      if (diff.includes("hard")) return <DifficultyDemon className={`${className} text-orange-500`} />;
      if (diff.includes("medium")) return <DifficultyDemon className={`${className} text-yellow-500`} />;
      if (diff.includes("easy")) return <DifficultyDemon className={`${className} text-green-500`} />;
      return <DifficultyDemon className={`${className} text-red-500`} />;
    }
    if (diff === "auto") return <DifficultyNA className={className} />;
    if (diff === "n/a" || !diff) return <DifficultyNA className={className} />;
    
    return <DifficultyNA className={className} />;
  }, [difficulty, className]);

  return icon;
}
