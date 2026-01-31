import React from "react";

interface ProgressBarProps {
  value: number;
  label?: string;
  colorClassName?: string;
  fillColor?: string;
  showValue?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  colorClassName,
  fillColor,
  showValue
}) => {
  const normalizedValue = value > 1 ? value / 100 : value;
  const clamped = Math.min(Math.max(normalizedValue, 0), 1);
  const percent = Math.round(clamped * 100);
  const width = `${percent}%`;
  const resolvedShowValue = showValue ?? Boolean(label);

  return (
    <div className="w-full">
      {(label || resolvedShowValue) && (
        <div
          className={`mb-1 flex items-center text-xs text-warm-gray ${
            label ? "justify-between" : "justify-end"
          }`}
        >
          {label && <span>{label}</span>}
          {resolvedShowValue && <span>{percent}%</span>}
        </div>
      )}
      <div
        className="h-2 w-full rounded-full bg-warm-border/70"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={label || "Progress"}
      >
        <div
          className={`h-2 rounded-full ${colorClassName || "bg-warm-peach"}`}
          style={fillColor ? { width, backgroundColor: fillColor } : { width }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
