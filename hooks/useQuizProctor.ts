"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useQuizProctor(
  active: boolean,
  onTabSwitchViolation: () => void,
) {
  const [isFocusLocked, setIsFocusLocked] = useState(false);
  const [tabSwitchDetected, setTabSwitchDetected] = useState(false);
  const [contentShielded, setContentShielded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [secureModeReady, setSecureModeReady] = useState(false);
  const violationHandled = useRef(false);
  const armedAtRef = useRef(0);
  const onTabSwitchViolationRef = useRef(onTabSwitchViolation);

  onTabSwitchViolationRef.current = onTabSwitchViolation;

  const triggerViolation = useCallback(() => {
    if (Date.now() - armedAtRef.current < 2000) return;
    if (violationHandled.current) return;
    violationHandled.current = true;
    setTabSwitchDetected(true);
    setContentShielded(true);
    onTabSwitchViolationRef.current();
  }, []);

  const enterSecureMode = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Fullscreen may be blocked; continue with other protections.
    }
    setSecureModeReady(true);
    setIsFullscreen(Boolean(document.fullscreenElement));
  }, []);

  useEffect(() => {
    if (!active || !secureModeReady) return;

    armedAtRef.current = Date.now();

    const shieldContent = (shield: boolean) => {
      setContentShielded(shield);
      setIsFocusLocked(shield);
    };

    const onVisibility = () => {
      const hidden = document.visibilityState === "hidden";
      shieldContent(hidden);
      if (hidden) {
        triggerViolation();
      }
    };

    const onWindowBlur = () => {
      if (document.visibilityState === "visible") {
        shieldContent(true);
        triggerViolation();
      }
    };

    const onWindowFocus = () => {
      if (!violationHandled.current) {
        shieldContent(false);
      }
    };

    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    const blockKeys = (e: KeyboardEvent) => {
      if (
        e.key === "PrintScreen" ||
        e.key === "Snapshot" ||
        (e.ctrlKey && e.key.toLowerCase() === "printscreen")
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerViolation();
      }
      if (e.ctrlKey && ["c", "v", "x", "s", "p", "u"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if (e.metaKey && ["c", "v", "x", "s", "p", "u"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    const blockContextMenu = (e: Event) => e.preventDefault();
    const blockCopy = (e: Event) => e.preventDefault();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onWindowBlur);
    window.addEventListener("focus", onWindowFocus);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("keydown", blockKeys, true);
    document.addEventListener("keyup", blockKeys, true);
    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("copy", blockCopy);
    document.addEventListener("cut", blockCopy);
    document.addEventListener("paste", blockCopy);

    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);

    setIsFullscreen(Boolean(document.fullscreenElement));

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onWindowBlur);
      window.removeEventListener("focus", onWindowFocus);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("keydown", blockKeys, true);
      document.removeEventListener("keyup", blockKeys, true);
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("cut", blockCopy);
      document.removeEventListener("paste", blockCopy);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [active, secureModeReady, triggerViolation]);

  useEffect(() => {
    if (active && secureModeReady) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
    }
  }, [active, secureModeReady]);

  return {
    isFocusLocked,
    tabSwitchDetected,
    contentShielded,
    isFullscreen,
    secureModeReady,
    enterSecureMode,
  };
}
