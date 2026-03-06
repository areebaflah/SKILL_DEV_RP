'use client'
import React from 'react'
import { useState } from "react";
import { Send, Sparkles, Tag, RefreshCcw, Percent } from "lucide-react";

const comSection = () => {
    const [selected, setSelected] = useState<string | null>(null);

  const options = [
    { label: "Promotional", icon: Sparkles },
    { label: "After sale", icon: RefreshCcw },
    { label: "Discount", icon: Percent },
  ];
  return (
    <>
    
    
    <div className="min-h-screen w-full bg-gradient-to-br from-lime-200 to-orange-200 p-4 md:p-10 flex flex-col gap-8 md:flex-row">
      {/* Left Chat Section */}
      <div className="w-full md:w-1/3 bg-gray-900 text-white rounded-2xl p-6 flex flex-col justify-between shadow-xl">
        <div className="space-y-4">
          <div className="text-lg font-semibold flex gap-2 items-center">
            <span className="text-yellow-400">✨</span> Hi, let’s create something marvellous together!
          </div>
          <p className="text-sm text-gray-300">What kind of Landing Page do you need to prepare?</p>

          <div className="flex gap-3 flex-wrap mt-4">
            {options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setSelected(opt.label)}
                className={`px-4 py-1 rounded-full border text-sm flex items-center gap-1 transition-all ${
                  selected === opt.label
                    ? "bg-purple-500 text-white border-purple-500"
                    : "bg-transparent border-gray-600 text-gray-300 hover:border-gray-400"
                }`}
              >
                <opt.icon size={16} /> {opt.label}
              </button>
            ))}
          </div>

          {selected && (
            <p className="mt-4 text-sm text-purple-300">Understood! Give me a moment please 🤵‍♂️</p>
          )}
        </div>

        <div className="mt-6">
          <div className="flex items-center bg-gray-800 rounded-full px-4 py-2">
            <input
              type="text"
              placeholder="What do you want to create?"
              className="bg-transparent flex-grow outline-none text-sm text-gray-200"
            />
            <Send className="text-gray-400" size={18} />
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 bg-white/50 backdrop-blur-xl rounded-2xl p-10 shadow-xl text-center flex flex-col justify-center">
        <h1 className="text-3xl font-bold text-gray-900">Welcome creator!</h1>
        <p className="text-gray-700 mt-3 max-w-lg mx-auto">
          This is the place where magic happens 🪄. Tell me all your needs and ideas,
          and I will make your dream landing page something real.
        </p>

        <h3 className="mt-10 text-lg font-semibold text-gray-800">How you can start creating:</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="p-6 bg-white rounded-2xl shadow-lg text-left">
            <p className="font-semibold text-gray-800">Simply by sharing your needs in the chat</p>
            <p className="text-sm mt-2 text-gray-600">
              Prepare a short brief before you start: colours, imagery feel, tone of voice.
              It will speed up the process.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-lg text-left">
            <p className="font-semibold text-gray-800">Choose a template from our library</p>
            <p className="text-sm mt-2 text-gray-600">
              If you tried something that worked — use it again!
            </p>
            <div className="flex gap-2 mt-4">
              <button className="px-3 py-1 text-xs bg-gray-800 text-white rounded-full">CREATIONS</button>
              <button className="px-3 py-1 text-xs bg-gray-200 rounded-full">TEMPLATES</button>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-lg text-left">
            <p className="font-semibold text-gray-800">Build your template from components</p>
            <p className="text-sm mt-2 text-gray-600">
              Combine components to build your dream landing page.
            </p>
            <button className="mt-4 px-3 py-1 text-xs bg-gray-800 text-white rounded-full">NEW TEMPLATE</button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default comSection



