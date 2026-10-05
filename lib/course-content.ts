import api from "@/services/api";

export interface CourseMedia {
  _id: string;
  title: string;
  url: string;
  type: string;
}

export interface CourseQuiz {
  _id: string;
  title: string;
  durationMinutes: number;
  questions: unknown[];
  totalQuestions?: number;
  attemptStatus?: string;
  score?: number;
}

export interface CourseTopic {
  _id: string;
  title: string;
  description: string;
  media: CourseMedia[];
  quizzes: CourseQuiz[];
}

export interface CourseSummary {
  _id: string;
  code: string;
  title: string;
  description?: string;
}

export function getAssetBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:9991/api/v1").replace(
    "/api/v1",
    "",
  );
}

export function getAssetUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${getAssetBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function isNoteMedia(type: string) {
  return type === "pdf" || type === "image";
}

export function isTutorialMedia(type: string) {
  return type === "video" || type === "voice";
}

export async function fetchCourseBundle(courseId: string) {
  const [courseRes, topicsRes] = await Promise.all([
    api.get(`/courses/${courseId}`),
    api.get(`/topics/course/${courseId}`),
  ]);

  return {
    course: courseRes.data.course as CourseSummary,
    topics: topicsRes.data.topics as CourseTopic[],
  };
}
