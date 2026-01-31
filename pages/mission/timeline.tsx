import React, { useEffect, useMemo, useState } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import {
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek
} from "date-fns";
import Layout from "@/components/layout/Layout";
import MissionHeader from "@/components/mission/MissionHeader";
import { useProjects } from "@/hooks/useProjects";

type ZoomLevel = "week" | "month" | "quarter";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const TimelineView: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { projects, isLoading, error } = useProjects();
  const [zoom, setZoom] = useState<ZoomLevel>("month");

  const range = useMemo(() => {
    const today = startOfDay(new Date());
    if (zoom === "week") {
      const start = startOfWeek(today, { weekStartsOn: 1 });
      return { start, end: addWeeks(start, 6) };
    }
    if (zoom === "quarter") {
      const start = startOfQuarter(today);
      return { start, end: addMonths(start, 12) };
    }
    const start = startOfMonth(today);
    return { start, end: addMonths(start, 6) };
  }, [zoom]);

  const totalDays = Math.max(1, differenceInCalendarDays(range.end, range.start));
  const todayOffset = clamp(
    (differenceInCalendarDays(new Date(), range.start) / totalDays) * 100,
    0,
    100
  );

  const ticks = useMemo(() => {
    const result: Array<{ label: string; offset: number }> = [];
    let cursor = range.start;
    while (isBefore(cursor, range.end) || cursor.getTime() === range.end.getTime()) {
      result.push({
        label: zoom === "week" ? format(cursor, "MMM d") : format(cursor, "MMM yyyy"),
        offset: clamp((differenceInCalendarDays(cursor, range.start) / totalDays) * 100, 0, 100)
      });
      cursor = zoom === "week" ? addWeeks(cursor, 1) : addMonths(cursor, zoom === "quarter" ? 3 : 1);
    }
    return result;
  }, [range, totalDays, zoom]);

  useEffect(() => {
    if (!session && status !== "loading") {
      router.push("/sign-in");
    }
  }, [router, session, status]);

  if (!session && status !== "loading") {
    return null;
  }

  return (
    <Layout title="Mission Control | Timeline | Tally" description="Project timeline roadmap view in Tally">
      <div className="min-h-screen bg-warm-black">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <MissionHeader
            title="Timeline"
            description="Map projects against their due-date spans and watch the runway."
            actions={(
              <div className="flex items-center gap-2">
                {(["week", "month", "quarter"] as ZoomLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setZoom(level)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      zoom === level
                        ? "border-warm-peach/60 bg-warm-peach/10 text-warm-peach"
                        : "border-warm-border text-warm-gray hover:text-white"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            )}
          />

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-200">
              {error}
            </div>
          )}

          <div className="rounded-2xl border border-warm-border bg-warm-card/80 p-6">
            <div className="relative mb-8">
              <div className="h-6" />
              {ticks.map((tick) => (
                <div
                  key={tick.label}
                  className="absolute top-0 text-xs text-warm-gray"
                  style={{ left: `${tick.offset}%` }}
                >
                  {tick.label}
                </div>
              ))}
              <div
                className="absolute top-0 h-full w-0.5 bg-white/40"
                style={{ left: `${todayOffset}%` }}
              />
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-8 rounded-xl bg-warm-border/40 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => {
                  const earliest = project.earliestDue ? parseISO(project.earliestDue) : null;
                  const latest = project.latestDue ? parseISO(project.latestDue) : null;

                  if (!earliest || !latest) {
                    return (
                      <div key={project.id} className="grid grid-cols-[200px_1fr] gap-4 items-center">
                        <div className="text-sm text-white font-medium">{project.name}</div>
                        <div className="text-xs text-warm-gray">No due dates</div>
                      </div>
                    );
                  }

                  const startOffset = clamp(
                    (differenceInCalendarDays(earliest, range.start) / totalDays) * 100,
                    0,
                    100
                  );
                  const endOffset = clamp(
                    (differenceInCalendarDays(latest, range.start) / totalDays) * 100,
                    0,
                    100
                  );
                  const width = Math.max(endOffset - startOffset, 1);
                  const overdue = isBefore(earliest, new Date());
                  const overdueEnd = overdue ? (isAfter(latest, new Date()) ? new Date() : latest) : null;
                  const overdueWidth = overdueEnd
                    ? clamp(
                        (differenceInCalendarDays(overdueEnd, range.start) / totalDays) * 100 - startOffset,
                        0,
                        width
                      )
                    : 0;

                  return (
                    <div key={project.id} className="grid grid-cols-[200px_1fr] gap-4 items-center">
                      <div className="text-sm text-white font-medium">
                        {project.name}
                        <div className="text-xs text-warm-gray">
                          {format(earliest, "MMM d")} → {format(latest, "MMM d")}
                        </div>
                      </div>
                      <div className="relative h-3 rounded-full bg-warm-border/70">
                        <div
                          className="absolute h-3 rounded-full bg-warm-peach"
                          style={{ left: `${startOffset}%`, width: `${width}%` }}
                        />
                        {overdue && overdueWidth > 0 && (
                          <div
                            className="absolute h-3 rounded-full bg-rose-500"
                            style={{ left: `${startOffset}%`, width: `${overdueWidth}%` }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TimelineView;
