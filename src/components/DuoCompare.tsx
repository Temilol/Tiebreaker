import React from "react";
import { Award, Check, AlertCircle } from "lucide-react";

interface DuoCompareProps {
  options: string[];
  optionImages: (string | null)[];
  recommendedOption: string;
}

export default function DuoCompare({
  options = [],
  optionImages = [],
  recommendedOption,
}: DuoCompareProps) {
  // Ensure we have at least some valid images to show
  const hasAnyImages = optionImages.some((img) => img !== null);
  if (!hasAnyImages || options.length === 0) return null;

  // We align options with their images. If an option does not have an image, we can show a styled typographic placeholder.
  const displayItems = options.map((opt, idx) => {
    return {
      name: opt,
      image: optionImages[idx] || null,
      isWinner: opt.toLowerCase() === (recommendedOption || "").toLowerCase(),
      index: idx,
    };
  });

  const count = displayItems.length;

  return (
    <div 
      className="bg-slate-50 dark:bg-slate-950/40 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 p-5 sm:p-6 shadow-xs relative overflow-hidden" 
      id="duo-compare-container"
    >
      {/* Decorative ambient background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-400/5 blur-3xl pointer-events-none rounded-full" />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-5 relative z-10">
        <div>
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Visual Option Comparison
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare options side-by-side with Counsel's recommended choice
          </p>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
          {count} Options
        </div>
      </div>

      {/* Main Grid of Options */}
      <div 
        className={`relative grid gap-6 sm:gap-8 items-stretch ${
          count === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 sm:grid-cols-3"
        }`}
        id="compare-grid"
      >
        {displayItems.map((item, idx) => {
          return (
            <div
              key={item.name}
              className={`relative rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden group/item ${
                item.isWinner
                  ? "border-indigo-500 dark:border-indigo-500 bg-white dark:bg-slate-900 shadow-md shadow-indigo-500/5 ring-2 ring-indigo-500/10"
                  : "border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-900/20 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/50 dark:hover:bg-slate-900/30"
              }`}
              id={`compare-card-${idx}`}
            >
              {/* Option Image or Typographic Placeholder */}
              <div className="relative aspect-video sm:aspect-[4/3] md:aspect-[16/10] bg-slate-200/40 dark:bg-slate-800/40 overflow-hidden shrink-0">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-[1.03] ${
                      !item.isWinner ? "filter saturate-75 opacity-90 group-hover/item:opacity-100 group-hover/item:saturate-100" : ""
                    }`}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 text-center select-none">
                    <AlertCircle className="w-6 h-6 text-slate-400 dark:text-slate-600 mb-2" />
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      No Photo Loaded
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-2 max-w-[150px]">
                      {item.name}
                    </span>
                  </div>
                )}

                {/* Overlays / Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/65 text-white backdrop-blur-xs select-none">
                    Option {idx + 1}
                  </span>
                </div>

                {item.isWinner && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20">
                      <Award className="w-3.5 h-3.5" />
                      Counsel's Choice
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer (Details) */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h5 className={`font-bold text-sm sm:text-base tracking-tight ${
                    item.isWinner ? "text-indigo-950 dark:text-indigo-200" : "text-slate-800 dark:text-slate-200"
                  }`}>
                    {item.name}
                  </h5>
                </div>

                {item.isWinner ? (
                  <div className="mt-3 pt-3 border-t border-indigo-100/50 dark:border-indigo-950/30 flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    Recommended as the optimal outcome
                  </div>
                ) : (
                  <div className="mt-3 pt-3 border-t border-slate-200/30 dark:border-slate-800/40 flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
                    Alternative course of action
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Floating Center VS Indicator - Only when there are exactly 2 options */}
        {count === 2 && (
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:block"
            id="vs-indicator-overlay"
          >
            <div className="w-11 h-11 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-mono font-black text-xs rounded-full border-4 border-slate-50 dark:border-slate-950 shadow-md flex items-center justify-center select-none hover:scale-110 transition-transform tracking-wide ring-2 ring-indigo-500/10">
              VS
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile center vs line for 2 items */}
      {count === 2 && (
        <div className="block md:hidden text-center my-4 relative" id="mobile-vs-divider">
          <div className="absolute inset-y-1/2 left-0 right-0 border-t border-slate-200 dark:border-slate-800 z-0" />
          <span className="relative z-10 px-3.5 py-1 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] font-mono font-black text-slate-500 dark:text-slate-400">
            VS
          </span>
        </div>
      )}
    </div>
  );
}
