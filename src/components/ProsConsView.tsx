import React, { useState } from "react";
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { OptionProsCons, ProConItem } from "../types";

interface ProsConsViewProps {
  prosCons: OptionProsCons[];
  optionImages?: (string | null)[];
}

export default function ProsConsView({ prosCons, optionImages = [] }: ProsConsViewProps) {
  const [activeTab, setActiveTab] = useState(0);

  // Impact styling helper
  const getImpactBadge = (impact: "high" | "medium" | "low", isPro: boolean) => {
    const base = "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ";
    if (isPro) {
      switch (impact) {
        case "high":
          return (
            <span className={base + "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50"}>
              Major Benefit
            </span>
          );
        case "medium":
          return (
            <span className={base + "bg-teal-50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 border border-teal-200/50 dark:border-teal-900/30"}>
              Medium Benefit
            </span>
          );
        case "low":
          return (
            <span className={base + "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"}>
              Minor Benefit
            </span>
          );
      }
    } else {
      switch (impact) {
        case "high":
          return (
            <span className={base + "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50"}>
              Major Risk
            </span>
          );
        case "medium":
          return (
            <span className={base + "bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40"}>
              Medium Risk
            </span>
          );
        case "low":
          return (
            <span className={base + "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"}>
              Minor Drawback
            </span>
          );
      }
    }
  };

  const renderProConList = (items: ProConItem[], isPro: boolean) => {
    if (!items || items.length === 0) {
      return (
        <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs italic">
          No points analyzed.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border transition-all duration-200 bg-white dark:bg-slate-950 hover:shadow-sm ${
              isPro
                ? "border-emerald-100/80 hover:border-emerald-200 dark:border-emerald-950/40 dark:hover:border-emerald-900/50"
                : "border-rose-100/80 hover:border-rose-200 dark:border-rose-950/40 dark:hover:border-rose-900/50"
            }`}
            id={`procon-item-${isPro ? "pro" : "con"}-${idx}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                {isPro ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500 mt-1 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-500 mt-1 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <h5 className="font-semibold text-slate-800 dark:text-slate-200 text-sm md:text-base leading-snug break-words">
                    {item.point}
                  </h5>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed break-words">
                    {item.description}
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                {getImpactBadge(item.impact, isPro)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // If there are exactly 2 options, show them side-by-side on desktop for a perfect comparison dashboard
  const isTwoOptions = prosCons.length === 2;

  return (
    <div className="space-y-6" id="proscons-view-root">
      {isTwoOptions ? (
        <div className="space-y-8" id="sxs-wrapper">
          {prosCons.map((optGroup, optionIdx) => {
            const optImage = optionImages && optionIdx < optionImages.length ? optionImages[optionIdx] : null;
            return (
              <div key={optionIdx} className="space-y-4" id={`sxs-option-group-${optionIdx}`}>
                <div className="border-b border-slate-150 dark:border-slate-800 pb-2.5 flex items-center gap-3">
                  {optImage && (
                    <img
                      src={optImage}
                      alt={optGroup.option}
                      className="w-10 h-10 object-cover rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight" id={`option-title-${optionIdx}`}>
                    {optGroup.option}
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id={`sxs-grid-${optionIdx}`}>
                  {/* Pros Column */}
                  <div className="space-y-3" id={`pros-col-${optionIdx}`}>
                    <div className="flex items-center gap-2 px-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pros & Advantages</h4>
                    </div>
                    {renderProConList(optGroup.pros, true)}
                  </div>

                  {/* Cons Column */}
                  <div className="space-y-3" id={`cons-col-${optionIdx}`}>
                    <div className="flex items-center gap-2 px-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cons & Obstacles</h4>
                    </div>
                    {renderProConList(optGroup.cons, false)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6" id="tabbed-wrapper">
          {/* Tab select bar */}
          <div className="flex overflow-x-auto whitespace-nowrap flex-nowrap border-b border-slate-100 dark:border-slate-800 scrollbar-none" id="options-tab-bar">
            {prosCons.map((optGroup, idx) => {
              const optImage = optionImages && idx < optionImages.length ? optionImages[idx] : null;
              return (
                <button
                  key={idx}
                  id={`option-tab-${idx}`}
                  onClick={() => setActiveTab(idx)}
                  className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 ${
                    activeTab === idx
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/20"
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  {optImage && (
                    <img 
                      src={optImage} 
                      alt="" 
                      className="w-5 h-5 object-cover rounded-md border border-slate-200/50 dark:border-slate-800 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {optGroup.option}
                </button>
              );
            })}
          </div>

          {/* Active Tab Image Banner (Optional) */}
          {optionImages && activeTab < optionImages.length && optionImages[activeTab] && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-xs">
              <img 
                src={optionImages[activeTab] || ""} 
                alt={prosCons[activeTab].option} 
                className="w-12 h-12 object-cover rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Option context</h4>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{prosCons[activeTab].option}</p>
              </div>
            </div>
          )}

          {/* Active Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="active-tab-grid">
            {/* Pros Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pros & Advantages</h4>
              </div>
              {renderProConList(prosCons[activeTab].pros, true)}
            </div>

            {/* Cons Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cons & Obstacles</h4>
              </div>
              {renderProConList(prosCons[activeTab].cons, false)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
