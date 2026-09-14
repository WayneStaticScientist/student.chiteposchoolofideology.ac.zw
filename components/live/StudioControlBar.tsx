"use client";
import React from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  MonitorOff,
  Users,
  MessageSquare,
  Hand,
  LayoutGrid,
  MonitorPlay,
  PhoneOff,
  Maximize,
  Minimize,
  Circle,
} from "lucide-react";

interface StudioControlBarProps {
  isMicEnabled: boolean;
  onToggleMic: () => void;
  isCamEnabled: boolean;
  onToggleCam: () => void;
  isScreenShareEnabled: boolean;
  onToggleScreenShare: () => void;
  viewMode: "presentation" | "gallery";
  onToggleViewMode: () => void;
  isParticipantsOpen: boolean;
  onToggleParticipants: () => void;
  participantCount: number;
  isChatOpen: boolean;
  onToggleChat: () => void;
  unreadCount: number;
  isHandRaised: boolean;
  onToggleHand: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onEndOrLeave: () => void;
  isHost?: boolean;
  canPublish?: boolean;
  isRecording?: boolean;
  onToggleRecording?: () => void;
}

export const StudioControlBar: React.FC<StudioControlBarProps> = ({
  isMicEnabled,
  onToggleMic,
  isCamEnabled,
  onToggleCam,
  isScreenShareEnabled,
  onToggleScreenShare,
  viewMode,
  onToggleViewMode,
  isParticipantsOpen,
  onToggleParticipants,
  participantCount,
  isChatOpen,
  onToggleChat,
  unreadCount,
  isHandRaised,
  onToggleHand,
  isFullscreen,
  onToggleFullscreen,
  onEndOrLeave,
  isHost = false,
  canPublish = true,
  isRecording = false,
  onToggleRecording,
}) => {
  return (
    <nav
      aria-label="Meeting Controls"
      className="h-20 bg-zinc-900/95 border-t border-zinc-800 px-3 sm:px-6 flex items-center justify-between shrink-0 backdrop-blur-lg z-30 select-none"
    >
      {/* Left Controls: Audio & Video */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Audio (Mic) Toggle */}
        <button
          className={`flex flex-col items-center justify-center min-w-[56px] sm:min-w-[64px] h-14 rounded-2xl transition-all ${
            isMicEnabled
              ? "hover:bg-zinc-800 text-zinc-300 hover:text-white"
              : "bg-rose-500/15 hover:bg-rose-500/25 text-rose-500"
          } ${!canPublish ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={!canPublish}
          title={isMicEnabled ? "Mute Microphone" : "Unmute Microphone"}
          type="button"
          onClick={onToggleMic}
        >
          <div className="relative p-1">
            {isMicEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">
            {isMicEnabled ? "Mute" : "Unmute"}
          </span>
        </button>

        {/* Video (Cam) Toggle */}
        <button
          className={`flex flex-col items-center justify-center min-w-[56px] sm:min-w-[64px] h-14 rounded-2xl transition-all ${
            isCamEnabled
              ? "hover:bg-zinc-800 text-zinc-300 hover:text-white"
              : "bg-rose-500/15 hover:bg-rose-500/25 text-rose-500"
          } ${!canPublish ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={!canPublish}
          title={isCamEnabled ? "Stop Video" : "Start Video"}
          type="button"
          onClick={onToggleCam}
        >
          <div className="relative p-1">
            {isCamEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">
            {isCamEnabled ? "Stop Video" : "Start Video"}
          </span>
        </button>
      </div>

      {/* Center Controls: Screen Share, Layout View, Hand, Chat, Participants */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Screen Share (Presentation Mode) */}
        <button
          className={`flex flex-col items-center justify-center min-w-[56px] sm:min-w-[68px] h-14 rounded-2xl transition-all ${
            isScreenShareEnabled
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
              : "hover:bg-zinc-800 text-emerald-400 hover:text-emerald-300"
          }`}
          title={isScreenShareEnabled ? "Stop Sharing Screen" : "Share Screen"}
          type="button"
          onClick={onToggleScreenShare}
        >
          <div className="relative p-1">
            {isScreenShareEnabled ? (
              <MonitorOff size={20} />
            ) : (
              <ScreenShare size={20} />
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">
            {isScreenShareEnabled ? "Stop Share" : "Share"}
          </span>
        </button>

        {/* View Mode Toggle (Mobile / Tablet quick switcher) */}
        <button
          className="flex lg:hidden flex-col items-center justify-center min-w-[56px] sm:min-w-[64px] h-14 rounded-2xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
          title={
            viewMode === "presentation"
              ? "Switch to Gallery Grid"
              : "Switch to Presentation"
          }
          type="button"
          onClick={onToggleViewMode}
        >
          <div className="relative p-1">
            {viewMode === "presentation" ? (
              <LayoutGrid size={20} />
            ) : (
              <MonitorPlay size={20} />
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">
            {viewMode === "presentation" ? "Gallery" : "Present"}
          </span>
        </button>

        {/* Participants Panel Toggle */}
        <button
          className={`flex flex-col items-center justify-center min-w-[56px] sm:min-w-[68px] h-14 rounded-2xl transition-all relative ${
            isParticipantsOpen
              ? "bg-zinc-800 text-white border border-zinc-700/60 shadow-md"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
          title="Participants"
          type="button"
          onClick={onToggleParticipants}
        >
          <div className="relative p-1">
            <Users size={20} />
            {participantCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-zinc-700 text-white text-[9px] font-bold border border-zinc-900">
                {participantCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">
            Attendees
          </span>
        </button>

        {/* Chat (Message Channel) Toggle */}
        <button
          className={`flex flex-col items-center justify-center min-w-[56px] sm:min-w-[68px] h-14 rounded-2xl transition-all relative ${
            isChatOpen
              ? "bg-zinc-800 text-white border border-zinc-700/60 shadow-md"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
          title="Chat / Messages"
          type="button"
          onClick={onToggleChat}
        >
          <div className="relative p-1">
            <MessageSquare size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-blue-500 text-white text-[9px] font-bold animate-pulse shadow-md shadow-blue-500/50">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">
            Chat
          </span>
        </button>

        {/* Raise Hand Toggle */}
        <button
          className={`flex flex-col items-center justify-center min-w-[56px] sm:min-w-[64px] h-14 rounded-2xl transition-all ${
            isHandRaised
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-lg shadow-amber-500/10"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
          title={isHandRaised ? "Lower Hand" : "Raise Hand"}
          type="button"
          onClick={onToggleHand}
        >
          <div className="relative p-1">
            <Hand className={isHandRaised ? "animate-bounce" : ""} size={20} />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">
            {isHandRaised ? "Hand Up" : "Hand"}
          </span>
        </button>
      </div>

      {/* Right Controls: Fullscreen & Leave */}
      <div className="flex items-center gap-2">
        <button
          className="hidden sm:flex flex-col items-center justify-center min-w-[56px] h-14 rounded-2xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Studio"}
          type="button"
          onClick={onToggleFullscreen}
        >
          <div className="relative p-1">
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">
            {isFullscreen ? "Exit" : "Full"}
          </span>
        </button>

        {/* Record Toggle */}
        {onToggleRecording && (
          <button
            className={`flex flex-col items-center justify-center min-w-[56px] h-14 rounded-2xl transition-all ${
              isRecording
                ? "bg-rose-500/20 text-rose-500 border border-rose-500/40 shadow-lg shadow-rose-500/10"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
            title={isRecording ? "Stop Recording" : "Record Session"}
            type="button"
            onClick={onToggleRecording}
          >
            <div className="relative p-1">
              <Circle
                className={
                  isRecording ? "fill-rose-500 text-rose-500 animate-pulse" : ""
                }
                size={20}
              />
            </div>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">
              {isRecording ? "Stop Rec" : "Record"}
            </span>
          </button>
        )}

        {/* Leave Button */}
        <button
          className="px-3.5 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 bg-zinc-800 hover:bg-rose-600 hover:text-white text-zinc-300 border border-zinc-700/50 shadow-lg transition-all active:scale-95"
          type="button"
          onClick={onEndOrLeave}
        >
          <PhoneOff size={16} />
          <span className="font-semibold">Leave</span>
        </button>
      </div>
    </nav>
  );
};
