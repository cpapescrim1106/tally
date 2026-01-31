import React from "react";
import type { MissionHealthStatus } from "@/types/mission";

interface HealthBadgeProps {
  status: MissionHealthStatus;
  score?: number;
  showScore?: boolean;
  className?: string;
}

const statusStyles: Record<MissionHealthStatus, { label: string; className: string; dot: string }> = {
  healthy: {
    label: "Healthy",
    className: "border-emerald-500/30 bg-emerald-500/15 text-emerald-200",
    dot: "bg-emerald-400"
  },
  watch: {
    label: "Watch",
    className: "border-amber-400/30 bg-amber-400/15 text-amber-200",
    dot: "bg-amber-300"
  },
  critical: {
    label: "Critical",
    className: "border-rose-500/30 bg-rose-500/15 text-rose-200",
    dot: "bg-rose-400"
  },
  done: {
    label: "Done",
    className: "border-sky-500/30 bg-sky-500/15 text-sky-200",
    dot: "bg-sky-300"
  },
  idle: {
    label: "Idle",
    className: "border-zinc-500/30 bg-zinc-500/15 text-zinc-200",
    dot: "bg-zinc-400"
  }
};

const HealthBadge: React.FC<HealthBadgeProps> = ({ status, score, showScore = false, className }) => {
  const style = statusStyles[status];
  const scoreLabel = showScore && typeof score === "number" ? ` ${Math.round(score)}%` : "";
  const ariaLabel = `Health: ${style.label}${scoreLabel}`;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${style.className} ${
        className || ""
      }`}
      aria-label={ariaLabel}
    >
      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
      {style.label}
      {showScore && typeof score === "number" && (
        <span className="text-[0.7rem] text-white/70">{Math.round(score)}%</span>
      )}
    </span>
  );
};

export default HealthBadge;
