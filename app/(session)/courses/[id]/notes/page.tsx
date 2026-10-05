"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ExternalLink, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

import CourseSectionShell from "@/components/courses/CourseSectionShell";
import MediaViewerModal from "@/components/courses/MediaViewerModal";
import {
  fetchCourseBundle,
  getAssetUrl,
  isNoteMedia,
  type CourseMedia,
  type CourseSummary,
  type CourseTopic,
} from "@/lib/course-content";

export default function CourseNotesPage() {
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
        toast.error("Failed to load notes");
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
        items: (topic.media || []).filter((m) => isNoteMedia(m.type)),
      }))
      .filter((group) => group.items.length > 0);
  }, [topics]);

  const totalNotes = grouped.reduce((sum, g) => sum + g.items.length, 0);

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
        title="Notes & readings"
        description="Download and review PDFs, documents, and reference images organised by topic."
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-500">
            {totalNotes} {totalNotes === 1 ? "resource" : "resources"} available
          </p>
        </div>

        {grouped.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <FileText className="mx-auto mb-3 text-slate-300" size={40} />
            <h2 className="text-lg font-bold text-slate-700">No notes yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Your lecturer has not published reading materials for this course.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(({ topic, items }) => (
              <section key={topic._id}>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">
                  {topic.title}
                </h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {items.map((item) => (
                    <article
                      key={item._id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          {item.type === "image" ? (
                            <ImageIcon size={20} />
                          ) : (
                            <FileText size={20} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-800">
                            {item.title}
                          </p>
                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            {item.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveMedia(item)}
                          className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary/90"
                        >
                          Open
                        </button>
                        <a
                          href={getAssetUrl(item.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
                        >
                          <ExternalLink size={14} />
                          New tab
                        </a>
                      </div>
                    </article>
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
