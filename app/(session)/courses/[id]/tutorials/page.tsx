"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Mic, PlayCircle } from "lucide-react";
import { toast } from "react-hot-toast";

import CourseSectionShell from "@/components/courses/CourseSectionShell";
import MediaViewerModal from "@/components/courses/MediaViewerModal";
import {
  fetchCourseBundle,
  isTutorialMedia,
  type CourseMedia,
  type CourseSummary,
  type CourseTopic,
} from "@/lib/course-content";

export default function CourseTutorialsPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const [course, setCourse] = useState<CourseSummary | null>(null);
  const [topics, setTopics] = useState<CourseTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState<CourseMedia | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCourseBundle(courseId);
        setCourse(data.course);
        setTopics(data.topics);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load tutorials");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  const grouped = useMemo(() => {
    return topics
      .map((topic) => ({
        topic,
        items: (topic.media || []).filter((m) => isTutorialMedia(m.type)),
      }))
      .filter((group) => group.items.length > 0);
  }, [topics]);

  const total = grouped.reduce((sum, g) => sum + g.items.length, 0);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50">
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
        title="Tutorials"
        description="Watch lecture recordings and listen to audio lessons for each topic."
      >
        <p className="mb-6 text-sm font-medium text-slate-500">
          {total} {total === 1 ? "session" : "sessions"} available
        </p>

        {grouped.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <PlayCircle className="mx-auto mb-3 text-slate-300" size={40} />
            <h2 className="text-lg font-bold text-slate-700">No tutorials yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Video and audio lessons will appear here when your lecturer uploads them.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(({ topic, items }) => (
              <section key={topic._id}>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">
                  {topic.title}
                </h2>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {items.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => setActiveMedia(item)}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                    >
                      <div className="flex aspect-video items-center justify-center bg-slate-900/95">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform group-hover:scale-105">
                          {item.type === "voice" ? (
                            <Mic size={24} />
                          ) : (
                            <PlayCircle size={26} />
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="font-semibold text-slate-800 group-hover:text-primary">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                          {item.type === "voice" ? "Audio lesson" : "Video lesson"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </CourseSectionShell>

      {activeMedia && (
        <MediaViewerModal media={activeMedia} onClose={() => setActiveMedia(null)} />
      )}
    </div>
  );
}
