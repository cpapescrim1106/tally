import React from "react";

interface ProgressBarProps {
  value: number;
  label?: string;
  colorClassName?: string;
  fillColor?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, label, colorClassName, fillColor }) => {
  const clamped = Math.min(Math.max(value, 0), 1);
  const width = `${Math.round(clamped * 100)}%`;

  return (
    <div className="w-full">
      {label && <div className="mb-1 text-xs text-warm-gray">{label}</div>}
      <div className="h-2 w-full rounded-full bg-warm-border/70">
        <div
          className={`h-2 rounded-full ${colorClassName || "bg-warm-peach"}`}
          style={fillColor ? { width, backgroundColor: fillColor } : { width }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
