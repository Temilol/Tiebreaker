import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

interface ChartData {
  type: "bar" | "line" | "radar" | "pie";
  title: string;
  data: any[];
  keys: string[];
}

interface DecisionChartDisplayProps {
  chart: ChartData;
}

// Visual color palette
const COLORS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Rose
  "#3b82f6", // Blue
  "#8b5cf6"  // Purple
];

export default function DecisionChartDisplay({ chart }: DecisionChartDisplayProps) {
  const { type, title, data, keys } = chart;

  if (!data || !Array.isArray(data) || data.length === 0) {
    return null;
  }

  // Determine active keys
  const activeKeys = keys && Array.isArray(keys) ? keys : (data[0] ? Object.keys(data[0]).filter(k => k !== "name" && typeof data[0][k] === "number") : []);

  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800/60" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(100, 116, 139, 0.2)",
                  borderRadius: "12px",
                  color: "#f8fafc",
                  fontSize: "12px"
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
              {activeKeys.map((key, idx) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={2.5}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case "radar":
        return (
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#cbd5e1" className="dark:stroke-slate-800" />
              <PolarAngleAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: "#64748b", fontSize: 9 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(100, 116, 139, 0.2)",
                  borderRadius: "12px",
                  color: "#f8fafc",
                  fontSize: "12px"
                }}
              />
              {activeKeys.map((key, idx) => (
                <Radar
                  key={key}
                  name={key}
                  dataKey={key}
                  stroke={COLORS[idx % COLORS.length]}
                  fill={COLORS[idx % COLORS.length]}
                  fillOpacity={0.25}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </RadarChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(100, 116, 139, 0.2)",
                  borderRadius: "12px",
                  color: "#f8fafc",
                  fontSize: "12px"
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        );

      case "bar":
      default:
        return (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800/60" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(100, 116, 139, 0.2)",
                  borderRadius: "12px",
                  color: "#f8fafc",
                  fontSize: "12px"
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
              {activeKeys.map((key, idx) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={COLORS[idx % COLORS.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="mt-3.5 mb-2 p-4 bg-slate-50/80 dark:bg-slate-900/60 rounded-xl border border-slate-150 dark:border-slate-800/60 shadow-xs" id={`counsel-chart-${type}`}>
      <h5 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 pl-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
        {title}
      </h5>
      <div className="h-[240px] flex items-center justify-center">
        {renderChart()}
      </div>
    </div>
  );
}
