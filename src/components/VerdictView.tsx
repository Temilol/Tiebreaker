import React, { useState } from "react";
import { Check, ArrowRight, ShieldAlert, CheckSquare, Award, GitFork, ChevronRight, Sparkles, RefreshCw } from "lucide-react";
import { Verdict, SavedDecision } from "../types";
import DuoCompare from "./DuoCompare";

interface VerdictViewProps {
  verdict: Verdict;
  topic: string;
  options: string[];
  optionImages?: (string | null)[];
  onBranchOption: (optionName: string) => void;
  childDecisions: SavedDecision[];
  onSelectDecision: (id: string) => void;
  isGeneratingBranch?: string | null;
}

export default function VerdictView({ 
  verdict, 
  topic,
  options = [],
  optionImages = [],
  onBranchOption,
  childDecisions = [],
  onSelectDecision,
  isGeneratingBranch = null
}: VerdictViewProps) {
  const [completedSteps, setCompletedSteps] = useState<{ [key: string]: boolean }>({});

  const toggleStep = (step: string) => {
    setCompletedSteps(prev => ({
      ...prev,
      [step]: !prev[step]
    }));
  };

  const circumference = 2 * Math.PI * 36; // radius is 36
  const offset = circumference - (verdict.confidence / 100) * circumference;

  const winningIdx = options.indexOf(verdict.recommendedOption);
  const winnerImage = optionImages && winningIdx >= 0 ? optionImages[winningIdx] : null;

  return (
    <div className="space-y-6" id="verdict-view-root">
      {/* Winner Hero Card */}
      <div className="bg-gradient-to-br from-indigo-50/80 via-indigo-50/10 to-white dark:from-indigo-950/20 dark:via-slate-900/40 dark:to-slate-900/10 rounded-2xl border border-indigo-100 dark:border-slate-800 p-4 sm:p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6" id="winner-hero">
        {winnerImage && (
          <img 
            src={winnerImage} 
            alt={verdict.recommendedOption} 
            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border border-indigo-200 dark:border-indigo-900 shadow-sm shrink-0 self-center md:self-auto"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="space-y-3 flex-1" id="winner-info-block">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold" id="recommended-badge">
            <Award className="w-3.5 h-3.5" />
            Recommended Decision
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight break-words" id="winning-option-title">
            {verdict.recommendedOption}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl" id="topic-context">
            For Dilemma: &ldquo;{topic}&rdquo;
          </p>
        </div>

        {/* Circular Gauge */}
        <div className="flex items-center gap-3 sm:gap-4 bg-white dark:bg-slate-950 p-3 sm:p-4 rounded-xl border border-indigo-100/50 dark:border-indigo-950/20 shadow-sm shrink-0 self-stretch sm:self-start md:self-auto min-w-0" id="confidence-widget">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
              {/* Outer track */}
              <circle
                cx="40"
                cy="40"
                r="36"
                className="stroke-slate-100 dark:stroke-slate-850"
                strokeWidth="6"
                fill="none"
              />
              {/* Filled progress */}
              <circle
                cx="40"
                cy="40"
                r="36"
                className="stroke-indigo-600 dark:stroke-indigo-500 transition-all duration-1000 ease-out"
                strokeWidth="6"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center" id="confidence-percentage">
              <span className="text-base sm:text-lg font-extrabold text-indigo-950 dark:text-indigo-300 leading-none">{verdict.confidence}%</span>
              <span className="text-[8px] sm:text-[9px] text-slate-400 dark:text-slate-500 font-medium uppercase mt-0.5">Match</span>
            </div>
          </div>
          <div id="confidence-label" className="min-w-0">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Confidence Score</p>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">Calculated weighting win</p>
          </div>
        </div>
      </div>

      {/* Duo Compare Component */}
      <DuoCompare 
        options={options} 
        optionImages={optionImages} 
        recommendedOption={verdict.recommendedOption} 
      />

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="analytics-grid">
        {/* Core Case / Reasoning */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 space-y-4" id="reasoning-block">
          <h4 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            The Winning Case
          </h4>
          <div className="prose prose-slate text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base whitespace-pre-line" id="reasoning-content">
            {verdict.reasoning}
          </div>
        </div>

        {/* Sidebar details */}
        <div className="space-y-6" id="tradeoffs-and-actions">
          {/* Tradeoff Guard */}
          <div className="bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-900/30 p-6 space-y-3" id="tradeoff-card">
            <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5" id="tradeoff-heading">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              The Tradeoff to Accept
            </h4>
            <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed" id="tradeoff-text">
              {verdict.keyTradeoff}
            </p>
          </div>

          {/* Checklist next steps */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4" id="next-steps-card">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5" id="next-steps-heading">
              <CheckSquare className="w-4 h-4 text-slate-400" />
              Next Action Plan
            </h4>
            <div className="space-y-3" id="steps-checklist">
              {verdict.nextSteps.map((step, idx) => {
                const isCompleted = !!completedSteps[step];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleStep(step)}
                    id={`step-checkbox-${idx}`}
                    className="flex items-start gap-3 w-full text-left p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isCompleted
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 group-hover:border-indigo-400 dark:group-hover:border-slate-650"
                      }`}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span
                      className={`text-xs md:text-sm font-medium transition-all ${
                        isCompleted ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {step}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Decision Tree Branching Section */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-4" id="branching-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-950 dark:text-slate-50 uppercase tracking-wider flex items-center gap-2">
              <GitFork className="w-4 h-4 text-indigo-500 rotate-180" />
              Decision Tree Branching
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Drill down into any option to explore sub-dilemmas and map out next-tier execution paths.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="branching-options-grid">
          {options.map((opt) => {
            const associatedChildren = childDecisions.filter(
              (c) => (c.branchedFromOption || "").toLowerCase() === opt.toLowerCase()
            );
            const isWinner = opt === verdict.recommendedOption;
            const isGenerating = isGeneratingBranch === opt;

            const optIdx = options.indexOf(opt);
            const optImage = optionImages && optIdx >= 0 ? optionImages[optIdx] : null;

            return (
              <div 
                key={opt}
                className={`p-5 rounded-2xl border transition-all ${
                  isWinner 
                    ? "bg-indigo-50/15 dark:bg-indigo-950/5 border-indigo-150 dark:border-indigo-900/35" 
                    : "bg-slate-50/40 dark:bg-slate-900/10 border-slate-200/60 dark:border-slate-800/65"
                }`}
              >
                <div className="flex items-start justify-between gap-3.5 mb-3">
                  {optImage && (
                    <img 
                      src={optImage} 
                      alt={opt} 
                      className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{opt}</span>
                      {isWinner && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-md shrink-0">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      Explore choices stemming from this option
                    </p>
                  </div>

                  <button
                    onClick={() => onBranchOption(opt)}
                    disabled={!!isGeneratingBranch}
                    className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      isGenerating
                        ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 cursor-not-allowed"
                        : "bg-white dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-slate-800 cursor-pointer shadow-3xs"
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
                        Map Branch
                      </>
                    )}
                  </button>
                </div>

                {/* Sub decisions list */}
                {associatedChildren.length > 0 ? (
                  <div className="space-y-1.5 mt-4 pt-3 border-t border-slate-150 dark:border-slate-800/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Saved Branches ({associatedChildren.length})
                    </span>
                    <div className="space-y-1.5">
                      {associatedChildren.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => onSelectDecision(child.id)}
                          className="w-full p-2 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl text-left text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between group transition-colors cursor-pointer"
                        >
                          <span className="font-semibold truncate pr-2 flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-indigo-500 rounded-full" />
                            {child.topic}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-3 pt-3 border-t border-slate-150/30 dark:border-slate-800/30">
                    No active branches mapped yet.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
