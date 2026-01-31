import React, { useEffect, useMemo, useState } from "react";
import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Layout from "@/components/layout/Layout";
import MissionHeader from "@/components/mission/MissionHeader";
import { views } from "@/components/mission/MissionViewNav";
import { useProjects } from "@/hooks/useProjects";
import type { MissionView } from "@/types/mission";
import { getMissionViewPreference, setMissionViewPreference } from "@/utils/missionPreferences";

const viewDescriptions: Record<MissionView, { title: string; description: string; hint: string }> = {
  kanban: {
    title: "Kanban Board",
    description: "Drag projects between status lanes and spot blockers fast.",
    hint: "Best for flow management"
  },
  timeline: {
    title: "Timeline Roadmap",
    description: "See project spans by due date and plan ahead.",
    hint: "Best for planning horizons"
  },
  tiles: {
    title: "Bento Tiles",
    description: "Compact health and progress cards for every project.",
    hint: "Best for scanning"
  },
  matrix: {
    title: "Status Matrix",
    description: "Sortable table for deep triage across many projects.",
    hint: "Best for operations"
  }
};

const MissionIndex: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { projects, totals, isLoading } = useProjects();
  const [preferredView, setPreferredView] = useState<MissionView | null>(null);
  const [selectedView, setSelectedView] = useState<MissionView>(views[0]?.key ?? "kanban");

  useEffect(() => {
    if (!session && status !== "loading") {
      router.push("/sign-in");
    }
  }, [router, session, status]);

  useEffect(() => {
    const stored = getMissionViewPreference();
    if (stored) {
      setPreferredView(stored);
      setSelectedView(stored);
    }
  }, []);

  const handleViewSwitch = (nextView: MissionView) => {
    setSelectedView(nextView);
    setPreferredView(nextView);
    setMissionViewPreference(nextView);
    const nextHref = views.find((view) => view.key === nextView)?.href ?? "/mission";
    router.push(nextHref);
  };

  const stats = useMemo(() => ([
    { label: "Projects", value: projects.length },
    { label: "Active Tasks", value: totals.activeCount },
    { label: "Overdue", value: totals.overdueCount },
    { label: "Due Soon", value: totals.dueSoonCount }
  ]), [projects.length, totals]);

  if (!session) {
    return null;
  }

  return (
    <Layout title="Mission Control | Tally" description="Mission Control overview for Tally">
      <div className="min-h-screen bg-warm-black">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <MissionHeader
            title="Choose a Mission View"
            description="Pick the visualization that fits how you plan and track projects."
          />

          <div className="mb-8 rounded-2xl border border-warm-border bg-warm-card/80 px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-warm-gray">View Switcher</p>
                <p className="text-sm text-warm-gray mt-2">
                  Jump directly into the Mission view you need most.
                </p>
              </div>
              <select
                aria-label="Select a Mission view"
                value={selectedView}
                onChange={(event) => handleViewSwitch(event.target.value as MissionView)}
                className="rounded-full border border-warm-border bg-warm-card px-4 py-2 text-xs font-semibold text-white"
              >
                {views.map((view) => (
                  <option key={view.key} value={view.key}>
                    {view.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-warm-border bg-warm-card px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-warm-gray">{stat.label}</p>
                <p className="text-2xl font-semibold text-white mt-2">
                  {isLoading ? "—" : stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {views.map((view) => {
              const description = viewDescriptions[view.key];
              const isPreferred = preferredView === view.key;
              return (
                <Link
                  key={view.key}
                  href={view.href}
                  className="group rounded-3xl border border-warm-border bg-warm-card/80 p-6 no-underline transition hover:border-warm-peach/60 hover:bg-warm-card"
                  onClick={() => setMissionViewPreference(view.key)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">{description.title}</h3>
                    {isPreferred && (
                      <span className="text-xs font-semibold text-warm-peach">Preferred</span>
                    )}
                  </div>
                  <p className="text-warm-gray mt-3">{description.description}</p>
                  <p className="text-xs text-warm-gray mt-4">{description.hint}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MissionIndex;
