import React, { useState } from "react";
import { SwotReport } from "../types";
import { Plus, Minus, ArrowUpRight, AlertTriangle } from "lucide-react";

interface SwotViewProps {
  swotAnalysis: SwotReport[];
}

export default function SwotView({ swotAnalysis }: SwotViewProps) {
  const [activeTab, setActiveTab] = useState(0);

  const activeSwot = swotAnalysis[activeTab];

  if (!activeSwot) {
    return <div className="text-center py-8 text-slate-400">No SWOT analysis available.</div>;
  }

  return (
    <div className="space-y-6" id="swot-view-root">
      {/* Option Selector Tabs */}
      <div className="flex overflow-x-auto whitespace-nowrap flex-nowrap border-b border-slate-100 dark:border-slate-800 scrollbar-none" id="swot-tabs-bar">
        {swotAnalysis.map((swot, idx) => (
          <button
            key={idx}
            id={`swot-tab-btn-${idx}`}
            onClick={() => setActiveTab(idx)}
            className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === idx
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/20"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {swot.option}
          </button>
        ))}
      </div>

      {/* SWOT 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="swot-grid">
        {/* STRENGTHS */}
        <div className="bg-emerald-50/30 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 p-6 space-y-4 hover:shadow-sm transition-shadow" id="swot-strengths">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">S</span>
            <div>
              <h4 className="font-extrabold text-emerald-950 dark:text-emerald-300 text-base">Strengths</h4>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold uppercase tracking-wider">Internal &bull; Positive</p>
            </div>
          </div>
          <ul className="space-y-2.5" id="strengths-list">
            {activeSwot.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed min-w-0" id={`strength-li-${idx}`}>
                <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
                <span className="break-words min-w-0">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* WEAKNESSES */}
        <div className="bg-amber-50/30 dark:bg-amber-950/10 rounded-2xl border border-amber-100 dark:border-amber-900/20 p-6 space-y-4 hover:shadow-sm transition-shadow" id="swot-weaknesses">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-500 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">W</span>
            <div>
              <h4 className="font-extrabold text-amber-950 dark:text-amber-300 text-base">Weaknesses</h4>
              <p className="text-[10px] text-amber-600 dark:text-amber-500 font-semibold uppercase tracking-wider">Internal &bull; Negative</p>
            </div>
          </div>
          <ul className="space-y-2.5" id="weaknesses-list">
            {activeSwot.weaknesses.map((weak, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed min-w-0" id={`weakness-li-${idx}`}>
                <Minus className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <span className="break-words min-w-0">{weak}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* OPPORTUNITIES */}
        <div className="bg-indigo-50/30 dark:bg-indigo-950/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/20 p-6 space-y-4 hover:shadow-sm transition-shadow" id="swot-opportunities">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-500 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">O</span>
            <div>
              <h4 className="font-extrabold text-indigo-950 dark:text-indigo-300 text-base">Opportunities</h4>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-500 font-semibold uppercase tracking-wider">External &bull; Positive</p>
            </div>
          </div>
          <ul className="space-y-2.5" id="opportunities-list">
            {activeSwot.opportunities.map((opp, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed min-w-0" id={`opportunity-li-${idx}`}>
                <ArrowUpRight className="w-4 h-4 text-indigo-600 dark:text-indigo-500 shrink-0 mt-0.5" />
                <span className="break-words min-w-0">{opp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* THREATS */}
        <div className="bg-rose-50/30 dark:bg-rose-950/10 rounded-2xl border border-rose-100 dark:border-rose-900/20 p-6 space-y-4 hover:shadow-sm transition-shadow" id="swot-threats">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-rose-500 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">T</span>
            <div>
              <h4 className="font-extrabold text-rose-950 dark:text-rose-300 text-base">Threats</h4>
              <p className="text-[10px] text-rose-600 dark:text-rose-500 font-semibold uppercase tracking-wider">External &bull; Negative</p>
            </div>
          </div>
          <ul className="space-y-2.5" id="threats-list">
            {activeSwot.threats.map((thr, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed min-w-0" id={`threat-li-${idx}`}>
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-500 shrink-0 mt-0.5" />
                <span className="break-words min-w-0">{thr}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
