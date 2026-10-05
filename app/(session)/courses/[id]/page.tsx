"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

import CourseSectionShell from "@/components/courses/CourseSectionShell";
import CourseTopicsOverview, {
  type CourseTopicItem,
} from "@/components/courses/CourseTopicsOverview";
import api from "@/services/api";

export default function StudentCourseDetailsPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<any>(null);
  const [topics, setTopics] = useState<CourseTopicItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, topicsRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get(`/topics/course/${courseId}`),
        ]);

        setCourse(courseRes.data.course);
        setTopics(topicsRes.data.topics);
      } catch (error) {
        console.error("Failed to load course details", error);
        toast.error("Failed to load course details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-10">
        <h2 className="text-2xl font-bold text-slate-700">Course not found</h2>
        <Link className="mt-4 font-semibold text-primary hover:underline" href="/courses">
          Back to courses
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CourseSectionShell
        course={course}
        title="Course overview"
        description={
          course.description ||
          "Browse course topics. Open a topic for materials and assessments."
        }
      >
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">Course topics</h2>
            <p className="mt-1 text-sm text-slate-500">
              Select a topic to view its materials and quizzes.
            </p>
          </div>
          <CourseTopicsOverview courseId={courseId} topics={topics} />
        </section>
      </CourseSectionShell>
    </div>
  );
}
