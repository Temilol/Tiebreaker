import React from "react";
import { SavedDecision } from "../types";
import { 
  Award, 
  TrendingUp, 
  Activity, 
  Trash2, 
  ExternalLink, 
  Layers, 
  Scale, 
  Info, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  ArrowRight,
  Plus
} from "lucide-react";
import { getTagStyleAndIcon } from "./DecisionForm";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";

interface ComparativeDashboardProps {
  selectedDecisions: SavedDecision[];
  onRemove: (id: string) => void;
  onViewDetails: (id: string) => void;
}

export default function ComparativeDashboard({
  selectedDecisions,
  onRemove,
  onViewDetails,
}: ComparativeDashboardProps) {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  if (selectedDecisions.length === 0) {
    return (
      <div 
        className="max-w-2xl mx-auto text-center py-16 px-6 bg-slate-50/50 dark:bg-slate-950/15 border border-dashed border-slate-250 dark:border-slate-800 rounded-3xl space-y-6"
        id="comparative-empty-state"
      >
        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
          <Layers className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            No Decisions Selected for Comparison
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Toggle <strong className="text-slate-700 dark:text-slate-200">Comparison Mode</strong> in the sidebar, then check the boxes of up to three analyzed dilemmas to align, compare, and contrast their metrics side-by-side.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 px-3.5 py-1.5 rounded-full border border-indigo-100/60 dark:border-indigo-900/40 w-fit mx-auto">
          <Info className="w-3.5 h-3.5" />
          <span>Compare confidence levels, options, tradeoffs, and recommendations</span>
        </div>
      </div>
    );
  }

  // Calculate some fun comparative stats
  const highestConfidenceDecision = [...selectedDecisions].sort(
    (a, b) => b.report.verdict.confidence - a.report.verdict.confidence
  )[0];

  const totalOptionsCount = selectedDecisions.reduce(
    (acc, d) => acc + d.options.length,
    0
  );

  // Prepare chart data for Recharts Bar Chart (Confidence Levels)
  const chartData = selectedDecisions.map((decision) => ({
    name: decision.topic.length > 25 ? decision.topic.slice(0, 22) + "..." : decision.topic,
    confidence: decision.report.verdict.confidence,
    fullName: decision.topic,
    tag: decision.tag || "Personal",
    winner: decision.report.verdict.recommendedOption,
  }));

  const chartColors = ["#6366f1", "#0d9488", "#e11d48"]; // Indigo, Teal, Rose

  return (
    <div className="space-y-8" id="comparative-dashboard-root">
      {/* Overview Analytics Banner */}
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-all duration-200"
        id="comparative-analytics-banner"
      >
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <Scale className="w-5 h-5 text-indigo-500 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Cross-Dilemma Strategic Overview
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aligning matching profiles and metrics across {selectedDecisions.length} selected choices
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Statistics panel */}
          <div className="space-y-4 lg:col-span-1">
            <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-850/50 rounded-xl flex items-start gap-3">
              <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Highest Match Certainty
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block mt-1 line-clamp-1">
                  {highestConfidenceDecision.report.verdict.recommendedOption}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  With {highestConfidenceDecision.report.verdict.confidence}% confidence
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-850/50 rounded-xl flex items-start gap-3">
              <Layers className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Aggregate Options Scored
                </span>
                <span className="text-base font-extrabold text-slate-800 dark:text-slate-100 block mt-1">
                  {totalOptionsCount} total pathways
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Across {selectedDecisions.length} analyzed decisions
                </span>
              </div>
            </div>
          </div>

          {/* Bar Chart representing Confidence Levels side-by-side */}
          <div className="lg:col-span-2 h-[160px] sm:h-[180px] bg-slate-50/30 dark:bg-slate-950/10 border border-slate-150 dark:border-slate-850 p-4 rounded-xl flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pb-1">
              Match Certainty Comparison (%)
            </div>
            <div className="w-full h-full flex-1 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: isDark ? "#64748b" : "#475569", fontSize: 9 }}
                    stroke={isDark ? "#334155" : "#e2e8f0"}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fill: isDark ? "#64748b" : "#475569", fontSize: 9 }}
                    stroke={isDark ? "#334155" : "#e2e8f0"}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-2.5 rounded-lg shadow-lg text-xs space-y-1">
                            <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{data.fullName}</p>
                            <p className="text-indigo-600 dark:text-indigo-400 font-semibold">
                              Certainty score: <span className="font-extrabold">{data.confidence}%</span>
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 text-[10px]">
                              Winner: {data.winner}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="confidence" radius={[4, 4, 0, 0]} maxBarSize={32}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Columns */}
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        id="comparative-columns-grid"
      >
        {selectedDecisions.map((decision, idx) => {
          const { recommendedOption, confidence, reasoning, keyTradeoff } = decision.report.verdict;
          const { bg, icon: Icon } = getTagStyleAndIcon(decision.tag || "Personal");
          const columnAccentColor = chartColors[idx % chartColors.length];

          // Calculate some comparison summary stats for this decision
          const totalCriteria = decision.report.comparisonTable.length;
          
          return (
            <div
              key={decision.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full overflow-hidden relative"
              style={{ borderTop: `4px solid ${columnAccentColor}` }}
              id={`comparative-col-${decision.id}`}
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 relative">
                {/* Remove action button */}
                <button
                  onClick={() => onRemove(decision.id)}
                  className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Remove from comparison"
                  id={`remove-comp-btn-${decision.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex flex-col gap-2 pr-6">
                  {decision.tag && (
                    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border w-fit ${bg}`}>
                      <Icon className="w-3 h-3" />
                      {decision.tag}
                    </span>
                  )}
                  <h4 
                    className="text-sm font-extrabold text-slate-850 dark:text-slate-100 line-clamp-3 leading-snug mt-1"
                    title={decision.topic}
                  >
                    &ldquo;{decision.topic}&rdquo;
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold">{decision.date}</span>
                </div>
              </div>

              {/* Card Body - Flex Columns */}
              <div className="p-5 flex-1 flex flex-col space-y-6">
                {/* Recommendation Block */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Recommended Option
                    </span>
                    <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {confidence}% Certainty
                    </span>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-indigo-50/30 dark:bg-indigo-950/15 border border-indigo-100/50 dark:border-indigo-900/30 space-y-2">
                    <div className="flex items-start gap-2">
                      <Award className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100 leading-snug break-words">
                        {recommendedOption}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-4">
                      {reasoning}
                    </p>
                  </div>
                </div>

                {/* Key Tradeoff Warning */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Critical Challenge
                  </span>
                  <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-xl flex items-start gap-2.5">
                    <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-medium text-amber-900 dark:text-amber-300 leading-relaxed line-clamp-3">
                      {keyTradeoff}
                    </p>
                  </div>
                </div>

                {/* Alternatives and average performance summary */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Pathway Scoring ({totalCriteria} criteria)
                  </span>
                  <div className="space-y-2" id={`scores-${decision.id}`}>
                    {decision.options.map((opt) => {
                      // Calculate average score for this option from comparison table
                      const scores = decision.report.comparisonTable.flatMap(row => 
                        row.optionScores
                          .filter(s => s.option.toLowerCase() === opt.toLowerCase())
                          .map(s => s.score)
                      );
                      const average = scores.length > 0 
                        ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)
                        : "3.0";
                      
                      const isWinner = opt.toLowerCase() === recommendedOption.toLowerCase();

                      return (
                        <div key={opt} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className={`truncate max-w-[170px] ${isWinner ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-600 dark:text-slate-400"}`}>
                              {opt}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 text-[10px]">
                              {average} / 5
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-1.5 rounded-full ${isWinner ? "bg-indigo-500" : "bg-slate-400 dark:bg-slate-600"}`} 
                              style={{ width: `${(parseFloat(average) / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50/30 dark:bg-slate-950/10 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
                <button
                  onClick={() => onViewDetails(decision.id)}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
                  id={`view-full-btn-${decision.id}`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Full Report</span>
                </button>

                <span className="text-[10px] text-slate-400 font-semibold italic flex items-center gap-1">
                  Compare Profile
                  <ArrowRight className="w-3 h-3 text-slate-300" />
                </span>
              </div>
            </div>
          );
        })}

        {/* Placeholder slot if fewer than 3 decisions are selected */}
        {selectedDecisions.length < 3 && (
          <div 
            className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-50/10 min-h-[350px] transition-all"
            id="add-comparison-slot"
          >
            <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Compare {selectedDecisions.length === 1 ? "Another Dilemma" : "A Third Dilemma"}
              </p>
              <p className="text-[11px] text-slate-400 max-w-[180px] mx-auto leading-relaxed">
                Check the boxes of other saved entries in the sidebar to add side-by-side comparison.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
