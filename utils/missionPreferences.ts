import type { MissionView } from "@/types/mission";

export const MISSION_VIEW_KEY = "tally_mission_view";

export function getMissionViewPreference(): MissionView | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(MISSION_VIEW_KEY);
  return stored as MissionView | null;
}

export function setMissionViewPreference(view: MissionView) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MISSION_VIEW_KEY, view);
}
