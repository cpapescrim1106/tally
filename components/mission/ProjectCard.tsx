import React from "react";
import { format, parseISO } from "date-fns";
import type { MissionProjectStats } from "@/types/mission";
import { colorNameToHex } from "@/utils/projectUtils";
import HealthBadge from "./HealthBadge";
import ProgressBar from "./ProgressBar";

interface ProjectCardProps {
  project: MissionProjectStats;
  compact?: boolean;
  onClick?: () => void;
  footer?: React.ReactNode;
}

const formatDate = (value: string | null) => {
  if (!value) return null;
  try {
    return format(parseISO(value), "MMM d");
  } catch {
    return null;
  }
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, compact = false, onClick, footer }) => {
  const borderColor = colorNameToHex(project.color, "55") || undefined;
  const accentColor = colorNameToHex(project.color) || undefined;
  const dueLabel = formatDate(project.nextDue) || "No due dates";

  return (
    <div
      className={`rounded-2xl border bg-warm-card p-4 shadow-sm transition hover:border-warm-peach/40 ${
        onClick ? "cursor-pointer" : ""
      }`}
      style={{ borderColor }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{project.name}</h3>
          <p className="text-xs text-warm-gray">Next due: {dueLabel}</p>
        </div>
        <HealthBadge status={project.healthStatus} score={project.healthScore} showScore={!compact} />
      </div>

      <div className="mt-4">
        <ProgressBar
          value={project.completionRate}
          {...(accentColor ? { fillColor: accentColor } : {})}
          {...(compact ? {} : { label: "This week" })}
        />
        <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-warm-gray">
          <div>
            <div className="text-white font-semibold">{project.activeCount}</div>
            Active
          </div>
          <div>
            <div className="text-white font-semibold">{project.overdueCount}</div>
            Overdue
          </div>
          <div>
            <div className="text-white font-semibold">{project.completedThisWeek}</div>
            Done
          </div>
        </div>
      </div>

      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
};

export default ProjectCard;
