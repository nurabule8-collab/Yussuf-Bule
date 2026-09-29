import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Volume2,
  CheckCircle,
  XCircle,
  HelpCircle,
  RotateCw,
  Lightbulb,
  AlertTriangle,
} from 'lucide-react';
import { TutorResult } from '../types';

interface TutorTabProps {
  liteMode: boolean;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
}

export const TutorTab: React.FC<TutorTabProps> = ({ onSpeak }) => {
  const [topic, setTopic] = useState('Compound Interest & Savings');
  const [level, setLevel] = useState('Beginner & Everyday Practical');
  const [question, setQuestion] = useState('How does money grow over time in a SACCO or savings account?');
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const initialTutor: TutorResult = {
    conceptName: 'Compound Interest (Interest on Interest)',
    simpleSummary:
      'Compound interest is when the reward you earn on your savings starts earning its own rewards. Over time, your money multiplies like a healthy herd of sheep that reproduces each season.',
    everydayMetaphor:
      'Imagine planting a mango tree. In the first year, it yields 5 mangoes. If you eat them, you only ever get 5 mangoes a year. But if you plant the seeds of those 5 mangoes, you soon have 6 trees, which yield 30 mangoes! That compounding growth is how interest multiplies.',
    stepByStep: [
      'Step 1 (The Principal): You deposit or invest your base money (e.g. 10,000).',
      'Step 2 (First Interest): At 10% annual interest, you earn 1,000. Now your total is 11,000.',
      'Step 3 (The Compounding Effect): Next year, the 10% is calculated on 11,000 (not just 10,000). You earn 1,100! Your savings grow faster every single cycle without extra labor.',
    ],
    commonMistakeToAvoid:
      'Withdrawing your interest too early, or confusing "simple interest" with "compound interest". Patience is the secret engine of compounding.',
    practiceChallenge: {
      question:
        'If you have 1,000 earning 10% compound interest per year, how much will you have at the end of the second year?',
      options: ['1,100', '1,200', '1,210', '1,500'],
      correctIndex: 2,
      explanation:
        'Correct! Year 1 gives you 1,100. Year 2 gives you 10% on 1,100, which is 110, totaling 1,210! The extra 10 came from interest on interest.',
    },
  };

  const [lesson, setLesson] = useState<TutorResult>(initialTutor);

  const presetTopics = [
    { name: 'Fractions', query: 'How to understand fractions when sharing food or dividing land' },
    { name: 'Photosynthesis', query: 'How plants make food from sunlight and air in simple words' },
    { name: 'Bookkeeping', query: 'How to record cash inflows and outflows for a small stall' },
    { name: 'Ohm’s Law', query: 'Explain voltage, current, and resistance using a water pipe analogy' },
    { name: 'Clean Water', query: 'How boiling and chlorine kill invisible bacteria in well water' },
  ];

  const handleLearn = async (customTopic?: string, customQuery?: string) => {
    const t = customTopic || topic;
    const q = customQuery || question;
    if (!t.trim() && !q.trim()) return;

    setLoading(true);
    setSelectedOption(null);
    setQuizSubmitted(false);

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: t,
          level,
          question: q,
        }),
      });

      const data = await res.json();
      if (data.conceptName) {
        setLesson(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-semibold text-white">The Patient Learning & Tutoring Studio</h2>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl">
          Learn anything at your own pace. Nurein AI breaks complex math, science, business bookkeeping, and language into real-world analogies, step-by-step logic, and gentle practice questions.
        </p>

        {/* Input Bar */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic (e.g. Soil Nutrients, Fractions, Profit & Loss)..."
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs md:text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
          />

          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Specific question you find confusing..."
            className="sm:col-span-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs md:text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Presets and trigger */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500">Popular topics:</span>
            {presetTopics.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTopic(p.name);
                  setQuestion(p.query);
                  handleLearn(p.name, p.query);
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleLearn()}
            disabled={(!topic.trim() && !question.trim()) || loading}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs md:text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            {loading ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Explain Patiently</span>
          </button>
        </div>
      </div>

      {/* Lesson Presentation */}
      <div className="space-y-4">
        {/* Core Idea Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
                Concept Breakdown
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">{lesson.conceptName}</h3>
            </div>
            <button
              onClick={() =>
                onSpeak(`${lesson.conceptName}. ${lesson.simpleSummary}. ${lesson.everydayMetaphor}`)
              }
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
              title="Listen to lesson"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Listen Aloud</span>
            </button>
          </div>

          {/* Simple Summary */}
          <div className="text-sm text-slate-200 leading-relaxed">{lesson.simpleSummary}</div>

          {/* Everyday Metaphor */}
          <div className="bg-slate-800/50 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <span className="font-semibold text-amber-300 block mb-1">
                The Everyday Metaphor (How to picture it in your mind):
              </span>
              {lesson.everydayMetaphor}
            </div>
          </div>
        </div>

        {/* 3-Step Walkthrough */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Step-by-Step Logic
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {lesson.stepByStep.map((step, sIdx) => (
              <div
                key={sIdx}
                className="bg-slate-800/40 border border-slate-700/80 rounded-lg p-3.5 text-xs text-slate-300 leading-relaxed flex flex-col justify-between"
              >
                <div>
                  <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 font-bold flex items-center justify-center text-[10px] mb-2 border border-emerald-500/30">
                    {sIdx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trap to Avoid */}
        {lesson.commonMistakeToAvoid && (
          <div className="bg-slate-900 border border-rose-900/30 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-rose-300 block mb-0.5">Common Trap to Avoid:</span>
              {lesson.commonMistakeToAvoid}
            </div>
          </div>
        )}

        {/* Friendly Quiz Challenge */}
        {lesson.practiceChallenge && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                Check Your Understanding (Mini Challenge)
              </h4>
            </div>

            <p className="text-sm font-medium text-slate-200">
              {lesson.practiceChallenge.question}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {lesson.practiceChallenge.options.map((option, oIdx) => {
                const isSelected = selectedOption === oIdx;
                const isCorrect = oIdx === lesson.practiceChallenge.correctIndex;
                let btnStyle = 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200';

                if (quizSubmitted) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-semibold';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                  }
                } else if (isSelected) {
                  btnStyle = 'bg-emerald-600/30 border-emerald-500 text-white';
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => {
                      if (!quizSubmitted) {
                        setSelectedOption(oIdx);
                        setQuizSubmitted(true);
                      }
                    }}
                    className={`p-3 rounded-lg border text-left text-xs transition-colors flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {quizSubmitted && isCorrect && (
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    )}
                    {quizSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {quizSubmitted && (
              <div
                className={`p-3.5 rounded-lg text-xs leading-relaxed border ${
                  selectedOption === lesson.practiceChallenge.correctIndex
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <span className="font-semibold block mb-1">
                  {selectedOption === lesson.practiceChallenge.correctIndex
                    ? '🎉 Excellent work!'
                    : '💡 Helpful explanation:'}
                </span>
                {lesson.practiceChallenge.explanation}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
