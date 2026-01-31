import React from "react";
import MissionViewNav from "./MissionViewNav";

interface MissionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

const MissionHeader: React.FC<MissionHeaderProps> = ({ title, description, actions }) => {
  return (
    <header className="mb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-warm-gray">Mission Control</p>
          <h1 className="text-3xl font-semibold text-white mt-2">{title}</h1>
          {description && <p className="text-warm-gray text-sm mt-2">{description}</p>}
        </div>
        <div className="flex flex-col gap-3 items-start lg:items-end">
          <MissionViewNav />
          {actions}
        </div>
      </div>
    </header>
  );
};

export default MissionHeader;
