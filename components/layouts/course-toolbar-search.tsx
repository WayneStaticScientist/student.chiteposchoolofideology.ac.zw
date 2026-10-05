"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Loader2, Search } from "lucide-react";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getStudentCourses, type StudentCourse } from "@/services/api";

const DEBOUNCE_MS = 350;
const MAX_SUGGESTIONS = 8;

export default function CourseToolbarSearch() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS);
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [coursesLoaded, setCoursesLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const loadCourses = async () => {
    if (coursesLoaded || loadingCourses) return;
    setLoadingCourses(true);
    try {
      const data = await getStudentCourses();
      setCourses(data.courses || []);
      setCoursesLoaded(true);
    } catch (err) {
      console.error("Failed to load courses for search", err);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const suggestions = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    if (!needle) return [];

    return courses
      .filter(
        (c) =>
          c.title?.toLowerCase().includes(needle) ||
          c.code?.toLowerCase().includes(needle),
      )
      .slice(0, MAX_SUGGESTIONS);
  }, [courses, debouncedQuery]);

  const showPanel =
    open && query.trim().length > 0 && (loadingCourses || coursesLoaded);

  const goToCourse = (courseId: string) => {
    setQuery("");
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
    router.push(`/courses/${courseId}`);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showPanel || suggestions.length === 0) {
      if (event.key === "Escape") {
        setOpen(false);
        setActiveIndex(-1);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      goToCourse(suggestions[activeIndex]._id);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  useEffect(() => {
    setActiveIndex(-1);
  }, [debouncedQuery]);

  return (
    <div ref={rootRef} className="relative hidden md:block">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
        size={18}
      />
      <input
        ref={inputRef}
        aria-autocomplete="list"
        aria-controls="course-search-suggestions"
        aria-expanded={showPanel}
        aria-label="Search courses"
        autoComplete="off"
        className="w-72 rounded-full border-none bg-slate-100 py-2 pl-10 pr-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 lg:w-80"
        placeholder="Search courses..."
        role="combobox"
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          void loadCourses();
        }}
        onFocus={() => {
          setOpen(true);
          void loadCourses();
        }}
        onKeyDown={onKeyDown}
      />

      {showPanel && (
        <div
          id="course-search-suggestions"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
          role="listbox"
        >
          {loadingCourses && !coursesLoaded ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Loading courses…
            </div>
          ) : suggestions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-500">
              No courses match &ldquo;{query.trim()}&rdquo;
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {suggestions.map((course, index) => (
                <li key={course._id} role="option" aria-selected={index === activeIndex}>
                  <button
                    type="button"
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                      index === activeIndex
                        ? "bg-primary/5"
                        : "hover:bg-slate-50"
                    }`}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => goToCourse(course._id)}
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <BookOpen size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-slate-800">
                        {course.title}
                      </span>
                      <span className="mt-0.5 inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                        {course.code}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
