import React, { useState, useEffect } from "react";
import {
  Sparkles,
  HelpCircle,
  Share2,
  Printer,
  ChevronRight,
  Plus,
  Trash2,
  FileText,
  Scale,
  CheckCircle,
  Award,
  TrendingUp,
  AlertCircle,
  TrendingDown,
  Activity,
  Menu,
  X,
  Sun,
  Moon,
  Search,
  Layers,
  MessageSquare,
  GitFork,
} from "lucide-react";
import { SavedDecision, DecisionReport } from "./types";
import { AnimatePresence, motion } from "motion/react";
import DecisionForm, {
  getTagStyleAndIcon,
  STANDARD_TAGS,
} from "./components/DecisionForm";
import VerdictView from "./components/VerdictView";
import ProsConsView from "./components/ProsConsView";
import ComparisonView from "./components/ComparisonView";
import SwotView from "./components/SwotView";
import ComparativeDashboard from "./components/ComparativeDashboard";
import DecisionChat from "./components/DecisionChat";
import DecisionTreeDiagram from "./components/DecisionTreeDiagram";

export default function App() {
  const [savedDecisions, setSavedDecisions] = useState<SavedDecision[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "verdict" | "proscons" | "comparison" | "swot" | "tree" | "chat"
  >("verdict");
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const tabOrder = [
    "verdict",
    "proscons",
    "comparison",
    "swot",
    "tree",
    "chat",
  ] as const;
  const [shareSuccess, setShareSuccess] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deletedDecision, setDeletedDecision] = useState<{
    decision: SavedDecision;
    index: number;
  } | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagFilter, setSelectedTagFilter] = useState("All");

  const handleTabSwipe = (direction: "left" | "right") => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex === -1) return;
    const nextIndex =
      direction === "left"
        ? Math.min(currentIndex + 1, tabOrder.length - 1)
        : Math.max(currentIndex - 1, 0);
    setActiveTab(tabOrder[nextIndex]);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0].clientX);
    setTouchStartY(event.touches[0].clientY);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null || touchStartY === null) return;
    const dx = event.touches[0].clientX - touchStartX;
    const dy = event.touches[0].clientY - touchStartY;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) {
      handleTabSwipe("left");
    } else {
      handleTabSwipe("right");
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [isCalmMode, setIsCalmMode] = useState(false);
  const [selectedComparisonIds, setSelectedComparisonIds] = useState<string[]>(
    [],
  );
  const [branchingData, setBranchingData] = useState<{
    parentId: string;
    branchedFromOption: string;
    parentTopic: string;
    suggestedTopic: string;
    suggestedOptions: string[];
    suggestedPreferences: string;
    suggestedTag: string;
    isLoading?: boolean;
  } | null>(null);
  const [isGeneratingBranch, setIsGeneratingBranch] = useState<string | null>(
    null,
  );
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("tiebreaker_theme");
      if (saved === "dark") return true;
      if (saved === "light") return false;
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch (e) {
      return false;
    }
  });

  // Handle dark mode side-effects and localStorage persistence
  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("tiebreaker_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("tiebreaker_theme", "light");
      }
    } catch (e) {
      console.error("Theme toggle error", e);
    }
  }, [isDarkMode]);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tiebreaker_decisions");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedDecisions(parsed);
          if (parsed.length > 0) {
            setActiveId(parsed[0].id);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load saved decisions:", e);
    }
  }, []);

  // Handle toast auto-dismissal
  useEffect(() => {
    if (showUndoToast) {
      const timer = setTimeout(() => {
        setShowUndoToast(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [showUndoToast]);

  // Save to LocalStorage
  const saveDecisionsToStorage = (updated: SavedDecision[]) => {
    setSavedDecisions(updated);
    try {
      localStorage.setItem("tiebreaker_decisions", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save decisions to storage:", e);
    }
  };

  const activeDecision = savedDecisions.find((d) => d.id === activeId) || null;

  const filteredDecisions = savedDecisions.filter((decision) => {
    // 1. Tag filter matching
    if (selectedTagFilter !== "All") {
      const decisionTags = decision.tags || ["Personal"];
      if (
        !decisionTags.some(
          (t) => t.toLowerCase() === selectedTagFilter.toLowerCase(),
        )
      ) {
        return false;
      }
    }

    // 2. Search query matching
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const topicMatches = decision.topic.toLowerCase().includes(query);
      const optionsMatches = decision.options.some((opt) =>
        opt.toLowerCase().includes(query),
      );
      const decisionTags = decision.tags || ["Personal"];
      const tagMatches = decisionTags.some((t) =>
        t.toLowerCase().includes(query),
      );
      return topicMatches || optionsMatches || tagMatches;
    }

    return true;
  });

  const handleNewDecisionClick = () => {
    setActiveId(null);
    setError(null);
    setSidebarOpen(false);
  };

  const handleSelectDecision = (id: string) => {
    if (isComparisonMode) {
      setSelectedComparisonIds((prev) => {
        if (prev.includes(id)) {
          return prev.filter((item) => item !== id);
        } else {
          if (prev.length >= 3) {
            return prev; // Max 3
          }
          return [...prev, id];
        }
      });
    } else {
      setActiveId(id);
      setError(null);
      setSidebarOpen(false);
    }
  };

  const handleDeleteDecision = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const decisionToDelete = savedDecisions.find((d) => d.id === id);
    if (!decisionToDelete) return;

    const index = savedDecisions.findIndex((d) => d.id === id);
    const updated = savedDecisions.filter((d) => d.id !== id);

    setDeletedDecision({ decision: decisionToDelete, index });
    setShowUndoToast(true);

    setSelectedComparisonIds((prev) => prev.filter((item) => item !== id));

    saveDecisionsToStorage(updated);
    if (activeId === id) {
      setActiveId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleUndoDelete = () => {
    if (!deletedDecision) return;
    const { decision, index } = deletedDecision;
    const updated = [...savedDecisions];

    if (index >= 0 && index <= updated.length) {
      updated.splice(index, 0, decision);
    } else {
      updated.push(decision);
    }

    saveDecisionsToStorage(updated);
    setActiveId(decision.id);
    setDeletedDecision(null);
    setShowUndoToast(false);
  };

  const handleUpdateChatHistory = (decisionId: string, newHistory: any) => {
    const updated = savedDecisions.map((d) => {
      if (d.id === decisionId) {
        return { ...d, chatHistory: newHistory };
      }
      return d;
    });
    setSavedDecisions(updated);
    saveDecisionsToStorage(updated);
  };

  const handleFormSubmit = async (
    topic: string,
    options: string[],
    preferences: string,
    tags: string[],
    parentId?: string,
    branchedFromOption?: string,
    optionImages?: (string | null)[],
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tiebreak", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic, options, preferences, optionImages }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error || `Server responded with status ${response.status}`,
        );
      }

      const report: DecisionReport = await response.json();
      const newId = crypto.randomUUID();

      const newDecision: SavedDecision = {
        id: newId,
        topic,
        options,
        optionImages,
        preferences,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        report,
        tags,
        parentId,
        branchedFromOption,
      };

      let updated = [newDecision, ...savedDecisions];

      // If this is a child decision, update parent's childIds too!
      if (parentId) {
        updated = updated.map((d) => {
          if (d.id === parentId) {
            const currentChildren = d.childIds || [];
            return {
              ...d,
              childIds: currentChildren.includes(newId)
                ? currentChildren
                : [...currentChildren, newId],
            };
          }
          return d;
        });
      }

      saveDecisionsToStorage(updated);
      setActiveId(newId);
      setActiveTab("verdict");
      setBranchingData(null); // Clear branching context on success
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(
        err.message || "Failed to analyze decision. Please check server logs.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBranchOption = async (optionName: string) => {
    if (!activeDecision) return;
    setIsGeneratingBranch(optionName);
    setError(null);

    // Transition immediately by setting branchingData to loading state and nullifying activeId
    setBranchingData({
      parentId: activeDecision.id,
      branchedFromOption: optionName,
      parentTopic: activeDecision.topic,
      suggestedTopic: "",
      suggestedOptions: ["", ""],
      suggestedPreferences: "",
      suggestedTag: activeDecision.tags?.[0] || "Personal",
      isLoading: true,
    });
    setActiveId(null);

    try {
      const response = await fetch("/api/suggest-branch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentTopic: activeDecision.topic,
          branchedFromOption: optionName,
          preferences: activeDecision.preferences,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to generate branch suggestion: status ${response.status}`,
        );
      }

      const suggestion = await response.json();

      setBranchingData({
        parentId: activeDecision.id,
        branchedFromOption: optionName,
        parentTopic: activeDecision.topic,
        suggestedTopic: suggestion.suggestedTopic,
        suggestedOptions: suggestion.suggestedOptions,
        suggestedPreferences: suggestion.suggestedPreferences,
        suggestedTag: suggestion.suggestedTag || "Personal",
        isLoading: false,
      });
    } catch (err: any) {
      console.error("Branching generation failed:", err);
      setError(
        err.message ||
          "Failed to generate branching suggestion. You can still manually state your sub-dilemma.",
      );

      // Fallback: load form anyway with manual entries
      setBranchingData({
        parentId: activeDecision.id,
        branchedFromOption: optionName,
        parentTopic: activeDecision.topic,
        suggestedTopic: `Next level choices for: ${optionName}`,
        suggestedOptions: ["", ""],
        suggestedPreferences: `Analyze next implementation steps for "${optionName}" from original topic "${activeDecision.topic}"`,
        suggestedTag: activeDecision.tags?.[0] || "Personal",
        isLoading: false,
      });
    } finally {
      setIsGeneratingBranch(null);
    }
  };

  const handleCancelBranching = () => {
    const parentId = branchingData?.parentId;
    setBranchingData(null);
    if (parentId) {
      setActiveId(parentId);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="flex h-screen w-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden relative transition-colors duration-200"
      id="app-root-layout"
    >
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          id="sidebar-backdrop"
        />
      )}

      {/* Sidebar (Sleek Theme Slate-900) */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 flex flex-col shrink-0 border-r border-slate-800 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        id="sidebar-container"
      >
        {/* Brand Header */}
        <div
          className="p-6 flex items-center justify-between border-b border-slate-800"
          id="sidebar-brand-header"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-lg shadow-indigo-600/20">
              T
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-base tracking-tight leading-none">
                The Tiebreaker
              </span>
              <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase mt-1">
                Analytical Consultant
              </span>
            </div>
          </div>

          {/* Close button for mobile menu */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-850 rounded-xl transition-colors cursor-pointer"
            title="Close sidebar menu"
            id="sidebar-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action button */}
        <div className="p-4 pb-2" id="sidebar-action-container">
          <button
            onClick={handleNewDecisionClick}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer group"
            id="sidebar-new-decision-btn"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            New Dilemma
          </button>
        </div>

        {/* Search & Filtering */}
        <div
          className="px-4 pb-3 space-y-3 border-b border-slate-800/65"
          id="sidebar-filter-section"
        >
          {/* Comparison Mode Toggle */}
          <div
            className="flex items-center justify-between bg-slate-850/60 p-2.5 rounded-xl border border-slate-800"
            id="comparison-toggle-container"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-200 leading-tight">
                  Comparison Mode
                </span>
                <span className="text-[9px] text-slate-500 font-medium">
                  Compare up to 3 side-by-side
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsComparisonMode((prev) => {
                  const nextVal = !prev;
                  if (!nextVal) {
                    setSelectedComparisonIds([]);
                  } else {
                    if (activeId) {
                      setSelectedComparisonIds([activeId]);
                    }
                  }
                  return nextVal;
                });
              }}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer flex items-center ${
                isComparisonMode ? "bg-indigo-600" : "bg-slate-800"
              }`}
              id="sidebar-comparison-toggle"
              title="Toggle multi-decision comparison mode"
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  isComparisonMode ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative" id="sidebar-search-wrapper">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-850 focus:bg-slate-800 border border-slate-800 focus:border-slate-700 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none transition-all"
              id="sidebar-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                title="Clear search"
                id="sidebar-search-clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dynamic Tags filter list (Only show if there are saved decisions) */}
          {savedDecisions.length > 0 && (
            <div className="space-y-1.5" id="sidebar-tags-filter">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                Tags
              </span>
              <div
                className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto pr-1"
                id="sidebar-tag-chips"
              >
                {[
                  "All",
                  ...Array.from(
                    new Set(
                      savedDecisions.flatMap((d) => d.tags || ["Personal"]),
                    ),
                  ),
                ].map((tagName: string) => {
                  const isActive = selectedTagFilter === tagName;
                  const count =
                    tagName === "All"
                      ? savedDecisions.length
                      : savedDecisions.filter((d) =>
                          (d.tags || ["Personal"]).some(
                            (t) => t.toLowerCase() === tagName.toLowerCase(),
                          ),
                        ).length;

                  return (
                    <button
                      key={tagName}
                      onClick={() => setSelectedTagFilter(tagName)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all duration-150 cursor-pointer flex items-center gap-1 shrink-0 ${
                        isActive
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                          : "bg-slate-850 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                      id={`tag-filter-btn-${tagName.toLowerCase()}`}
                    >
                      <span>{tagName}</span>
                      <span
                        className={`text-[8px] font-bold px-1 rounded ${
                          isActive
                            ? "bg-indigo-700 text-indigo-100"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Saved List Navigation */}
        <nav
          className="flex-1 px-3 space-y-1.5 mt-3 overflow-y-auto"
          id="sidebar-nav"
        >
          <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-3 mb-2 flex items-center justify-between">
            <span>
              {searchQuery || selectedTagFilter !== "All"
                ? "Filtered Results"
                : "Recent Analysis"}
            </span>
            <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[9px] font-medium">
              {filteredDecisions.length}
            </span>
          </div>

          {savedDecisions.length === 0 ? (
            <div
              className="text-center py-8 px-4"
              id="no-saved-decisions-prompt"
            >
              <p className="text-xs text-slate-500 leading-relaxed italic">
                Your analyzed decisions will appear here for side-by-side
                comparison.
              </p>
            </div>
          ) : filteredDecisions.length === 0 ? (
            <div
              className="text-center py-8 px-4"
              id="no-filtered-results-prompt"
            >
              <p className="text-xs text-slate-500 leading-relaxed italic">
                No dilemmas match your filter criteria.
              </p>
            </div>
          ) : (
            filteredDecisions.map((decision) => {
              const isActive = !isComparisonMode && decision.id === activeId;
              const isCompared =
                isComparisonMode && selectedComparisonIds.includes(decision.id);

              return (
                <div
                  key={decision.id}
                  onClick={() => handleSelectDecision(decision.id)}
                  id={`saved-decision-item-${decision.id}`}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isCompared
                      ? "bg-indigo-950/40 text-indigo-200 border-l-4 border-indigo-500 pl-2.5 dark:bg-indigo-950/20"
                      : isActive
                        ? "bg-slate-800 text-white border-l-4 border-indigo-500 pl-2.5"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {isComparisonMode && (
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all duration-150 ${
                          isCompared
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-slate-700 text-transparent hover:border-slate-500"
                        }`}
                      >
                        <svg
                          className="w-2.5 h-2.5 fill-none stroke-current stroke-[3px]"
                          viewBox="0 0 24 24"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 pr-2 flex-1">
                      <span
                        className={`truncate font-semibold text-xs leading-normal ${isCompared ? "text-indigo-200 dark:text-indigo-300 font-bold" : ""}`}
                      >
                        {decision.topic}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[9px] text-slate-500 font-normal">
                          {decision.date}
                        </span>
                        {decision.tags && decision.tags.length > 0 && (
                          <span className="text-[8px] bg-slate-850 text-slate-400 px-1 rounded border border-slate-750 font-bold tracking-wide uppercase">
                            {decision.tags.join(", ")}
                          </span>
                        )}
                        {decision.parentId && (
                          <span
                            className="text-[8px] bg-indigo-950/40 text-indigo-300 px-1 rounded border border-indigo-900/50 font-bold tracking-wide uppercase flex items-center gap-0.5"
                            title={`Branched off: ${decision.branchedFromOption}`}
                          >
                            <GitFork className="w-2 h-2 rotate-180 shrink-0" />
                            Branch
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {!isComparisonMode && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDeleteDecision(decision.id, e);
                      }}
                      className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg transition-all cursor-pointer shrink-0 focus:opacity-100 focus:outline-none"
                      title="Delete saved decision"
                      id={`delete-saved-btn-${decision.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </nav>

        {/* Footer Brand Info & Theme Toggle */}
        <div
          className="p-4 border-t border-slate-800 flex flex-col gap-3"
          id="sidebar-footer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
              Theme
            </span>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex items-center gap-1.5 px-2 py-1 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-all text-[11px] font-semibold cursor-pointer"
              title={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
              id="theme-toggle-btn"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-3 h-3 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3 h-3 text-indigo-400" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>
          <div className="text-center text-[10px] text-slate-500 flex flex-col gap-1">
            <div>Powered by Gemini AI Suite</div>
            <div>Multi-Criteria Utility Framework</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        className="flex-1 flex flex-col overflow-hidden"
        id="main-content-wrapper"
      >
        {/* Header Bar */}
        <header
          className="min-h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 px-4 md:px-6 py-2 sm:py-0 shrink-0 transition-colors duration-200 relative z-10"
          id="main-header"
        >
          <div className="flex-1 min-w-0 w-full sm:w-auto flex items-center gap-1">
            {/* Hamburger menu trigger for mobile devices */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 rounded-xl transition-all cursor-pointer shrink-0"
              title="Open sidebar menu"
              id="sidebar-toggle-btn"
            >
              <Menu className="w-5 h-5" />
            </button>

            <h1
              className="text-sm md:text-base lg:text-lg font-bold text-slate-800 dark:text-slate-100 truncate min-w-0"
              id="active-decision-title"
            >
              {isComparisonMode
                ? "Cross-Decision Comparative Dashboard"
                : activeDecision
                  ? activeDecision.topic
                  : "Analytical Decision Assistant"}
            </h1>
          </div>

          <div
            className="w-full sm:w-auto flex flex-wrap gap-2 items-center justify-between sm:justify-end mt-1.5 sm:mt-0"
            id="header-actions"
          >
            {isComparisonMode ? (
              <span className="shrink-0 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 text-[9px] md:text-[10px] font-bold rounded-full border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-1 whitespace-nowrap">
                <Layers className="w-3 h-3" />
                {selectedComparisonIds.length} / 3 SELECTED
              </span>
            ) : (
              activeDecision && (
                <span className="shrink-0 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[9px] md:text-[10px] font-bold rounded-full border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-1 whitespace-nowrap">
                  <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  AI ANALYZED
                </span>
              )
            )}
            <button
              onClick={() => setIsCalmMode((prev) => !prev)}
              className={`px-2.5 md:px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                isCalmMode
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
              title={isCalmMode ? "Turn off calm mode" : "Turn on calm mode"}
              id="calm-mode-toggle"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isCalmMode ? "Calm On" : "Calm Mode"}
              </span>
              <span className="inline sm:hidden">Calm</span>
            </button>
            {isComparisonMode
              ? selectedComparisonIds.length > 0 && (
                  <button
                    onClick={() => setSelectedComparisonIds([])}
                    className="px-2.5 md:px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Reset Selection"
                    id="clear-comparison-btn"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset Selection</span>
                  </button>
                )
              : activeDecision && (
                  <>
                    <button
                      onClick={handlePrint}
                      className="px-2.5 md:px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Print Report as PDF"
                      id="print-report-btn"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Print Report</span>
                    </button>
                    <button
                      onClick={handleShare}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        shareSuccess
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                      }`}
                      id="share-report-btn"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{shareSuccess ? "Copied!" : "Share Link"}</span>
                    </button>
                  </>
                )}
          </div>
        </header>

        {/* Scrollable Dashboard Panel */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8"
          id="dashboard-content-panel"
        >
          {error && (
            <div
              className="bg-rose-50 border border-rose-200/60 rounded-2xl p-5 flex items-start gap-3 text-rose-900"
              id="error-banner"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Decision Analysis Failed</h4>
                <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                  {error}
                </p>
              </div>
            </div>
          )}

          {isCalmMode && !isLoading && !isComparisonMode && !activeDecision && (
            <div
              className="rounded-2xl border border-emerald-200/70 bg-emerald-50/80 dark:bg-emerald-950/20 p-4 text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-3"
              id="calm-mode-banner"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>
                Calm mode is on. Start with one question and one next step.
              </span>
            </div>
          )}

          {isLoading ? (
            /* Immersive Analysis Loading Frame */
            <div
              className="flex flex-col items-center justify-center py-20 text-center space-y-6"
              id="dashboard-loading-state"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-indigo-100 dark:border-slate-800 border-t-indigo-600 dark:border-t-indigo-500 animate-spin"></div>
                <Sparkles className="w-8 h-8 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Calculating Multi-Criteria Matrix
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Synthesizing pros & cons, charting comparison scores, mapping
                  strengths/weaknesses/opportunities, and evaluating confidence
                  levels...
                </p>
              </div>
            </div>
          ) : isComparisonMode ? (
            <ComparativeDashboard
              selectedDecisions={savedDecisions.filter((d) =>
                selectedComparisonIds.includes(d.id),
              )}
              onRemove={(id) =>
                setSelectedComparisonIds((prev) =>
                  prev.filter((item) => item !== id),
                )
              }
              onViewDetails={(id) => {
                setIsComparisonMode(false);
                setActiveId(id);
              }}
            />
          ) : activeDecision ? (
            /* Active Analysis Report */
            <div className="space-y-8" id="active-decision-report">
              {/* Tree Ancestry Breadcrumbs */}
              {(activeDecision.parentId ||
                (activeDecision.childIds &&
                  activeDecision.childIds.length > 0) ||
                savedDecisions.some(
                  (d) => d.parentId === activeDecision.id,
                )) && (
                <div
                  className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/60 rounded-xl text-xs text-slate-500 dark:text-slate-400 font-semibold shadow-3xs"
                  id="decision-ancestry-breadcrumb"
                >
                  <GitFork className="w-3.5 h-3.5 rotate-180 text-indigo-500 shrink-0" />

                  {/* Parent lineage link */}
                  {(() => {
                    const parent = activeDecision.parentId
                      ? savedDecisions.find(
                          (d) => d.id === activeDecision.parentId,
                        )
                      : null;
                    if (parent) {
                      return (
                        <>
                          <button
                            onClick={() => {
                              setActiveId(parent.id);
                              setActiveTab("verdict");
                            }}
                            className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline truncate max-w-[150px] font-bold cursor-pointer"
                          >
                            {parent.topic}
                          </button>
                          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded text-[10px] font-bold">
                            {activeDecision.branchedFromOption}
                          </span>
                          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                        </>
                      );
                    }
                    return null;
                  })()}

                  {/* Current active decision */}
                  <span
                    className="text-slate-800 dark:text-slate-100 font-extrabold truncate max-w-[200px]"
                    title={activeDecision.topic}
                  >
                    {activeDecision.topic}
                  </span>

                  {/* Child branches count */}
                  {(() => {
                    const children = savedDecisions.filter(
                      (d) => d.parentId === activeDecision.id,
                    );
                    if (children.length > 0) {
                      return (
                        <>
                          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-bold border border-emerald-100/50 dark:border-emerald-950/20">
                            {children.length}{" "}
                            {children.length === 1 ? "branch" : "branches"}
                          </span>
                        </>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}

              {isCalmMode ? (
                /* Calm Mode: just the answer and next steps, no tabs or deep analysis */
                <section
                  className="rounded-2xl border border-emerald-200/70 dark:border-emerald-900/40 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6"
                  id="calm-mode-answer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Your answer
                      </div>
                      <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 break-words">
                        {activeDecision.report.verdict.recommendedOption}
                      </div>
                      <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                        {activeDecision.report.verdict.confidence}% confidence
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                    {activeDecision.report.verdict.reasoning}
                  </p>

                  {activeDecision.report.verdict.nextSteps.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Next steps
                      </div>
                      <ul className="space-y-2">
                        {activeDecision.report.verdict.nextSteps.map(
                          (step, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2"
                            >
                              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              <span>{step}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => setIsCalmMode(false)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    id="calm-mode-show-full-analysis"
                  >
                    Show full analysis &rarr;
                  </button>
                </section>
              ) : (
                <>
                  <section
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    id="summary-cards"
                  >
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-4 transition-colors duration-200">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Recommended Choice
                        </div>
                        <div
                          className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 break-words"
                          title={
                            activeDecision.report.verdict.recommendedOption
                          }
                        >
                          {activeDecision.report.verdict.recommendedOption}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Highest strategic fit score
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-4 transition-colors duration-200">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Confidence Level
                        </div>
                        <div className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                          {activeDecision.report.verdict.confidence}%
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000"
                            style={{
                              width: `${activeDecision.report.verdict.confidence}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-4 transition-colors duration-200">
                      <div className="w-10 h-10 rounded-xl bg-amber-50/75 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Critical Challenge
                        </div>
                        <div
                          className="text-sm font-bold text-amber-800 dark:text-amber-300 mt-1 break-words"
                          title={activeDecision.report.verdict.keyTradeoff}
                        >
                          {activeDecision.report.verdict.keyTradeoff}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Primary calculated trade-off
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* View/Format Toggle Tab bar */}
                  <div
                    className="sticky -top-4 sm:-top-6 md:-top-8 z-20 border-b border-slate-200 dark:border-slate-800 flex overflow-x-auto whitespace-nowrap flex-nowrap gap-1 scrollbar-none bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm"
                    id="analysis-format-selector"
                  >
                    <button
                      onClick={() => setActiveTab("verdict")}
                      className={`py-3 px-5 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                        activeTab === "verdict"
                          ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/15 dark:bg-indigo-950/10"
                          : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-700"
                      }`}
                      id="tab-verdict"
                    >
                      <Award className="w-4 h-4" />
                      Verdict & Actions
                    </button>
                    <button
                      onClick={() => setActiveTab("proscons")}
                      className={`py-3 px-5 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                        activeTab === "proscons"
                          ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/15 dark:bg-indigo-950/10"
                          : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-700"
                      }`}
                      id="tab-proscons"
                    >
                      <FileText className="w-4 h-4" />
                      Pros & Cons List
                    </button>
                    <button
                      onClick={() => setActiveTab("comparison")}
                      className={`py-3 px-5 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                        activeTab === "comparison"
                          ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/15 dark:bg-indigo-950/10"
                          : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-700"
                      }`}
                      id="tab-comparison"
                    >
                      <Scale className="w-4 h-4" />
                      Comparison Matrix
                    </button>
                    <button
                      onClick={() => setActiveTab("swot")}
                      className={`py-3 px-5 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                        activeTab === "swot"
                          ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/15 dark:bg-indigo-950/10"
                          : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-700"
                      }`}
                      id="tab-swot"
                    >
                      <Sparkles className="w-4 h-4" />
                      SWOT Analysis
                    </button>
                    <button
                      onClick={() => setActiveTab("tree")}
                      className={`py-3 px-5 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                        activeTab === "tree"
                          ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/15 dark:bg-indigo-950/10"
                          : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-700"
                      }`}
                      id="tab-tree"
                    >
                      <GitFork className="w-4 h-4 rotate-180" />
                      Decision Tree
                    </button>
                    <button
                      onClick={() => setActiveTab("chat")}
                      className={`py-3 px-5 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                        activeTab === "chat"
                          ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/15 dark:bg-indigo-950/10"
                          : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-700"
                      }`}
                      id="tab-chat"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Ask Counsel AI
                    </button>
                  </div>

                  {/* Render Selected View */}
                  <div
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 md:p-8 shadow-sm transition-colors duration-200"
                    id="tab-content-container"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                  >
                    {activeTab === "verdict" && (
                      <VerdictView
                        verdict={activeDecision.report.verdict}
                        topic={activeDecision.topic}
                        options={activeDecision.options}
                        optionImages={activeDecision.optionImages}
                        onBranchOption={handleBranchOption}
                        childDecisions={savedDecisions.filter(
                          (d) => d.parentId === activeDecision.id,
                        )}
                        onSelectDecision={(id) => {
                          setActiveId(id);
                          setActiveTab("verdict");
                        }}
                        isGeneratingBranch={isGeneratingBranch}
                      />
                    )}
                    {activeTab === "proscons" && (
                      <ProsConsView prosCons={activeDecision.report.prosCons} />
                    )}
                    {activeTab === "comparison" && (
                      <ComparisonView
                        comparisonTable={activeDecision.report.comparisonTable}
                        options={activeDecision.options}
                      />
                    )}
                    {activeTab === "swot" && (
                      <SwotView
                        swotAnalysis={activeDecision.report.swotAnalysis}
                      />
                    )}
                    {activeTab === "tree" && (
                      <DecisionTreeDiagram
                        activeDecision={activeDecision}
                        savedDecisions={savedDecisions}
                        onSelectDecision={(id) => {
                          setActiveId(id);
                          setActiveTab("verdict");
                        }}
                        onBranchOption={handleBranchOption}
                      />
                    )}
                    {activeTab === "chat" && (
                      <DecisionChat
                        decision={activeDecision}
                        onUpdateChatHistory={(newHistory) =>
                          handleUpdateChatHistory(activeDecision.id, newHistory)
                        }
                      />
                    )}
                  </div>
                </>
              )}

              {/* Unified Full Print Report - Hidden on screen, visible in print */}
              <div
                className="hidden print:block space-y-10 text-slate-900 bg-white p-6"
                id="print-only-full-report"
              >
                {/* Header/Title Page info */}
                <div className="border-b-4 border-indigo-600 pb-4 mb-8 flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      The Tiebreaker
                    </h1>
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mt-1">
                      Analytical Decision Report
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Date Generated</p>
                    <p className="text-sm font-bold text-slate-800">
                      {activeDecision.date}
                    </p>
                  </div>
                </div>

                {/* Dilemma Header */}
                <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                    Dilemma Topic
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                    &ldquo;{activeDecision.topic}&rdquo;
                  </h2>
                  {activeDecision.preferences && (
                    <div className="pt-2 border-t border-slate-200/80 mt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        Stated Preferences & Context
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {activeDecision.preferences}
                      </p>
                    </div>
                  )}
                </div>

                <div className="page-break" />

                {/* Section 1: Verdict & Next Steps */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                    <span className="bg-indigo-600 text-white rounded-md w-6 h-6 flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    Recommendation & Verdict
                  </h3>
                  <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                        Recommended Choice
                      </span>
                      <h4 className="text-2xl font-extrabold text-indigo-950 mt-1">
                        {activeDecision.report.verdict.recommendedOption}
                      </h4>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl border border-indigo-100 text-center shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Match Score
                      </span>
                      <p className="text-2xl font-black text-indigo-600">
                        {activeDecision.report.verdict.confidence}%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        The Winning Case
                      </h5>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {activeDecision.report.verdict.reasoning}
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 space-y-2">
                        <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                          Critical Challenge
                        </h5>
                        <p className="text-xs text-amber-900 leading-relaxed">
                          {activeDecision.report.verdict.keyTradeoff}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Suggested Actions
                        </h5>
                        <ul className="space-y-2">
                          {activeDecision.report.verdict.nextSteps.map(
                            (step, idx) => (
                              <li
                                key={idx}
                                className="text-xs text-slate-700 flex items-start gap-2"
                              >
                                <span className="text-indigo-600 font-bold">
                                  &bull;
                                </span>
                                <span>{step}</span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="page-break" />

                {/* Section 2: Pros & Cons */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                    <span className="bg-indigo-600 text-white rounded-md w-6 h-6 flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    Pros & Cons Comparison
                  </h3>
                  <div className="space-y-8">
                    {activeDecision.report.prosCons.map(
                      (optGroup, optionIdx) => (
                        <div
                          key={optionIdx}
                          className="space-y-3 page-break-avoid"
                        >
                          <h4 className="text-base font-bold text-slate-800 bg-slate-100 px-4 py-2 rounded-lg border">
                            {optGroup.option}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Pros */}
                            <div className="bg-emerald-50/20 p-5 rounded-2xl border border-emerald-100 space-y-3">
                              <h5 className="font-bold text-xs text-emerald-800 uppercase tracking-wider border-b border-emerald-100 pb-1">
                                Pros
                              </h5>
                              <ul className="space-y-3">
                                {optGroup.pros.map((pro, idx) => (
                                  <li
                                    key={idx}
                                    className="text-xs text-slate-700 leading-relaxed"
                                  >
                                    <div className="flex justify-between items-center font-bold">
                                      <span className="text-slate-800">
                                        {pro.point}
                                      </span>
                                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                                        {pro.impact} impact
                                      </span>
                                    </div>
                                    <p className="text-slate-500 mt-1">
                                      {pro.description}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            {/* Cons */}
                            <div className="bg-rose-50/20 p-5 rounded-2xl border border-rose-100 space-y-3">
                              <h5 className="font-bold text-xs text-rose-800 uppercase tracking-wider border-b border-rose-100 pb-1">
                                Cons
                              </h5>
                              <ul className="space-y-3">
                                {optGroup.cons.map((con, idx) => (
                                  <li
                                    key={idx}
                                    className="text-xs text-slate-700 leading-relaxed"
                                  >
                                    <div className="flex justify-between items-center font-bold">
                                      <span className="text-slate-800">
                                        {con.point}
                                      </span>
                                      <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                                        {con.impact} impact
                                      </span>
                                    </div>
                                    <p className="text-slate-500 mt-1">
                                      {con.description}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div className="page-break" />

                {/* Section 3: Comparison Table Matrix */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                    <span className="bg-indigo-600 text-white rounded-md w-6 h-6 flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    Weighted Comparison Matrix
                  </h3>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                    <ComparisonView
                      comparisonTable={activeDecision.report.comparisonTable}
                      options={activeDecision.options}
                    />
                  </div>
                </div>

                <div className="page-break" />

                {/* Section 4: SWOT Analysis Quadrants */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                    <span className="bg-indigo-600 text-white rounded-md w-6 h-6 flex items-center justify-center text-xs font-bold">
                      4
                    </span>
                    Complete SWOT Quadrants
                  </h3>
                  <div className="space-y-8">
                    {activeDecision.report.swotAnalysis.map((swot, idx) => (
                      <div key={idx} className="space-y-3 page-break-avoid">
                        <h4 className="text-base font-bold text-slate-800 bg-slate-100 px-4 py-2 rounded-lg border">
                          {swot.option} SWOT Profile
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-emerald-50/20 p-4 rounded-xl border border-emerald-100">
                            <h5 className="font-bold text-xs text-emerald-800 uppercase tracking-wider mb-2 border-b border-emerald-100 pb-1">
                              Strengths (S)
                            </h5>
                            <ul className="list-disc list-inside space-y-1">
                              {swot.strengths.map((s, i) => (
                                <li key={i} className="text-xs text-slate-700">
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-amber-50/20 p-4 rounded-xl border border-amber-100">
                            <h5 className="font-bold text-xs text-amber-800 uppercase tracking-wider mb-2 border-b border-amber-100 pb-1">
                              Weaknesses (W)
                            </h5>
                            <ul className="list-disc list-inside space-y-1">
                              {swot.weaknesses.map((w, i) => (
                                <li key={i} className="text-xs text-slate-700">
                                  {w}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-indigo-50/20 p-4 rounded-xl border border-indigo-100">
                            <h5 className="font-bold text-xs text-indigo-800 uppercase tracking-wider mb-2 border-b border-indigo-100 pb-1">
                              Opportunities (O)
                            </h5>
                            <ul className="list-disc list-inside space-y-1">
                              {swot.opportunities.map((o, i) => (
                                <li key={i} className="text-xs text-slate-700">
                                  {o}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-rose-50/20 p-4 rounded-xl border border-rose-100">
                            <h5 className="font-bold text-xs text-rose-800 uppercase tracking-wider mb-2 border-b border-rose-100 pb-1">
                              Threats (T)
                            </h5>
                            <ul className="list-disc list-inside space-y-1">
                              {swot.threats.map((t, i) => (
                                <li key={i} className="text-xs text-slate-700">
                                  {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Welcome / New Decision Form View */
            <div
              className="max-w-3xl mx-auto space-y-8 py-4"
              id="welcome-form-wrapper"
            >
              <div className="text-center space-y-3" id="welcome-hero">
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  Tackle Complex Choices with Confidence
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                  The Tiebreaker evaluates your alternatives across critical
                  dimensions, charts side-by-side matrices, and maps complete
                  SWOT quadrants to clear your path.
                </p>
              </div>

              <DecisionForm
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
                branchingData={branchingData}
                onCancelBranching={handleCancelBranching}
              />
            </div>
          )}
        </div>
      </main>

      {/* Toast Notification with Undo Action */}
      <AnimatePresence>
        {showUndoToast && deletedDecision && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 bg-slate-900 dark:bg-slate-850 text-white px-4 py-3.5 rounded-xl shadow-2xl border border-slate-800 dark:border-slate-700 max-w-sm w-full sm:w-auto"
            id="undo-toast-notification"
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Decision Deleted
                </p>
                <p
                  className="text-sm font-bold truncate text-slate-100 max-w-[180px] sm:max-w-[220px]"
                  title={deletedDecision.decision.topic}
                >
                  {deletedDecision.decision.topic}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleUndoDelete}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] flex items-center gap-1"
                id="toast-undo-btn"
              >
                Undo
              </button>
              <button
                onClick={() => setShowUndoToast(false)}
                className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                id="toast-close-btn"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
