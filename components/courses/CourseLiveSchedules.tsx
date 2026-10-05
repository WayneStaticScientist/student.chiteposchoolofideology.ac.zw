"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarClock, Radio } from "lucide-react";

export type CourseLiveSchedule = {
  _id: string;
  title: string;
  summary?: string;
  startTime: string;
  status: "scheduled" | "live" | "completed";
};

export type LiveSessionFilter = "all" | "live" | "upcoming" | "past";

type ScheduleBucket = "live" | "upcoming" | "past";

function bucketOf(schedule: CourseLiveSchedule, nowMs: number): ScheduleBucket {
  if (schedule.status === "live") return "live";
  if (schedule.status === "completed") return "past";
  const startMs = new Date(schedule.startTime).getTime();
  if (startMs < nowMs) return "past";
  return "upcoming";
}

export function partitionSchedules(schedules: CourseLiveSchedule[]) {
  const nowMs = Date.now();
  const live: CourseLiveSchedule[] = [];
  const upcoming: CourseLiveSchedule[] = [];
  const past: CourseLiveSchedule[] = [];

  for (const schedule of schedules) {
    const bucket = bucketOf(schedule, nowMs);
    if (bucket === "live") live.push(schedule);
    else if (bucket === "upcoming") upcoming.push(schedule);
    else past.push(schedule);
  }

  upcoming.sort(
    (a, b) =>
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );
  past.sort(
    (a, b) =>
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
  );

  return { live, upcoming, past };
}

function formatSessionDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ bucket }: { bucket: ScheduleBucket }) {
  if (bucket === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-secondary">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
        </span>
        Live
      </span>
    );
  }
  if (bucket === "upcoming") {
    return (
      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
        Upcoming
      </span>
    );
  }
  return (
    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
      Completed
    </span>
  );
}

function ScheduleCard({
  schedule,
  bucket,
  courseId,
}: {
  schedule: CourseLiveSchedule;
  bucket: ScheduleBucket;
  courseId: string;
}) {
  const isPast = bucket === "past";

  return (
    <article
      className={`flex flex-col gap-4 rounded-xl border p-5 md:flex-row md:items-center md:justify-between ${
        isPast
          ? "border-slate-200 bg-slate-50/80"
          : "border-slate-200 bg-white shadow-sm"
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <StatusBadge bucket={bucket} />
          <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
            <CalendarClock size={14} />
            {formatSessionDate(schedule.startTime)}
          </span>
        </div>
        <h3
          className={`text-lg font-bold ${isPast ? "text-slate-600" : "text-slate-800"}`}
        >
          {schedule.title}
        </h3>
        {schedule.summary && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
            {schedule.summary}
          </p>
        )}
      </div>

      {bucket === "live" && (
        <Link
          href={`/courses/${courseId}/live/${schedule._id}`}
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90"
        >
          Join session
        </Link>
      )}
      {bucket === "upcoming" && (
        <Link
          href={`/courses/${courseId}/live/${schedule._id}`}
          className="inline-flex shrink-0 items-center justify-center rounded-xl border-2 border-primary/30 bg-primary/5 px-5 py-2.5 text-sm font-bold text-primary hover:bg-primary/10"
        >
          Waiting room
        </Link>
      )}
      {bucket === "past" && (
        <span className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-400">
          Session ended
        </span>
      )}
    </article>
  );
}

const filterTabs: { id: LiveSessionFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "live", label: "Live now" },
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
];

export default function CourseLiveSchedules({
  schedules,
  courseId,
  defaultFilter = "all",
  showFilterTabs = true,
  showSectionHeader = true,
}: {
  schedules: CourseLiveSchedule[];
  courseId: string;
  defaultFilter?: LiveSessionFilter;
  showFilterTabs?: boolean;
  showSectionHeader?: boolean;
}) {
  const [filter, setFilter] = useState<LiveSessionFilter>(defaultFilter);
  const partitioned = useMemo(() => partitionSchedules(schedules), [schedules]);

  const counts = {
    all: schedules.length,
    live: partitioned.live.length,
    upcoming: partitioned.upcoming.length,
    past: partitioned.past.length,
  };

  const visibleList = useMemo(() => {
    const nowMs = Date.now();
    if (filter === "live") return partitioned.live;
    if (filter === "upcoming") return partitioned.upcoming;
    if (filter === "past") return partitioned.past;
    return schedules
      .map((s) => ({ schedule: s, bucket: bucketOf(s, nowMs) }))
      .sort((a, b) => {
        const order = { live: 0, upcoming: 1, past: 2 };
        if (order[a.bucket] !== order[b.bucket]) {
          return order[a.bucket] - order[b.bucket];
        }
        const ta = new Date(a.schedule.startTime).getTime();
        const tb = new Date(b.schedule.startTime).getTime();
        return a.bucket === "past" ? tb - ta : ta - tb;
      });
  }, [filter, partitioned, schedules]);

  if (schedules.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <Radio className="mx-auto mb-3 h-10 w-10 text-slate-300" />
        <h2 className="text-lg font-bold text-slate-700">No live sessions</h2>
        <p className="mt-1 text-sm text-slate-500">
          Scheduled lectures for this course will appear here.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      {showSectionHeader && (
        <div>
          <h2 className="text-xl font-bold text-slate-800">Live sessions</h2>
          <p className="mt-1 text-sm text-slate-500">
            Filter by status to find sessions you can join or review.
          </p>
        </div>
      )}

      {showFilterTabs && (
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                filter === tab.id
                  ? "bg-primary text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  filter === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {counts[tab.id]}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {filter === "all" ? (
          (visibleList as { schedule: CourseLiveSchedule; bucket: ScheduleBucket }[]).map(
            ({ schedule, bucket }) => (
              <ScheduleCard
                key={schedule._id}
                bucket={bucket}
                courseId={courseId}
                schedule={schedule}
              />
            ),
          )
        ) : (visibleList as CourseLiveSchedule[]).length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            No sessions in this category.
          </div>
        ) : (
          (visibleList as CourseLiveSchedule[]).map((schedule) => (
            <ScheduleCard
              key={schedule._id}
              bucket={filter === "live" ? "live" : filter === "upcoming" ? "upcoming" : "past"}
              courseId={courseId}
              schedule={schedule}
            />
          ))
        )}
      </div>
    </section>
  );
}

export function CourseLiveSessionsPreview({
  schedules,
  courseId,
}: {
  schedules: CourseLiveSchedule[];
  courseId: string;
}) {
  const { live, upcoming, past } = partitionSchedules(schedules);

  if (schedules.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Live sessions</h2>
          <p className="mt-1 text-sm text-slate-500">
            {live.length} live · {upcoming.length} upcoming · {past.length} past
          </p>
        </div>
        <Link
          href={`/courses/${courseId}/live`}
          className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90"
        >
          Open live sessions
        </Link>
      </div>
      {live[0] && (
        <div className="mt-4 rounded-xl border border-secondary/25 bg-secondary/5 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-secondary">
            Live now
          </p>
          <p className="mt-1 font-semibold text-slate-800">{live[0].title}</p>
          <Link
            href={`/courses/${courseId}/live/${live[0]._id}`}
            className="mt-3 inline-flex text-sm font-bold text-primary hover:underline"
          >
            Join session
          </Link>
        </div>
      )}
    </section>
  );
}
