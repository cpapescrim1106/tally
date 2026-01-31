import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { VirtuosoGrid } from "react-virtuoso";
import { format, parseISO } from "date-fns";
import Layout from "@/components/layout/Layout";
import MissionHeader from "@/components/mission/MissionHeader";
import ProjectCard from "@/components/mission/ProjectCard";
import { useProjects } from "@/hooks/useProjects";
import type { MissionProject } from "@/types/mission";

const TilesGridList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, children }, ref) => (
    <div
      ref={ref}
      style={style}
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      {children}
    </div>
  )
);

TilesGridList.displayName = "TilesGridList";

const TilesGridItem: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props} className="h-full">
    {children}
  </div>
);

TilesGridItem.displayName = "TilesGridItem";

const gridComponents = { List: TilesGridList, Item: TilesGridItem };

const TilesView: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { projects, totals, isLoading, error, refresh } = useProjects();
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  const formatDate = (value: string | null) => {
    if (!value) return null;
    try {
      return format(parseISO(value), "MMM d");
    } catch {
      return null;
    }
  };

  const renderExpandedFooter = (project: MissionProject) => {
    const activityLabel = formatDate(project.lastActivityAt) || "No activity";
    const statusLabel = project.stale ? "Stale" : project.activeCount === 0 ? "Done" : "Active";
    return (
      <div className="grid grid-cols-2 gap-3 text-xs text-warm-gray">
        <div>
          <div className="text-white font-semibold">{project.dueSoonCount}</div>
          Due soon
        </div>
        <div>
          <div className="text-white font-semibold">{activityLabel}</div>
          Last activity
        </div>
        <div>
          <div className="text-white font-semibold">{statusLabel}</div>
          Status
        </div>
        <div>
          <div className="text-white font-semibold">{Math.round(project.healthScore)}%</div>
          Health score
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (!session && status !== "loading") {
      router.push("/sign-in");
    }
  }, [router, session, status]);

  if (!session && status !== "loading") {
    return null;
  }

  return (
    <Layout title="Mission Control | Tiles | Tally" description="Bento grid project overview in Tally">
      <div className="min-h-screen bg-warm-black">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <MissionHeader
            title="Tiles"
            description="Dense grid of project health, progress, and due signals."
            actions={(
              <div className="flex items-center gap-3 text-xs text-warm-gray">
                <span>{projects.length} projects</span>
                <span>•</span>
                <span>{totals.overdueCount} overdue</span>
                <button
                  onClick={refresh}
                  className="ml-2 rounded-full border border-warm-border px-3 py-1 text-xs text-warm-gray hover:text-white hover:border-warm-peach/60"
                >
                  Refresh
                </button>
              </div>
            )}
          />

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-200">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-44 rounded-2xl border border-warm-border bg-warm-card animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="h-[70vh]">
              <VirtuosoGrid
                data={projects}
                components={gridComponents}
                itemContent={(_, project) => {
                  const isExpanded = expandedProjectId === project.id;
                  return (
                    <ProjectCard
                      project={project}
                      onClick={() =>
                        setExpandedProjectId(isExpanded ? null : project.id)
                      }
                      footer={isExpanded ? renderExpandedFooter(project) : null}
                    />
                  );
                }}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TilesView;
