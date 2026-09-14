"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  PlayCircle,
  FileText,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  File,
  X,
  Radio,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

import api from "@/services/api";

interface Media {
  _id: string;
  title: string;
  url: string;
  type: string;
}

interface Quiz {
  _id: string;
  title: string;
  durationMinutes: number;
  questions: any[];
  totalQuestions?: number;
  attemptStatus?: string;
  score?: number;
}

interface Topic {
  _id: string;
  title: string;
  description: string;
  media: Media[];
  quizzes: Quiz[];
}

export default function StudentCourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<any>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [activeMedia, setActiveMedia] = useState<Media | null>(null);
  const [schedules, setSchedules] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, topicsRes, schedulesRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get(`/topics/course/${courseId}`),
          api.get(`/live/course/${courseId}`),
        ]);

        setCourse(courseRes.data.course);
        setTopics(topicsRes.data.topics);
        setSchedules(schedulesRes.data.schedules || []);
      } catch (error) {
        console.error("Failed to load course details", error);
        toast.error("Failed to load course details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const toggleTopic = (id: string) => {
    setExpandedTopicId(expandedTopicId === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen bg-slate-50">
        <Loader2 className="text-emerald-500 animate-spin" size={40} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex-1 p-10 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-700">Course not found</h2>
        <Link className="mt-4 text-emerald-600 hover:underline" href="/courses">
          Back to courses
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 pb-32 scroll-smooth bg-slate-50 h-full">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
            onClick={() => router.push("/courses")}
          >
            <ArrowLeft className="text-slate-600" size={24} />
          </button>
          <div>
            <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">
              {course.code}
            </span>
            <h1 className="text-3xl font-bold text-slate-800">
              {course.title}
            </h1>
          </div>
        </div>

        <p className="text-slate-600 max-w-3xl text-lg">{course.description}</p>

        {/* Live Schedules Banner */}
        {schedules.length > 0 && (
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-rose-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-20">
              <Radio size={120} />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="flex h-4 w-4 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-white" />
                </span>
                Live Lectures Scheduled
              </h2>
              <div className="space-y-3 max-w-2xl">
                {schedules.map((schedule) => {
                  const isLive = schedule.status === "live";

                  return (
                    <div
                      key={schedule._id}
                      className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div>
                        <h3 className="font-bold text-xl">{schedule.title}</h3>
                        <p className="text-rose-100 text-sm mt-1">
                          {schedule.summary}
                        </p>
                        <div className="mt-2 inline-block bg-black/20 px-3 py-1 rounded-full text-sm font-semibold">
                          {new Date(schedule.startTime).toLocaleString()}
                        </div>
                      </div>
                      <Link
                        className={`font-bold py-3 px-8 rounded-xl transition-all text-center whitespace-nowrap ${isLive ? "bg-white text-rose-600 hover:bg-rose-50 shadow-lg" : "bg-rose-700/50 hover:bg-rose-700 text-white border border-rose-400/50"}`}
                        href={`/courses/${courseId}/live/${schedule._id}`}
                      >
                        {isLive ? "Join Now" : "Enter Waiting Room"}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Topics List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Course Content
          </h2>

          {topics.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-slate-300">
              <p className="text-slate-500 text-lg">
                No content available yet.
              </p>
            </div>
          ) : (
            topics.map((topic, index) => {
              const isExpanded = expandedTopicId === topic._id;

              return (
                <div
                  key={topic._id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all shadow-sm"
                >
                  <button
                    className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors text-left"
                    onClick={() => toggleTopic(topic._id)}
                  >
                    <div>
                      <span className="text-sm font-bold text-slate-400 mb-1 block">
                        TOPIC {index + 1}
                      </span>
                      <h3 className="text-xl font-bold text-slate-800">
                        {topic.title}
                      </h3>
                    </div>
                    <div className="text-slate-400">
                      {isExpanded ? (
                        <ChevronUp size={24} />
                      ) : (
                        <ChevronDown size={24} />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-6 pt-0 border-t border-slate-100 bg-slate-50/50">
                      <p className="text-slate-600 mb-6 mt-4">
                        {topic.description}
                      </p>

                      {/* Media Files */}
                      {topic.media && topic.media.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <FileText className="text-emerald-600" size={18} />{" "}
                            Learning Materials
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {topic.media.map((m) => (
                              <button
                                key={m._id}
                                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all text-left group"
                                onClick={() => setActiveMedia(m)}
                              >
                                <div
                                  className={`p-2 rounded-lg ${m.type === "video" ? "bg-indigo-100 text-indigo-600" : "bg-rose-100 text-rose-600"}`}
                                >
                                  {m.type === "video" ? (
                                    <PlayCircle size={20} />
                                  ) : (
                                    <File size={20} />
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors line-clamp-1">
                                    {m.title}
                                  </p>
                                  <span className="text-xs text-slate-400 uppercase tracking-wider">
                                    {m.type}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quizzes */}
                      {topic.quizzes && topic.quizzes.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <BrainCircuit
                              className="text-amber-600"
                              size={18}
                            />{" "}
                            Assessments
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {topic.quizzes.map((q) => (
                              <Link
                                key={q._id}
                                className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all text-left group"
                                href={`/courses/${courseId}/quiz/${q._id}`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                                    <BrainCircuit size={20} />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-700 group-hover:text-amber-700 transition-colors line-clamp-1">
                                      {q.title}
                                    </p>
                                    <span className="text-xs text-slate-500">
                                      {q.totalQuestions ||
                                        q.questions?.length ||
                                        0}{" "}
                                      Questions •{" "}
                                      {q.durationMinutes
                                        ? `${q.durationMinutes} mins`
                                        : "No time limit"}
                                    </span>
                                  </div>
                                </div>

                                {q.attemptStatus === "completed" ? (
                                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full whitespace-nowrap border border-emerald-100">
                                    Score: {q.score}/{q.totalQuestions}
                                  </span>
                                ) : q.attemptStatus === "in-progress" ? (
                                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full whitespace-nowrap border border-amber-100">
                                    In Progress
                                  </span>
                                ) : null}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {!topic.media?.length && !topic.quizzes?.length && (
                        <p className="text-sm text-slate-500 italic mt-4">
                          No materials uploaded for this topic yet.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Media Viewer Modal (Restricted) */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-slate-900/90 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                {activeMedia.type === "video" ? (
                  <PlayCircle className="text-indigo-600" />
                ) : (
                  <File className="text-rose-600" />
                )}
                {activeMedia.title}
              </h3>
              <button
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
                onClick={() => setActiveMedia(null)}
              >
                <X size={24} />
              </button>
            </div>

            <div
              className="flex-1 bg-slate-100 relative"
              onContextMenu={(e) => e.preventDefault()}
            >
              {activeMedia.type === "video" || activeMedia.type === "voice" ? (
                <video
                  controls
                  className="w-full h-full object-contain bg-black"
                  controlsList="nodownload"
                  src={`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:9991/api/v1").replace("/api/v1", "")}${activeMedia.url}`}
                >
                  <track kind="captions" srcLang="en" label="English" />
                </video>
              ) : activeMedia.type === "pdf" ? (
                <iframe
                  className="w-full h-full"
                  src={`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:9991/api/v1").replace("/api/v1", "")}${activeMedia.url}#toolbar=0`}
                  title={activeMedia.title}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <img
                    alt={activeMedia.title}
                    className="max-w-full max-h-full object-contain pointer-events-none"
                    src={`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:9991/api/v1").replace("/api/v1", "")}${activeMedia.url}`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
