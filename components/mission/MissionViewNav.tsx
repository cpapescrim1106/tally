import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { MissionView } from "@/types/mission";
import { setMissionViewPreference } from "@/utils/missionPreferences";

const views: { key: MissionView; label: string; href: string }[] = [
  { key: "kanban", label: "Kanban", href: "/mission/kanban" },
  { key: "timeline", label: "Timeline", href: "/mission/timeline" },
  { key: "tiles", label: "Tiles", href: "/mission/tiles" },
  { key: "matrix", label: "Matrix", href: "/mission/matrix" }
];

const MissionViewNav: React.FC = () => {
  const router = useRouter();
  const currentView = router.pathname.split("/")[2] as MissionView | undefined;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (currentView && views.some((view) => view.key === currentView)) {
      setMissionViewPreference(currentView);
    }
  }, [currentView]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {views.map((view) => {
        const isActive = currentView === view.key;
        return (
          <Link
            key={view.key}
            href={view.href}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold no-underline transition ${
              isActive
                ? "border-warm-peach/60 bg-warm-peach/10 text-warm-peach"
                : "border-warm-border text-warm-gray hover:text-white hover:border-warm-peach/40"
            }`}
            onClick={() => setMissionViewPreference(view.key)}
          >
            {view.label}
          </Link>
        );
      })}
    </div>
  );
};

export { views };
export default MissionViewNav;
