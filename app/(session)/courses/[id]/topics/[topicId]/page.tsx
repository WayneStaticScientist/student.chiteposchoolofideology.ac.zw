"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

import CourseSectionShell from "@/components/courses/CourseSectionShell";
import CourseTopicDetail from "@/components/courses/CourseTopicDetail";
import type { CourseTopicItem } from "@/components/courses/CourseTopicsOverview";
import MediaViewerModal from "@/components/courses/MediaViewerModal";
import {
  fetchCourseBundle,
  type CourseMedia,
  type CourseSummary,
} from "@/lib/course-content";

export default function CourseTopicPage() {
  const { id: courseId, topicId } = useParams<{ id: string; topicId: string }>();
  const [course, setCourse] = useState<CourseSummary | null>(null);
  const [topics, setTopics] = useState<CourseTopicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState<CourseMedia | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCourseBundle(courseId);
        setCourse(data.course);
        setTopics(data.topics as CourseTopicItem[]);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load topic");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  const topicIndex = topics.findIndex((t) => t._id === topicId);
  const topic = topicIndex >= 0 ? topics[topicIndex] : null;

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!course || !topic) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-10">
        <h2 className="text-2xl font-bold text-slate-700">Topic not found</h2>
        <Link
          className="mt-4 font-semibold text-primary hover:underline"
          href={`/courses/${courseId}`}
        >
          Back to course overview
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CourseSectionShell
        course={course}
        title={topic.title}
        description="Materials and assessments for this topic."
      >
        <Link
          href={`/courses/${courseId}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary"
        >
          <ArrowLeft size={16} />
          Back to topics
        </Link>
        <CourseTopicDetail
          courseId={courseId}
          topic={topic}
          topicIndex={topicIndex}
          onOpenMedia={setActiveMedia}
        />
      </CourseSectionShell>

      {activeMedia && (
        <MediaViewerModal media={activeMedia} onClose={() => setActiveMedia(null)} />
      )}
    </div>
  );
}
