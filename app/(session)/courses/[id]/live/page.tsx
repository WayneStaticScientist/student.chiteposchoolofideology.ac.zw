"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

import CourseLiveSchedules, {
  type CourseLiveSchedule,
} from "@/components/courses/CourseLiveSchedules";
import CourseSectionShell from "@/components/courses/CourseSectionShell";
import api from "@/services/api";
import type { CourseSummary } from "@/lib/course-content";

export default function CourseLiveSessionsPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const [course, setCourse] = useState<CourseSummary | null>(null);
  const [schedules, setSchedules] = useState<CourseLiveSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [courseRes, schedulesRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get(`/live/course/${courseId}`),
        ]);
        setCourse(courseRes.data.course);
        setSchedules(schedulesRes.data.schedules || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load live sessions");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-1 items-center justify-center text-slate-500">
        Course not found.
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CourseSectionShell
        course={course}
        title="Live sessions"
        description="Browse live, upcoming, and past lectures. Use the filters below to switch views."
      >
        <CourseLiveSchedules
          courseId={courseId}
          schedules={schedules}
          showSectionHeader={false}
        />
      </CourseSectionShell>
    </div>
  );
}
