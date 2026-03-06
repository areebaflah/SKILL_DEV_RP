'use client'
import React, { useState } from "react";
import { LogOut } from "lucide-react";

export default function EssayQuestion() {
  const [answer, setAnswer] = useState("");

  return (
    <div className="min-h-screen pt-28 bg-gradient-to-br from-slate-600 to-sky-950 p-6 flex justify-center items-start gap-6">
      {/* Left Section */}
      <div className="w-full max-w-3xl bg-white dark:bg-black/10 dark:backdrop-blur-xl dark:border-white/20 border rounded-xl shadow p-6 space-y-6">
        <div className="font-semibold text-md text-gray-600 dark:text-gray-300">
          Q: 27 — Essay Type Question
        </div>

        {/* Question */}
        <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
          Write an essay on the topic below. Make sure your response is clear,
          structured, and includes relevant examples wherever possible.
        </p>

        <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
          ✍️ Topic:  
          <span className="font-normal block mt-1">
            “For some people patriotism means loyalty to humanity as much as loyalty to any one country.”
          </span>
        </p>

        {/* Essay Answer Box */}
        <div>
          <label className="text-gray-700 dark:text-gray-200 font-medium">
            Write your answer below:
          </label>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={8}
            className="
              w-full mt-2 p-4 border rounded-lg text-slate-800 dark:text-slate-100 
              bg-white dark:bg-black/20 dark:border-white/20 outline-none
              focus:border-blue-500 dark:focus:border-blue-400 transition
            "
            placeholder="Type your essay here..."
          />

          {/* Word Count */}
          <div className="text-right text-xs text-gray-600 dark:text-gray-400 mt-1">
            Word count: {answer.trim() === "" ? 0 : answer.trim().split(/\s+/).length}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <button className="text-gray-500 dark:text-gray-300 flex items-center gap-2 text-sm">
            <LogOut size={16} /> Exit Evaluation
          </button>

          <div className="flex gap-3">
            <button
              className="px-4 py-2 border rounded-lg text-gray-700 dark:text-gray-300 text-sm"
              onClick={() => setAnswer("")}
            >
              Clear Answer
            </button>
            <button className="px-5 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg text-sm">
              Save and Next
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-64 bg-white dark:bg-black/10 dark:backdrop-blur-xl dark:border-white/20 border border-gray-300 rounded-xl shadow p-6 space-y-6 text-center">
        {/* Timer */}
        <div>
          <div className="text-3xl font-bold dark:text-gray-100">02 : 59 : 59</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Hrs : Min : Sec</p>
        </div>

        <button className="w-full border rounded-lg py-2 text-gray-700 dark:text-gray-300 text-sm">
          About Evaluation
        </button>
        <button className="w-full border rounded-lg py-2 text-gray-700 dark:text-gray-300 text-sm">
          Read Instructions
        </button>

        {/* Number Grid */}
        <div className="grid grid-cols-5 gap-2 text-sm">
          {Array.from({ length: 25 }, (_, i) => (
            <button
              key={i}
              className={`p-2 rounded-lg border text-gray-700 dark:text-gray-200 dark:border-white/20 ${
                i === 1 ? "bg-purple-200 dark:bg-purple-400/40 border-purple-400" : ""
              }`}
            >
              {i + 26}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
