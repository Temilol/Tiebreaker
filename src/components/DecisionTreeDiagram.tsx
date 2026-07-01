import React, { useMemo, useRef, useState, useEffect } from "react";
import * as d3 from "d3";
import { GitFork, Sparkles, AlertCircle, Maximize2, Minimize2 } from "lucide-react";
import { SavedDecision } from "../types";

interface DecisionTreeDiagramProps {
  activeDecision: SavedDecision;
  savedDecisions: SavedDecision[];
  onSelectDecision: (id: string) => void;
  onBranchOption: (optionName: string) => void;
}

interface TreeNode {
  id: string;
  name: string;
  type: "decision" | "option" | "active" | "placeholder";
  decisionId?: string;
  optionName?: string;
  children?: TreeNode[];
}

export default function DecisionTreeDiagram({
  activeDecision,
  savedDecisions,
  onSelectDecision,
  onBranchOption,
}: DecisionTreeDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Resize handler to make it fully responsive
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        // Keep a minimum width, and compute height dynamically or keep it proportional
        const computedWidth = Math.max(width, 500);
        const computedHeight = isFullscreen ? window.innerHeight - 150 : 380;
        setDimensions({ width: computedWidth, height: computedHeight });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [isFullscreen]);

  // Construct the lineage tree
  const treeData = useMemo(() => {
    // 1. Find the top-most ancestor of the active decision
    let rootDecision = activeDecision;
    const maxDepthGuard = 15; // Prevent any potential infinite loops
    let depth = 0;
    while (rootDecision.parentId && depth < maxDepthGuard) {
      const parent = savedDecisions.find((d) => d.id === rootDecision.parentId);
      if (!parent) break;
      rootDecision = parent;
      depth++;
    }

    // 2. Recursively build the tree node hierarchy starting from that root decision
    function buildNode(decision: SavedDecision): TreeNode {
      const isCurrentActive = decision.id === activeDecision.id;
      const node: TreeNode = {
        id: `dec-${decision.id}`,
        name: decision.topic,
        type: isCurrentActive ? "active" : "decision",
        decisionId: decision.id,
        children: [],
      };

      // Create option connection nodes for each option of this decision
      decision.options.forEach((opt) => {
        const optNode: TreeNode = {
          id: `opt-${decision.id}-${opt}`,
          name: opt,
          type: "option",
          optionName: opt,
          children: [],
        };

        // Find child decisions branched off this specific option
        const children = savedDecisions.filter(
          (d) => d.parentId === decision.id && (d.branchedFromOption || "").toLowerCase() === opt.toLowerCase()
        );

        if (children.length > 0) {
          children.forEach((child) => {
            optNode.children!.push(buildNode(child));
          });
        } else if (isCurrentActive) {
          // Placeholder for mapping next-level sub-dilemmas for the ACTIVE decision
          optNode.children!.push({
            id: `add-${decision.id}-${opt}`,
            name: "Create sub-dilemma...",
            type: "placeholder",
            optionName: opt,
            decisionId: decision.id,
          });
        }

        // Only push if there's a child, a placeholder, or if it's the active decision node (keeps the graph clean)
        if (optNode.children!.length > 0 || isCurrentActive || children.length > 0) {
          node.children!.push(optNode);
        }
      });

      return node;
    }

    return buildNode(rootDecision);
  }, [activeDecision, savedDecisions]);

  // D3 layout calculations
  const { nodes, links } = useMemo(() => {
    const hierarchyRoot = d3.hierarchy<TreeNode>(treeData);

    // Dynamic sizing depending on tree size
    const nodeCount = hierarchyRoot.descendants().length;
    const depthCount = hierarchyRoot.height + 1;

    const widthMargin = 220;
    // Set tree size so nodes are spaced nicely
    const treeLayout = d3
      .tree<TreeNode>()
      .size([dimensions.height - 60, dimensions.width - widthMargin])
      .nodeSize([45, Math.max(120, (dimensions.width - widthMargin) / (depthCount || 2))]);

    treeLayout(hierarchyRoot);

    const nodesList = hierarchyRoot.descendants();
    const linksList = hierarchyRoot.links();

    // Re-center the tree layout vertically inside our dimensions
    let minY = Infinity;
    let maxY = -Infinity;
    nodesList.forEach((n: any) => {
      if (n.x < minY) minY = n.x;
      if (n.x > maxY) maxY = n.x;
    });

    const treeHeight = maxY - minY;
    const offsetY = (dimensions.height - treeHeight) / 2 - minY;

    nodesList.forEach((n: any) => {
      n.xActual = n.y + 40; // x-coordinate becomes actual screen horizontal position (left margin 40px)
      n.yActual = n.x + offsetY; // y-coordinate becomes actual screen vertical position
    });

    return { nodes: nodesList, links: linksList };
  }, [treeData, dimensions]);

  // Create Horizontal Bezier path generator
  const linkPathGenerator = (link: any) => {
    const sourceX = link.source.xActual;
    const sourceY = link.source.yActual;
    const targetX = link.target.xActual;
    const targetY = link.target.yActual;

    return d3.linkHorizontal()({
      source: [sourceX, sourceY],
      target: [targetX, targetY],
    });
  };

  return (
    <div className="space-y-4" id="decision-tree-container">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <GitFork className="w-4 h-4 text-indigo-500 rotate-180" />
            Decision Lineage & Branches
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive visual diagram displaying sub-dilemmas, choice options, and mapped lineage.
          </p>
        </div>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 rounded-lg transition-all cursor-pointer shadow-3xs flex items-center gap-1 text-xs font-semibold"
          title={isFullscreen ? "Minimize View" : "Maximize View"}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Normal View</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Screen</span>
            </>
          )}
        </button>
      </div>

      <div
        ref={containerRef}
        className={`relative bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl overflow-auto transition-all duration-300 ${
          isFullscreen ? "fixed inset-4 z-50 shadow-2xl bg-white dark:bg-slate-900 p-6" : ""
        }`}
        style={{ height: dimensions.height }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="overflow-visible select-none"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>

            {/* Glowing Drop Shadow for Active Node */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Render Connections (Links) */}
          <g className="links-group">
            {links.map((link: any, index) => {
              const isSourceActive = link.source.data.type === "active";
              const isTargetActive = link.target.data.type === "active";
              const isLinkActive = isSourceActive || isTargetActive;

              return (
                <path
                  key={`link-${index}`}
                  d={linkPathGenerator(link) || ""}
                  fill="none"
                  stroke={isLinkActive ? "#818cf8" : "#cbd5e1"}
                  strokeWidth={isLinkActive ? 2 : 1.2}
                  strokeDasharray={link.target.data.type === "placeholder" ? "4,4" : undefined}
                  className="transition-all duration-300 dark:stroke-slate-800"
                  style={{
                    stroke: isLinkActive ? undefined : undefined,
                  }}
                />
              );
            })}
          </g>

          {/* Render Nodes */}
          <g className="nodes-group">
            {nodes.map((node: any) => {
              const { data, xActual, yActual } = node;
              const isDecisionNode = data.type === "decision";
              const isActiveNode = data.type === "active";
              const isOptionNode = data.type === "option";
              const isPlaceholderNode = data.type === "placeholder";

              // Unique key representing position and content
              const nodeKey = `${data.id}-${xActual}-${yActual}`;

              if (isActiveNode || isDecisionNode) {
                // Decision Box Nodes
                return (
                  <g
                    key={nodeKey}
                    transform={`translate(${xActual}, ${yActual})`}
                    className="cursor-pointer group"
                    onClick={() => onSelectDecision(data.decisionId!)}
                  >
                    {/* Shadow for active node */}
                    <rect
                      x="-85"
                      y="-22"
                      width="170"
                      height="44"
                      rx="12"
                      fill={isActiveNode ? "rgba(99, 102, 241, 0.15)" : "rgba(0,0,0,0.03)"}
                      filter={isActiveNode ? "url(#glow)" : undefined}
                      className="transition-all duration-300 group-hover:scale-105"
                    />

                    {/* Outer border/box */}
                    <rect
                      x="-85"
                      y="-22"
                      width="170"
                      height="44"
                      rx="12"
                      fill={isActiveNode ? "#4f46e5" : "#ffffff"}
                      stroke={isActiveNode ? "#818cf8" : "#e2e8f0"}
                      strokeWidth={isActiveNode ? 2 : 1}
                      className="transition-all duration-300 dark:fill-slate-900 dark:stroke-slate-800 dark:group-hover:stroke-indigo-500/50 group-hover:stroke-slate-350"
                    />

                    {/* Decision Tag Label */}
                    <text
                      y="-6"
                      textAnchor="middle"
                      className={`text-[8px] font-extrabold uppercase tracking-widest ${
                        isActiveNode ? "text-indigo-200" : "text-indigo-600 dark:text-indigo-400"
                      }`}
                    >
                      Dilemma
                    </text>

                    {/* Topic text */}
                    <text
                      y="11"
                      textAnchor="middle"
                      className={`text-[10px] font-bold ${
                        isActiveNode ? "fill-white font-extrabold" : "fill-slate-700 dark:fill-slate-200"
                      }`}
                    >
                      {data.name.length > 25 ? `${data.name.slice(0, 22)}...` : data.name}
                    </text>

                    <title>{data.name}</title>
                  </g>
                );
              }

              if (isOptionNode) {
                // Option badge/pill style
                return (
                  <g
                    key={nodeKey}
                    transform={`translate(${xActual}, ${yActual})`}
                    className="select-none"
                  >
                    <rect
                      x="-65"
                      y="-14"
                      width="130"
                      height="28"
                      rx="8"
                      fill="#f8fafc"
                      stroke="#e2e8f0"
                      strokeWidth={1}
                      className="dark:fill-slate-950 dark:stroke-slate-850"
                    />
                    <text
                      y="-4"
                      textAnchor="middle"
                      className="text-[7px] font-extrabold text-slate-400 uppercase tracking-wider"
                    >
                      Option
                    </text>
                    <text
                      y="8"
                      textAnchor="middle"
                      className="text-[9px] font-bold fill-slate-600 dark:fill-slate-300"
                    >
                      {data.name.length > 20 ? `${data.name.slice(0, 18)}...` : data.name}
                    </text>
                    <title>{data.name}</title>
                  </g>
                );
              }

              if (isPlaceholderNode) {
                // Actionable dash node to create sub-decision
                return (
                  <g
                    key={nodeKey}
                    transform={`translate(${xActual}, ${yActual})`}
                    className="cursor-pointer group"
                    onClick={() => onBranchOption(data.optionName!)}
                  >
                    <rect
                      x="-65"
                      y="-14"
                      width="130"
                      height="28"
                      rx="8"
                      fill="transparent"
                      stroke="#818cf8"
                      strokeWidth={1.2}
                      strokeDasharray="3,3"
                      className="transition-all duration-300 group-hover:fill-indigo-50/10 dark:group-hover:fill-indigo-950/10 dark:stroke-indigo-800"
                    />
                    <text
                      y="3"
                      textAnchor="middle"
                      className="text-[9px] font-bold fill-indigo-600 dark:fill-indigo-400 group-hover:scale-105 transition-transform flex items-center justify-center"
                    >
                      + Branch Option
                    </text>
                    <title>Click to automatically map next choices on option "{data.optionName}"</title>
                  </g>
                );
              }

              return null;
            })}
          </g>
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-150 dark:border-slate-850 text-[10px] space-y-1.5 shadow-3xs">
          <div className="font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Legend</div>
          <div className="flex flex-col gap-1 text-slate-600 dark:text-slate-400 font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-2.5 bg-indigo-600 border border-indigo-400 rounded-sm" />
              <span>Active Dilemma</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-sm" />
              <span>Saved Sub-Dilemma</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-sm" />
              <span>Dilemma Option</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-2.5 border border-indigo-500 border-dashed rounded-sm" />
              <span>Available Branch (Interactive)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
