'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, Loader2, ChevronRight, Volume2, LogOut } from 'lucide-react';

// ─────────────────────────────────────────
// 10 Communication Questions
// ─────────────────────────────────────────
const QUESTIONS = [
  "Can you tell me a little about yourself as a student?",
  "What's a challenge you've faced in school or outside, and how did you deal with it?",
  "What subjects, skills, or activities do you feel you're strongest in?",
  "What inspires you to do your best in school or in life?",
];

// "Can you explain something you learned recently in a way that's easy to understand?",
//   "What's an achievement you're proud of from the past year?",
//   "How do you usually handle feedback from teachers or classmates?",
//   "Where do you see yourself after high school — what are your goals?",
//   "Can you share an experience where you worked with classmates on a project or activity?",
//   "Why do you think you'd be a good fit for this program, club, or opportunity?",

type Phase = 'intro' | 'question' | 'recording' | 'processing' | 'done';

export default function VoiceChatbot() {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [recordedTime, setRecordedTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [messages, setMessages] = useState<{ role: 'bot' | 'user'; text: string }[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const blobsRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  // ─── TTS: Bot speaks the question ───
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.95;
      utter.pitch = 1;
      utter.lang = 'en-US';
      setIsSpeaking(true);
      utter.onend = () => { setIsSpeaking(false); resolve(); };
      utter.onerror = () => { setIsSpeaking(false); resolve(); };
      window.speechSynthesis.speak(utter);
    });
  }, []);

  // ─── Add a chat bubble ───
  const addMessage = useCallback((role: 'bot' | 'user', text: string) => {
    setMessages(prev => [...prev, { role, text }]);
  }, []);

  // ─── Start the evaluation session ───
  const handleStart = async () => {
    setPhase('question');
    setCurrentQ(0);
    addMessage('bot', "Hi! I'm your Communication Evaluator. I'll ask you 10 questions — just speak naturally after you press the microphone button. Let's begin!");
    await speak("Hi! I'm your Communication Evaluator. I'll ask you 10 questions. Just speak naturally after you press the microphone button. Let's begin!");
    await askQuestion(0);
  };

  // ─── Present a question ───
  const askQuestion = async (index: number) => {
    const q = QUESTIONS[index];
    setPhase('question');
    addMessage('bot', `Question ${index + 1}: ${q}`);
    await speak(`Question ${index + 1}. ${q}`);
  };

  // ─── Start recording ───
  const startRecording = async () => {
    chunksRef.current = [];
    setRecordedTime(0);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      alert('Microphone access denied. Please allow microphone access and try again.');
      return;
    }

    // Visual audio level
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    const updateLevel = () => {
      const buf = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(buf);
      const avg = buf.reduce((a, b) => a + b, 0) / buf.length;
      setAudioLevel(Math.round((avg / 255) * 100));
      animFrameRef.current = requestAnimationFrame(updateLevel);
    };
    updateLevel();

    const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    mediaRecorderRef.current = mr;

    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mr.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setAudioLevel(0);
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      blobsRef.current.push(blob);

      const qIdx = blobsRef.current.length - 1;
      addMessage('user', `[Answer ${qIdx + 1} recorded ✓]`);
      setAnsweredCount(prev => prev + 1);

      const nextIdx = qIdx + 1;
      if (nextIdx < QUESTIONS.length) {
        addMessage('bot', "Thank you! Next question...");
        await speak("Thank you! Next question...");
        setCurrentQ(nextIdx);
        await askQuestion(nextIdx);
      } else {
        // All 10 answered → submit
        setPhase('processing');
        addMessage('bot', "Excellent! Analyzing your communication skills now. This may take a minute...");
        await speak("Excellent! Analyzing your communication skills now. This may take a minute.");
        await submitEvaluation();
      }
    };

    mr.start(250);
    setIsRecording(true);
    setPhase('recording');

    // Timer counter
    const startTime = Date.now();
    const tick = () => {
      setRecordedTime(Math.floor((Date.now() - startTime) / 1000));
      timerRef.current = setTimeout(tick, 1000);
    };
    timerRef.current = setTimeout(tick, 1000);
  };

  // ─── Stop recording ───
  const stopRecording = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setPhase('question'); // temp until onstop fires
    setStatusMsg('Processing your answer...');
  };

  // ─── Submit all audio to backend ───
  const submitEvaluation = async () => {
    addMessage('bot', '⏳ Submitting your answers for AI analysis. Processing 10 audio recordings with speech-to-text + ML scoring — this can take a few minutes. Please keep this tab open!');

    const formData = new FormData();
    blobsRef.current.forEach((blob, i) => {
      formData.append('files', blob, `answer_${i + 1}.webm`);
    });

    try {
      // No explicit timeout — Whisper transcription can take several minutes on CPU.
      const res = await fetch('http://localhost:8000/evaluate-communication', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => 'Unknown server error');
        throw new Error(`Server returned ${res.status}: ${errText.slice(0, 200)}`);
      }
      const result = await res.json();
      localStorage.setItem('commEvalResult', JSON.stringify(result));
      setPhase('done');
      router.push('/com-results');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      const isNetworkErr = message.toLowerCase().includes('failed to fetch') || message.toLowerCase().includes('networkerror');
      const userMsg = isNetworkErr
        ? 'Could not reach the backend. Please make sure the backend server is running on port 8000 (uvicorn main:app --reload), then exit and try again.'
        : `Processing error: ${message}. Please exit and try again.`;
      setStatusMsg(userMsg);
      setPhase('question');
      addMessage('bot', '⚠️ ' + userMsg);
    }
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-4 md:p-8">

      {/* ── Header ── */}
      <div className="w-full max-w-4xl mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            🎙 Communication Evaluator
          </h1>
          <p className="text-indigo-300 text-sm mt-1">AI-powered voice skill assessment</p>
        </div>
        {phase !== 'intro' && (
          <button
            onClick={() => { window.speechSynthesis?.cancel(); router.push('/'); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600/40 border border-red-600/30 text-sm transition-all"
          >
            <LogOut size={14} /> Exit
          </button>
        )}
      </div>

      {/* ── Progress Bar ── */}
      {phase !== 'intro' && phase !== 'done' && (
        <div className="w-full max-w-4xl mb-4">
          <div className="flex justify-between text-xs text-indigo-300 mb-1">
            <span>Progress</span>
            <span>{answeredCount}/10 answered</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${(answeredCount / 10) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-semibold transition-all ${
                  i < answeredCount
                    ? 'bg-violet-500 text-white'
                    : i === currentQ
                    ? 'bg-indigo-500/60 text-white ring-2 ring-indigo-400'
                    : 'bg-white/10 text-white/40'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Chat Panel ── */}
      <div className="w-full max-w-4xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
           style={{ minHeight: '480px', maxHeight: '65vh' }}>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* Intro state */}
          {phase === 'intro' && (
            <div className="flex flex-col items-center justify-center h-full gap-6 py-10">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Mic size={40} className="text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-white text-xl font-bold mb-2">Ready to Begin?</h2>
                <p className="text-indigo-300 text-sm max-w-md">
                  You'll be asked <strong className="text-white">10 questions</strong>. Answer each one by speaking into your microphone.
                  The AI will evaluate your <strong className="text-white">clarity, vocabulary, fluency, structure,</strong> and <strong className="text-white">confidence</strong>.
                </p>
              </div>
              <div className="flex gap-3 text-xs text-indigo-300/80">
                {['Clarity','Vocabulary','Fluency','Structure','Confidence'].map(s => (
                  <span key={s} className="px-3 py-1 bg-white/10 rounded-full">{s}</span>
                ))}
              </div>
              <button
                onClick={handleStart}
                className="mt-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
              >
                Start Evaluation <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mr-2 flex-shrink-0">
                  <Volume2 size={14} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow ${
                  msg.role === 'bot'
                    ? 'bg-indigo-600/30 text-indigo-100 border border-indigo-500/20 rounded-tl-sm'
                    : 'bg-violet-600/40 text-violet-100 border border-violet-500/20 rounded-tr-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Bot speaking indicator */}
          {isSpeaking && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mr-2">
                <Volume2 size={14} className="text-white animate-pulse" />
              </div>
              <div className="px-4 py-3 bg-indigo-600/30 border border-indigo-500/20 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                {[0, 150, 300].map(d => (
                  <span key={d} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          )}

          {/* Processing overlay */}
          {phase === 'processing' && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <Loader2 size={48} className="text-indigo-400 animate-spin" />
              <p className="text-indigo-200 font-semibold text-lg">Analyzing your communication skills...</p>
              <p className="text-indigo-400 text-sm">This may take 1–3 minutes. Please wait.</p>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* ── Mic Control ── */}
        {(phase === 'question' || phase === 'recording') && !isSpeaking && (
          <div className="border-t border-white/10 p-6 flex flex-col items-center gap-4 bg-white/5">

            {/* Audio level bars (when recording) */}
            {isRecording && (
              <div className="flex items-end gap-1 h-8">
                {Array.from({ length: 20 }).map((_, i) => {
                  const filled = (audioLevel / 100) * 20;
                  return (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full transition-all ${i < filled ? 'bg-indigo-400' : 'bg-white/10'}`}
                      style={{ height: `${20 + Math.random() * 14}px` }}
                    />
                  );
                })}
                <span className="ml-2 text-indigo-300 text-xs tabular-nums">{formatTime(recordedTime)}</span>
              </div>
            )}

            <div className="flex items-center gap-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition-all shadow-lg ${
                  isRecording
                    ? 'bg-red-500 text-white shadow-red-500/30 hover:bg-red-600 animate-pulse'
                    : 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-indigo-500/30 hover:opacity-90 active:scale-95'
                }`}
              >
                {isRecording ? (
                  <><MicOff size={18} /> Stop Recording</>
                ) : (
                  <><Mic size={18} /> Start Recording</>
                )}
              </button>

              {!isRecording && (
                <p className="text-indigo-300/70 text-xs">Press to answer Question {currentQ + 1}</p>
              )}
            </div>

            {statusMsg && (
              <p className="text-yellow-400/80 text-xs">{statusMsg}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
