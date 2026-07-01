import React from "react";
import { Scale, HelpCircle } from "lucide-react";
import { ComparisonCriteria } from "../types";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface ComparisonViewProps {
  comparisonTable: ComparisonCriteria[];
  options: string[];
}

export default function ComparisonView({ comparisonTable, options }: ComparisonViewProps) {
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

  // Calculate average scores
  const getTotals = () => {
    const totals: { [key: string]: number } = {};
    const counts: { [key: string]: number } = {};

    options.forEach(opt => {
      totals[opt] = 0;
      counts[opt] = 0;
    });

    comparisonTable.forEach(row => {
      row.optionScores.forEach(scoreItem => {
        // Find closest match in case of minor naming variations
        const matchedOpt = options.find(o => o.toLowerCase() === scoreItem.option.toLowerCase()) || scoreItem.option;
        if (totals[matchedOpt] !== undefined) {
          totals[matchedOpt] += scoreItem.score;
          counts[matchedOpt] += 1;
        }
      });
    });

    const averages: { [key: string]: number } = {};
    options.forEach(opt => {
      averages[opt] = counts[opt] > 0 ? Number((totals[opt] / counts[opt]).toFixed(1)) : 0;
    });

    return { totals, averages };
  };

  const { totals, averages } = getTotals();

  // Find the highest score option
  const winner = Object.keys(averages).reduce((a, b) => (averages[a] > averages[b] ? a : b), options[0]);

  // Map comparisonTable data for Recharts RadarChart
  const chartData = comparisonTable.map(row => {
    const dataPoint: { [key: string]: any } = {
      subject: row.criteria,
    };
    options.forEach(option => {
      const scoreObj = row.optionScores.find(
        s => s.option.toLowerCase() === option.toLowerCase()
      );
      dataPoint[option] = scoreObj ? scoreObj.score : 3;
    });
    return dataPoint;
  });

  const colors = [
    { stroke: "#4f46e5", fill: "#818cf8", fillOpacity: 0.25 }, // Indigo
    { stroke: "#0d9488", fill: "#2dd4bf", fillOpacity: 0.25 }, // Teal
    { stroke: "#e11d48", fill: "#fb7185", fillOpacity: 0.25 }, // Rose
    { stroke: "#ea580c", fill: "#fb923c", fillOpacity: 0.25 }, // Orange
    { stroke: "#2563eb", fill: "#60a5fa", fillOpacity: 0.25 }, // Blue
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[140px]">
          <p className="font-bold text-slate-800 dark:text-slate-200">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.stroke || entry.color }} />
                  <span className="text-slate-500 dark:text-slate-400 font-medium truncate max-w-[100px]">{entry.name}</span>
                </div>
                <span className="font-extrabold text-slate-800 dark:text-slate-150 shrink-0">{entry.value} / 5</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderDots = (score: number) => {
    return (
      <div className="flex items-center gap-1 shrink-0" title={`Score: ${score}/5`}>
        {[1, 2, 3, 4, 5].map(dot => (
          <span
            key={dot}
            className={`w-2.5 h-2.5 rounded-full ${
              dot <= score ? "bg-indigo-600 dark:bg-indigo-400" : "bg-slate-200 dark:bg-slate-800"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6" id="comparison-view-root">
      <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-850/60 rounded-xl p-4 flex items-center gap-3" id="comparison-header-note">
        <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
          <strong>Comparison Matrix:</strong> We compare your choices across key structural dimensions. Each option is scored on a scale from 1 (poor) to 5 (excellent).
        </p>
      </div>

      {/* Radar Chart Card */}
      <div 
        className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-850/60 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col items-center justify-center space-y-4 print:bg-white print:border-slate-300"
        id="comparison-radar-chart-card"
      >
        <div className="text-center space-y-1 w-full border-b border-slate-250/50 dark:border-slate-800/50 pb-4 mb-2">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-250 uppercase tracking-wider">
            Decision Performance Profile
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Multi-dimensional visual overview of competing options
          </p>
        </div>

        <div className="w-full h-[320px] sm:h-[360px] flex items-center justify-center" id="radar-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              <PolarGrid stroke={isDark ? "#334155" : "#e2e8f0"} />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: isDark ? "#94a3b8" : "#475569", fontSize: 11, fontWeight: 500 }}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 5]} 
                tickCount={6} 
                tick={{ fill: isDark ? "#64748b" : "#94a3b8", fontSize: 10 }}
                stroke={isDark ? "#334155" : "#e2e8f0"}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#cbd5e1' : '#334155' }}
              />
              {options.map((option, idx) => {
                const color = colors[idx % colors.length];
                return (
                  <Radar
                    key={option}
                    name={option}
                    dataKey={option}
                    stroke={color.stroke}
                    fill={color.fill}
                    fillOpacity={color.fillOpacity}
                    strokeWidth={2}
                    activeDot={{ r: 4 }}
                  />
                );
              })}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm" id="comparison-table-wrapper">
        <table className="w-full text-left border-collapse bg-white dark:bg-slate-900" id="comparison-table">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">
              <th className="py-4 px-5 font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider min-w-[150px]">
                Dimension
              </th>
              {options.map((option, idx) => (
                <th key={idx} className="py-4 px-5 font-bold text-slate-800 dark:text-slate-200 text-center min-w-[200px]">
                  {option}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {comparisonTable.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/10 transition-colors" id={`comparison-row-${rowIdx}`}>
                {/* Criteria Header Cell */}
                <td className="py-4 px-5 font-semibold text-slate-900 dark:text-slate-100 text-sm">
                  {row.criteria}
                </td>

                {/* Score Cells for Options */}
                {options.map((option, optIdx) => {
                  const scoreObj = row.optionScores.find(
                    s => s.option.toLowerCase() === option.toLowerCase()
                  ) || row.optionScores[optIdx] || { score: 3, justification: "Neutral rating" };

                  return (
                    <td key={optIdx} className="py-4 px-5 text-center" id={`cell-${rowIdx}-${optIdx}`}>
                      <div className="flex flex-col items-center justify-center space-y-2">
                        {renderDots(scoreObj.score)}
                        <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed max-w-[220px] text-center italic">
                          &ldquo;{scoreObj.justification}&rdquo;
                        </p>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Total Summary Row */}
            <tr className="bg-slate-50/50 dark:bg-slate-950/20 font-bold border-t-2 border-slate-200 dark:border-slate-800 text-sm" id="comparison-totals-row">
              <td className="py-5 px-5 text-slate-800 dark:text-slate-200 font-extrabold flex flex-col">
                <span>Summary Matrix Score</span>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">Average rating</span>
              </td>
              {options.map((option, idx) => {
                const isWinner = option === winner;
                return (
                  <td key={idx} className="py-5 px-5 text-center" id={`total-score-col-${idx}`}>
                    <div className="flex flex-col items-center justify-center">
                      <span className={`text-lg md:text-xl font-extrabold ${isWinner ? "text-indigo-600 dark:text-indigo-400" : "text-slate-700 dark:text-slate-400"}`}>
                        {averages[option]} / 5.0
                      </span>
                      {isWinner && (
                        <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full mt-1.5 uppercase tracking-wider">
                          Leading Option
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
