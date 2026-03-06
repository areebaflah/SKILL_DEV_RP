"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Course {
  label: string;
  platform: string;
  url: string;
}

interface ApiResponse {
  name: string;
  age: number;
  final_score: number;
  skill_level: string;
  recommended_courses: Course[];
}

const ProbRecomm: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadStoredResult = () => {
      try {
        // Get data from localStorage
        const storedResult = localStorage.getItem("problemSolvingResult");
        
        if (!storedResult) {
          setError("No evaluation results found. Please complete the evaluation first.");
          setLoading(false);
          return;
        }

        const result: ApiResponse = JSON.parse(storedResult);
        setData(result);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load stored results:", error);
        setError("Failed to load evaluation results. Please try again.");
        setLoading(false);
      }
    };

    loadStoredResult();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-600 to-sky-950">
        <p className="text-white text-lg">Loading recommendations...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-600 to-sky-950 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <p className="text-red-600 font-semibold text-lg">
            {error || "No data available"}
          </p>
          <button
            onClick={() => router.push("/problem-solving")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Evaluation
          </button>
        </div>
      </div>
    );
  }

  const evaluationResults = [
    {
      label: "Problem Solving Score",
      value: Math.min(data.final_score, 100), // Cap at 100%
      change: "+",
      color: "bg-yellow-400",
    },
    {
      label: "Problem Solving Skill Level",
      value:
        data.skill_level === "Beginner"
          ? 30
          : data.skill_level === "Intermediate"
          ? 65
          : 90,
      change: "+",
      color: "bg-yellow-400",
    },
  ];

  return (
    <section className="min-h-screen dark:bg-darklight bg-no-repeat bg-gradient-to-b from-white from-10% dark:from-darkmode to-herobg to-90% dark:to-darklight pt-28 pb-12 px-6 md:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="w-full p-6 space-y-8 bg-white  rounded-2xl shadow-xl">

          <p className="text-2xl font-bold text-slate-700 pl-3">
            Problem Solving Evaluation Metrics
          </p>

          {/* Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-100 p-5 rounded-xl">
            <div className="p-5 bg-white rounded-xl shadow-md">
              <div className="text-3xl font-semibold text-slate-800">{data.name}</div>
              <div className="text-slate-500 text-sm">Name</div>
            </div>

            <div className="p-5 bg-white rounded-xl shadow-md">
              <div className="text-3xl font-semibold text-slate-800">{data.age}</div>
              <div className="text-slate-500 text-sm">Age</div>
            </div>

            <div className="p-5 bg-white rounded-xl shadow-md">
              <div className="text-3xl font-semibold text-slate-800">
                {data.final_score.toFixed(1)}
              </div>
              <div className="text-slate-500 text-sm">
                Problem Solving Score
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl shadow-md">
              <div className="text-3xl font-semibold text-slate-800">{data.skill_level}</div>
              <div className="text-slate-500 text-sm">
                Problem Solving Skill Level
              </div>
            </div>
          </div>

          <p className="text-2xl font-bold text-slate-700 pl-3">
            Results and Recommendations
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-100 p-5 rounded-xl">

            {/* Evaluation Results */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-blue-500 text-lg">
                  Evaluation Results
                </h3>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </div>

              <div className="space-y-5">
                {evaluationResults.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-slate-700 text-sm">
                      <span>{item.label}</span>
                      <span className="text-green-600 font-medium">Improved</span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full mt-1">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${item.value}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-right text-xs text-slate-500 mt-1">
                      {item.value}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-blue-500">
                  Recommendations to Enhance Skill
                </h3>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </div>

              <div className="space-y-5">
                {data.recommended_courses.length > 0 ? (
                  data.recommended_courses.map((course, i) => (
                    <div
                      key={i}
                      className="bg-slate-100 p-3 rounded-md border border-slate-300 hover:border-blue-400 transition-colors"
                    >
                      <div className="flex justify-between items-start text-slate-700 text-sm gap-2">
                        <span className="text-base font-semibold flex-1">
                          {course.label}
                        </span>
                        <a
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-500 px-3 py-1 rounded-md text-white hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                        >
                          View
                        </a>
                      </div>

                      <div className="w-fit px-2 py-1 border rounded-md border-slate-500 mt-2 text-xs text-slate-600">
                        {course.platform}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">No recommendations available.</p>
                )}
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => {
                localStorage.removeItem("problemSolvingResult");
                router.push("/problem-solving");
              }}
              className="px-6 py-2 border-2 border-slate-600 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium"
            >
              Take New Evaluation
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Download Report
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProbRecomm;