'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Award, TrendingUp, RotateCcw, ExternalLink
} from 'lucide-react';

interface CommCourse {
  label: string;
  platform: string;
  url: string;
  reason?: string;
}

interface CommResult {
  clarity: number;
  vocabulary: number;
  fluency: number;
  structure: number;
  confidence: number;
  overall_score: number;
  level: string;
  recommended_courses: CommCourse[];
}

const LEVEL_COLORS: Record<string, string> = {
  'Excellent':          'from-emerald-400 to-green-500',
  'Advanced':           'from-indigo-400 to-violet-500',
  'Intermediate':       'from-sky-400 to-blue-500',
  'Beginner':           'from-amber-400 to-orange-500',
  'Needs Improvement':  'from-red-400 to-rose-500',
};

const LEVEL_BG: Record<string, string> = {
  'Excellent':          'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
  'Advanced':           'bg-indigo-500/20 border-indigo-500/30 text-indigo-300',
  'Intermediate':       'bg-sky-500/20 border-sky-500/30 text-sky-300',
  'Beginner':           'bg-amber-500/20 border-amber-500/30 text-amber-300',
  'Needs Improvement':  'bg-red-500/20 border-red-500/30 text-red-300',
};

const SCORE_COLORS: Record<string, string> = {
  clarity:    'bg-violet-500',
  vocabulary: 'bg-sky-500',
  fluency:    'bg-emerald-500',
  structure:  'bg-amber-500',
  confidence: 'bg-pink-500',
};

const SCORE_LABELS: Record<string, string> = {
  clarity:    'Clarity',
  vocabulary: 'Vocabulary',
  fluency:    'Fluency',
  structure:  'Structure',
  confidence: 'Confidence',
};

type ScoreKey = 'clarity' | 'vocabulary' | 'fluency' | 'structure' | 'confidence';
const SCORE_KEYS: ScoreKey[] = ['clarity', 'vocabulary', 'fluency', 'structure', 'confidence'];

const PLATFORM_COLORS: Record<string, string> = {
  'Coursera': 'bg-blue-600/20 text-blue-300 border-blue-500/30',
  'Udemy':    'bg-violet-600/20 text-violet-300 border-violet-500/30',
  'edX':      'bg-rose-600/20 text-rose-300 border-rose-500/30',
  'YouTube':  'bg-red-600/20 text-red-300 border-red-500/30',
};

// Circular score ring
function ScoreRing({ score, gradient }: { score: number; gradient: string }) {
  const radius = 70;
  const circ = 2 * Math.PI * radius;
  const progress = ((score - 1) / 4) * circ; // score range 1–5

  return (
    <div className="relative inline-flex items-center justify-center w-44 h-44">
      <svg className="absolute" width="176" height="176" viewBox="0 0 176 176">
        <circle cx="88" cy="88" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
        <circle
          cx="88" cy="88" r={radius}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circ}`}
          transform="rotate(-90 88 88)"
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex flex-col items-center">
        <span className={`text-4xl font-black bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>
          {score.toFixed(1)}
        </span>
        <span className="text-white/50 text-xs mt-1">out of 5</span>
      </div>
    </div>
  );
}

// Sub-score bar
function ScoreBar({ label, score, colorClass }: { label: string; score: number; colorClass: string }) {
  const pct = ((score - 1) / 4) * 100;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-white/80 text-sm font-medium">{label}</span>
        <span className="text-white text-sm font-bold tabular-nums">{score.toFixed(2)}</span>
      </div>
      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} rounded-full transition-all duration-1000`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function CommResults() {
  const router = useRouter();
  const [result, setResult] = useState<CommResult | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('commEvalResult');
    if (stored) setResult(JSON.parse(stored));
  }, []);

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/70 text-lg">No evaluation result found.</p>
          <button onClick={() => router.push('/communication')}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm">
            Take the Evaluation
          </button>
        </div>
      </div>
    );
  }

  const gradient = LEVEL_COLORS[result.level] ?? LEVEL_COLORS['Intermediate'];
  const levelBg  = LEVEL_BG[result.level]   ?? LEVEL_BG['Intermediate'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-10 md:py-16">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Your Communication Report
          </h1>
          <p className="text-indigo-300 mt-2 text-sm">Powered by AI speech & language analysis</p>
        </div>

        {/* ── Overall Score Card ── */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-8">

            {/* Ring */}
            <div className="flex flex-col items-center gap-3">
              <ScoreRing score={result.overall_score} gradient={gradient} />
              <span className={`px-4 py-1.5 rounded-full border text-sm font-semibold ${levelBg}`}>
                {result.level}
              </span>
            </div>

            {/* Sub-scores */}
            <div className="flex-1 w-full space-y-4">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <TrendingUp size={18} className="text-indigo-400" /> Skill Breakdown
              </h2>
              {SCORE_KEYS.map(key => (
                <ScoreBar
                  key={key}
                  label={SCORE_LABELS[key]}
                  score={result[key]}
                  colorClass={SCORE_COLORS[key]}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Score Summary Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {SCORE_KEYS.map(key => (
            <div key={key} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <div className={`text-2xl font-black bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>
                {result[key].toFixed(1)}
              </div>
              <div className="text-white/50 text-xs mt-1">{SCORE_LABELS[key]}</div>
            </div>
          ))}
        </div>

        {/* ── Recommended Courses ── */}
        {result.recommended_courses.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-6">
              <BookOpen size={18} className="text-violet-400" /> Recommended Courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.recommended_courses.map((course, i) => {
                const platClass = PLATFORM_COLORS[course.platform] ?? 'bg-white/10 text-white/60 border-white/10';
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
                        <Award size={16} className="text-violet-400 flex-shrink-0 mt-0.5" />
                        <span className="text-white font-semibold text-sm leading-tight">{course.label}</span>
                      </div>
                      <ExternalLink size={14} className="text-white/30 group-hover:text-indigo-400 flex-shrink-0 transition-colors" />
                    </div>
                    {course.reason && (
                      <p className="text-white/50 text-xs leading-relaxed">{course.reason}</p>
                    )}
                    <span className={`self-start px-2.5 py-1 rounded-full text-xs border font-medium ${platClass}`}>
                      {course.platform}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              localStorage.removeItem('commEvalResult');
              router.push('/communication');
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-2xl hover:bg-white/20 transition-all text-sm font-medium"
          >
            <RotateCcw size={16} /> Retake Evaluation
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-2xl hover:opacity-90 transition-all text-sm font-semibold shadow-lg shadow-indigo-500/30"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
