"use client";

import React, { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";


interface Question {
  id: number;
  question: string;
}
export default function ExamQuestion() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(15).fill(0));
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/data/probQuestions.json")
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      });
  }, []);

  const handleSelect = (value: number) => {
    const updated = [...answers];
    updated[currentIndex] = value;
    setAnswers(updated);
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Submit answers
      await submitEvaluation();
    }
  };

  const submitEvaluation = async () => {
    const payload = {
      name: "Areeb Aflah",
      age: 22,
      answers: answers
    };

    const res = await fetch("http://localhost:8000/predict-and-recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    console.log("Prediction Result:", result);


    
    // Save to localStorage
    localStorage.setItem("problemSolvingResult", JSON.stringify(result));

    // Redirect to results page
    router.push("/prob-recommendation");
  };

  if (loading) {
    return <p className="text-center mt-20">Loading questions...</p>;
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen pt-28  dark:bg-darklight bg-no-repeat bg-gradient-to-b from-white from-10% dark:from-darkmode to-herobg to-90% dark:to-darklight p-6 flex justify-center items-start gap-6">

      {/* Left Section */}
      <div className="w-full max-w-3xl bg-white shadow-lg dark:bg-black/10 dark:backdrop-blur-xl dark:border-white/20 dark:border rounded-xl p-6 space-y-6">

        <div className="font-semibold text-md text-gray-700 dark:text-gray-200 ">
          Q: {currentIndex + 1}
        </div>

        <p className="text-gray-700 dark:text-gray-200  leading-relaxed">
          {currentQuestion.question}
        </p>

        <p className="font-semibold text-gray-700 dark:text-gray-200 ">
          What’s the level of your agreement?
        </p>

        {/* Options */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((opt) => (
            <label
              key={opt}
              className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer text-gray-700 dark:text-gray-200  hover:bg-slate-100 hover:text-black ${
                answers[currentIndex] === opt ? "border-blue-500 bg-blue-50 text-black" : ""
              }`}
            >
              <input
                type="radio"
                checked={answers[currentIndex] === opt}
                onChange={() => handleSelect(opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <button
           onClick={() => {
            localStorage.removeItem("problemSolvingResult");
            router.push("/");
          }}
           className="px-4 py-2 border rounded-lg bg-red-600 text-white flex items-center gap-2 text-sm">
            <LogOut size={16} /> Exit Evaluation
          </button>

          <button
            onClick={handleNext}
            disabled={answers[currentIndex] === 0}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
          >
            {currentIndex === questions.length - 1 ? "Submit Evaluation" : "Save and Next"}
          </button>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-64 bg-white shadow-lg dark:bg-black/10 dark:backdrop-blur-xl dark:border-white/20 dark:border rounded-xl p-6 space-y-6 text-center">

        <button className="w-full border rounded-lg py-2 text-gray-700 dark:text-gray-200  text-sm">
          About Evaluation
        </button>
        <button className="w-full border rounded-lg py-2 text-gray-700 dark:text-gray-200  text-sm">
          Read Instructions
        </button>

        {/* Question Navigator */}
        <div className="grid grid-cols-5 gap-2 text-sm text-gray-700 dark:text-gray-200 ">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`p-2 rounded-lg border ${
                answers[i] !== 0
                  ? "bg-green-200 border-green-400 dark:text-black"
                  : "bg-slate-100 dark:text-black"
              } ${
                i === currentIndex ? "ring-2 ring-blue-400" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
