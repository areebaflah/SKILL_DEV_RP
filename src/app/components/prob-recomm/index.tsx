"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Award,
  RotateCcw,
  ExternalLink,
  Brain,
  TrendingUp,
  User,
  AlertCircle,
} from "lucide-react";

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

// ── Skill level → visual config ──────────────────────────
const LEVEL_CONFIG: Record<
  string,
  { gradient: string; badge: string; ring: string; desc: string }
> = {
  High: {
    gradient: "from-emerald-400 to-green-500",
    badge: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
    ring: "#10b981",
    desc: "Outstanding performance",
  },
  Intermediate: {
    gradient: "from-sky-400 to-blue-500",
    badge: "bg-sky-500/20 border-sky-500/30 text-sky-300",
    ring: "#0ea5e9",
    desc: "Solid foundation — keep growing",
  },
  Low: {
    gradient: "from-amber-400 to-orange-500",
    badge: "bg-amber-500/20 border-amber-500/30 text-amber-300",
    ring: "#f59e0b",
    desc: "Keep practising — every expert started here",
  },
};

const PLATFORM_COLORS: Record<string, string> = {
  YouTube: "bg-red-600/20 text-red-300 border-red-500/30",
  Udemy: "bg-violet-600/20 text-violet-300 border-violet-500/30",
  Coursera: "bg-blue-600/20 text-blue-300 border-blue-500/30",
  edX: "bg-rose-600/20 text-rose-300 border-rose-500/30",
};

// ── Score ring component ──────────────────────────────────
function ScoreRing({
  score,
  maxScore,
  ringColor,
  gradient,
}: {
  score: number;
  maxScore: number;
  ringColor: string;
  gradient: string;
}) {
  const radius = 70;
  const circ = 2 * Math.PI * radius;
  const pct = Math.min(score / maxScore, 1);
  const progress = pct * circ;

  return (
    <div className="relative inline-flex items-center justify-center w-44 h-44">
      <svg className="absolute" width="176" height="176" viewBox="0 0 176 176">
        <circle
          cx="88"
          cy="88"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="12"
        />
        <circle
          cx="88"
          cy="88"
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circ}`}
          transform="rotate(-90 88 88)"
          className="transition-all duration-1000"
          style={{ filter: `drop-shadow(0 0 6px ${ringColor}60)` }}
        />
      </svg>
      <div className="flex flex-col items-center z-10">
        <span
          className={`text-4xl font-black bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}
        >
          {score.toFixed(1)}
        </span>
        <span className="text-white/40 text-xs mt-1">out of {maxScore}</span>
      </div>
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
        <Icon size={20} className="text-indigo-400" />
      </div>
      <div>
        <p className="text-white/40 text-xs">{label}</p>
        <p className="text-white font-bold text-lg leading-tight">{value}</p>
        {sub && <p className="text-white/30 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────
const ProbRecomm: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("problemSolvingResult");
      if (!stored) {
        setError("No evaluation results found. Please complete the evaluation first.");
      } else {
        setData(JSON.parse(stored));
      }
    } catch {
      setError("Failed to load results. Please try again.");
    }
    setLoading(false);
  }, []);

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-indigo-300 text-sm">Loading your results…</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center px-4">
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-10 max-w-md w-full text-center space-y-5">
          <AlertCircle className="mx-auto h-14 w-14 text-red-400" />
          <p className="text-white/80 text-base">{error || "No data available"}</p>
          <button
            onClick={() => router.push("/problem-solving")}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
          >
            Go to Evaluation
          </button>
        </div>
      </div>
    );
  }

  const maxScore = 5;
  const levelKey = data.skill_level in LEVEL_CONFIG ? data.skill_level : "Intermediate";
  const lvl = LEVEL_CONFIG[levelKey];

  // Score → percentage bar for the progress section
  const scorePercent = Math.round((Math.min(data.final_score, maxScore) / maxScore) * 100);
  const levelPercent =
    levelKey === "High" ? 90 : levelKey === "Intermediate" ? 60 : 30;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-10 md:py-16">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Page Header ── */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-4">
            <Brain size={14} className="text-indigo-400" />
            <span className="text-indigo-300 text-xs font-medium tracking-wide uppercase">
              Problem Solving Evaluation
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Your Evaluation Report
          </h1>
          <p className="text-indigo-300 mt-2 text-sm">
            AI-powered problem solving skill assessment
          </p>
        </div>

        {/* ── Hero Score Card ── */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-8">

            {/* Score ring */}
            <div className="flex flex-col items-center gap-3 flex-shrink-0">
              <ScoreRing
                score={data.final_score}
                maxScore={maxScore}
                ringColor={lvl.ring}
                gradient={lvl.gradient}
              />
              <span className={`px-4 py-1.5 rounded-full border text-sm font-semibold ${lvl.badge}`}>
                {data.skill_level}
              </span>
              <p className="text-white/40 text-xs text-center max-w-[140px]">{lvl.desc}</p>
            </div>

            {/* Progress bars */}
            <div className="flex-1 w-full space-y-5">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <TrendingUp size={18} className="text-indigo-400" /> Performance Metrics
              </h2>

              {/* Score bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/70 font-medium">Problem Solving Score</span>
                  <span className="text-white font-bold tabular-nums">
                    {data.final_score.toFixed(2)} / {maxScore}
                  </span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${lvl.gradient} rounded-full transition-all duration-1000`}
                    style={{ width: `${scorePercent}%` }}
                  />
                </div>
                <p className="text-right text-xs text-white/30 mt-1">{scorePercent}%</p>
              </div>

              {/* Skill bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/70 font-medium">Skill Level</span>
                  <span className="text-white font-bold">{data.skill_level}</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-1000"
                    style={{ width: `${levelPercent}%` }}
                  />
                </div>
                <p className="text-right text-xs text-white/30 mt-1">{levelPercent}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={User} label="Student Name" value={data.name} />
          <StatCard
            icon={Brain}
            label="Problem Solving Score"
            value={data.final_score.toFixed(2)}
            sub={`out of ${maxScore}`}
          />
          <StatCard
            icon={Award}
            label="Skill Level"
            value={data.skill_level}
            sub={lvl.desc}
          />
        </div>

        {/* ── Course Recommendations ── */}
        {data.recommended_courses.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-6">
              <BookOpen size={18} className="text-violet-400" />
              Recommended Courses to Enhance Your Skills
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.recommended_courses.map((course, i) => {
                const platClass =
                  PLATFORM_COLORS[course.platform] ??
                  "bg-white/10 text-white/60 border-white/10";
                return (
                  <a
                    key={i}
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-3 p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Award
                          size={16}
                          className="text-violet-400 flex-shrink-0 mt-0.5"
                        />
                        <span className="text-white font-semibold text-sm leading-tight">
                          {course.label}
                        </span>
                      </div>
                      <ExternalLink
                        size={14}
                        className="text-white/30 group-hover:text-indigo-400 flex-shrink-0 transition-colors"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs border font-medium ${platClass}`}
                      >
                        {course.platform}
                      </span>
                      <span className="text-indigo-400 text-xs font-semibold group-hover:underline">
                        View Course →
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              localStorage.removeItem("problemSolvingResult");
              router.push("/problem-solving");
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-2xl hover:bg-white/20 transition-all text-sm font-medium"
          >
            <RotateCcw size={16} /> Retake Evaluation
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-2xl hover:opacity-90 transition-all text-sm font-semibold shadow-lg shadow-indigo-500/30"
          >
            Download Report
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white/70 rounded-2xl hover:bg-white/10 transition-all text-sm font-medium"
          >
            Back to Home
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProbRecomm;