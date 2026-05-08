"use client";

import Image from "next/image";

type DifficultySlug =
  | "auto"
  | "na"
  | "easy"
  | "normal"
  | "hard"
  | "harder"
  | "insane"
  | "easy_demon"
  | "medium_demon"
  | "hard_demon"
  | "insane_demon"
  | "extreme_demon";

const DIFFICULTY_LABELS: Record<DifficultySlug, string> = {
  auto: "Auto",
  na: "N/A",
  easy: "Easy",
  normal: "Normal",
  hard: "Hard",
  harder: "Harder",
  insane: "Insane",
  easy_demon: "Easy Demon",
  medium_demon: "Medium Demon",
  hard_demon: "Hard Demon",
  insane_demon: "Insane Demon",
  extreme_demon: "Extreme Demon",
};

function classify(difficulty: string): DifficultySlug {
  const d = difficulty.toLowerCase().trim();
  if (d.includes("extreme")) return "extreme_demon";
  if (d.includes("insane") && d.includes("demon")) return "insane_demon";
  if (d.includes("hard") && d.includes("demon")) return "hard_demon";
  if (d.includes("medium") && d.includes("demon")) return "medium_demon";
  if (d.includes("easy") && d.includes("demon")) return "easy_demon";
  if (d.includes("demon")) return "hard_demon";
  if (d.includes("insane")) return "insane";
  if (d.includes("harder")) return "harder";
  if (d.includes("hard")) return "hard";
  if (d === "normal" || d === "medium") return "normal";
  if (d.includes("easy")) return "easy";
  if (d === "auto") return "auto";
  return "na";
}

interface DifficultyIconProps {
  difficulty: string;
  className?: string;
  size?: number;
}

export function DifficultyIcon({
  difficulty,
  className = "w-8 h-8",
  size = 80,
}: DifficultyIconProps): React.ReactElement {
  const slug = classify(difficulty);
  const label = DIFFICULTY_LABELS[slug];
  return (
    <Image
      src={`/icons/difficulty/${slug}.svg`}
      alt={label}
      title={label}
      width={size}
      height={size}
      className={`${className} animate-gd-bounce-in`}
      priority={false}
    />
  );
}
