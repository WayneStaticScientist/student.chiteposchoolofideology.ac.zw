"use client";

import React from "react";
import Link from "next/link";

export const WelcomeScreen = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-[400px] bg-primary -z-10 rounded-b-[50%]" />

      <div className="w-full max-w-lg shadow-2xl p-8 bg-white/95 backdrop-blur-xl rounded-3xl border border-white/30 text-center flex flex-col items-center gap-8">
        <div className="flex flex-col gap-4 items-center">
          <img
            alt="Logo"
            className="w-24 h-24 object-contain drop-shadow-md"
            src="/android-chrome-512x512.png"
          />
          <div>
            <h1 className="text-4xl font-extrabold text-primary">
              Chitepo School of Ideology
            </h1>
            <p className="text-gray-600 font-medium mt-2">Student Portal</p>
          </div>
        </div>

        <div className="w-full flex flex-col gap-4">
          <Link className="w-full" href="/enroll">
            <button className="w-full py-3 px-6 rounded-xl font-bold text-white bg-primary shadow-md hover:bg-primary/90 transition-colors">
              Enroll Now
            </button>
          </Link>

          <Link className="w-full" href="/status">
            <button className="w-full py-3 px-6 rounded-xl font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors">
              Check Application Status
            </button>
          </Link>

          <Link className="w-full" href="/register">
            <button className="w-full py-3 px-6 rounded-xl font-bold text-secondary bg-secondary/10 hover:bg-secondary/20 transition-colors">
              Register (Accepted Students)
            </button>
          </Link>

          <Link className="w-full" href="/login">
            <button className="w-full py-3 px-6 rounded-xl font-bold text-gray-700 border-2 border-gray-200 hover:bg-gray-50 transition-colors">
              Login to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
