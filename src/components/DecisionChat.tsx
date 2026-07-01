import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Sparkles, 
  HelpCircle, 
  Trash2, 
  Loader2,
  ArrowRight,
  Bot,
  User,
  MessageSquare,
  Check
} from "lucide-react";
import { SavedDecision, ChatMessage } from "../types";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import DecisionChartDisplay from "./DecisionChartDisplay";

interface DecisionChatProps {
  decision: SavedDecision;
  onUpdateChatHistory: (history: ChatMessage[]) => void;
}

function parseMessageContent(text: string) {
  const chartRegex = /\[CHART_DATA\]([\s\S]*?)\[\/CHART_DATA\]/;
  const match = text.match(chartRegex);
  
  let chartData = null;
  let cleanText = text;
  
  if (match) {
    try {
      let jsonStr = match[1].trim();
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```[a-zA-Z]*\n/, "");
        jsonStr = jsonStr.replace(/\n```$/, "");
        jsonStr = jsonStr.trim();
      }
      chartData = JSON.parse(jsonStr);
      cleanText = text.replace(chartRegex, "").trim();
    } catch (err) {
      console.error("Failed to parse chart JSON:", err);
    }
  }
  
  return { cleanText, chartData };
}

export default function DecisionChat({ decision, onUpdateChatHistory }: DecisionChatProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const history = decision.chatHistory || [];

  // Sequential simulated steps of the AI thinking pipeline
  const thinkingPhases = [
    "Consulting original decision dossier",
    "Weighing visual and textual criteria inputs",
    "Running multi-criteria scenarios & risk scores",
    "Synthesizing visual charts and expert counsel response"
  ];

  // Drive the thinking step progression
  useEffect(() => {
    if (!isLoading) {
      setThinkingStep(0);
      return;
    }

    const timer1 = setTimeout(() => setThinkingStep(1), 1400);
    const timer2 = setTimeout(() => setThinkingStep(2), 2900);
    const timer3 = setTimeout(() => setThinkingStep(3), 4400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isLoading]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isLoading, thinkingStep]);

  const recommendedOption = decision.report.verdict?.recommendedOption || "the recommended option";

  const suggestedQuestions = [
    `What is the biggest hidden risk with choosing "${recommendedOption}"?`,
    "What concrete steps can I take to mitigate the trade-offs mentioned?",
    `If I decide NOT to go with "${recommendedOption}", which backup choice is best?`,
    "Can you give me a step-by-step roadmap for executing this recommendation?"
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    const userMsgId = crypto.randomUUID();
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...history, newUserMessage];
    onUpdateChatHistory(updatedHistory);
    setInput("");

    try {
      // Prepare history formatted for API
      const apiHistory = history.map(msg => ({
        role: msg.role,
        text: msg.text
      }));

      const response = await fetch("/api/followup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          topic: decision.topic,
          options: decision.options,
          preferences: decision.preferences,
          report: decision.report,
          question: textToSend,
          chatHistory: apiHistory
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to fetch response from backend.");
      }

      const data = await response.json();

      const modelMsgId = crypto.randomUUID();
      const newModelMessage: ChatMessage = {
        id: modelMsgId,
        role: "model",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      onUpdateChatHistory([...updatedHistory, newModelMessage]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setError(err.message || "Something went wrong while contacting the Tiebreaker AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    onUpdateChatHistory([]);
    setShowConfirmClear(false);
  };

  return (
    <div className="flex flex-col h-[580px] md:h-[640px] bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-250/60 dark:border-slate-800/80 overflow-hidden" id="decision-chat-panel">
      {/* Header Panel */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800/85 bg-white dark:bg-slate-900 flex justify-between items-center" id="chat-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              Tiebreaker AI Counsel
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-extrabold px-1.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/50">ACTIVE</span>
            </h3>
            <p className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-medium leading-normal mt-0.5">
              Probe assumptions, explore tradeoffs, or get execution blueprints.
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-1.5 relative z-30" id="chat-clear-actions">
            <AnimatePresence mode="popLayout">
              {showConfirmClear ? (
                <motion.div
                  key="confirm-box"
                  initial={{ opacity: 0, scale: 0.9, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 10 }}
                  className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-xs"
                >
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 px-1.5 py-0.5">
                    Clear chat?
                  </span>
                  <button
                    onClick={() => setShowConfirmClear(false)}
                    className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-250 bg-white dark:bg-slate-900 rounded-md border border-slate-200/40 dark:border-slate-800/50 cursor-pointer shadow-3xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearHistory}
                    className="px-2.5 py-1 text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-md cursor-pointer shadow-3xs hover:shadow-2xs transition-all"
                  >
                    Clear
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="trash-btn"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setShowConfirmClear(true)}
                  className="p-2 text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800/55 rounded-xl transition-all cursor-pointer"
                  title="Clear Chat History"
                  id="clear-chat-history-btn"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Main Messages Container */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5 bg-slate-50/30 dark:bg-slate-900/10" id="chat-messages-scroll-container">
        {history.length === 0 ? (
          /* Empty State / Suggestions */
          <div className="h-full flex flex-col justify-center items-center text-center px-4 max-w-xl mx-auto py-8" id="chat-empty-state">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/35 flex items-center justify-center text-indigo-500 mb-4 animate-bounce">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Interactive Decision Exploration
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Every decision recommendation is supported by rigorous logic. Challenge the winner, deep-dive into risks, or plan your next move.
            </p>

            <div className="w-full mt-8 space-y-2.5" id="suggested-prompts-container">
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-left pl-1">
                Suggested Follow-ups
              </div>
              <div className="grid grid-cols-1 gap-2">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    disabled={isLoading}
                    className="group w-full text-left p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-indigo-50/10 dark:hover:bg-indigo-950/10 transition-all text-xs text-slate-700 dark:text-slate-300 font-semibold flex items-center justify-between gap-3 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <span className="leading-snug">{q}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Messages Log */
          <div className="space-y-4" id="chat-messages-log">
            <AnimatePresence initial={false}>
              {history.map((msg, index) => {
                const isUser = msg.role === "user";
                return (
                  <motion.div 
                    key={msg.id} 
                    initial={{ opacity: 0, y: 15, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    id={`chat-message-row-${msg.id}`}
                  >
                    {/* Avatar Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isUser 
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300" 
                        : "bg-indigo-500 text-white"
                    }`} id={`chat-avatar-${msg.id}`}>
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Message Bubble */}
                    <div className="space-y-1">
                      <div className={`px-4 py-3 rounded-2xl text-xs md:text-sm leading-relaxed shadow-sm ${
                        isUser 
                          ? "bg-indigo-600 text-white rounded-tr-none" 
                          : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-slate-800/80 rounded-tl-none"
                      }`}>
                        {isUser ? (
                          <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                        ) : (() => {
                          const { cleanText, chartData } = parseMessageContent(msg.text);
                          return (
                            <div className="space-y-3">
                              <div className="markdown-body prose prose-slate dark:prose-invert prose-xs max-w-none text-slate-800 dark:text-slate-200">
                                <Markdown
                                  components={{
                                    h1: ({ children }) => (
                                      <h1 className="text-sm md:text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1 mt-4 mb-2 tracking-tight flex items-center gap-2">
                                        {children}
                                      </h1>
                                    ),
                                    h2: ({ children }) => (
                                      <h2 className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 border-l-4 border-indigo-500 pl-2.5 mt-4 mb-2 tracking-tight">
                                        {children}
                                      </h2>
                                    ),
                                    h3: ({ children }) => (
                                      <h3 className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-3 mb-1.5 flex items-center gap-1.5">
                                        <span className="w-1 h-1 bg-indigo-500 rounded-full" />
                                        {children}
                                      </h3>
                                    ),
                                    p: ({ children }) => (
                                      <p className="text-slate-600 dark:text-slate-350 text-xs md:text-sm leading-relaxed mb-3 font-medium">
                                        {children}
                                      </p>
                                    ),
                                    ul: ({ children }) => (
                                      <ul className="space-y-2.5 mb-3.5 pl-0 list-none">
                                        {children}
                                      </ul>
                                    ),
                                    li: ({ children }) => (
                                      <li className="p-3 bg-slate-50/75 dark:bg-slate-950/20 border border-slate-150/40 dark:border-slate-850/50 rounded-xl flex items-start gap-3 shadow-3xs transition-all hover:border-slate-250 dark:hover:border-slate-800">
                                        <span className="w-1.5 h-1.5 bg-indigo-500 dark:bg-indigo-400 rounded-full mt-2 shrink-0 animate-pulse" />
                                        <span className="flex-1 leading-relaxed text-slate-700 dark:text-slate-300 text-xs md:text-sm font-medium">
                                          {children}
                                        </span>
                                      </li>
                                    ),
                                    ol: ({ children }) => (
                                      <ol className="space-y-2.5 mb-3.5 pl-0 list-none">
                                        {children}
                                      </ol>
                                    ),
                                    blockquote: ({ children }) => (
                                      <blockquote className="my-4 p-3 bg-indigo-50/20 dark:bg-indigo-950/10 border-l-4 border-indigo-500 dark:border-indigo-400 rounded-r-xl text-indigo-950 dark:text-indigo-200/90 text-xs md:text-sm font-bold shadow-3xs">
                                        {children}
                                      </blockquote>
                                    ),
                                    hr: () => (
                                      <hr className="border-t border-slate-200/60 dark:border-slate-800/80 my-4" />
                                    ),
                                    code: ({ children }) => (
                                      <code className="px-1.5 py-0.5 bg-slate-150 dark:bg-slate-800/75 rounded text-indigo-600 dark:text-indigo-400 font-mono text-[11px] md:text-xs">
                                        {children}
                                      </code>
                                    ),
                                  }}
                                >
                                  {cleanText}
                                </Markdown>
                              </div>
                              {chartData && (
                                <DecisionChartDisplay chart={chartData} />
                              )}
                            </div>
                          );
                        })()}
                      </div>
                      <div className={`text-[9px] text-slate-400 font-medium ${isUser ? "text-right mr-1" : "ml-1"}`}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Structured Multi-Step Thinking Indicator */}
            {isLoading && (
              <div className="flex gap-3 max-w-[90%] sm:max-w-[80%] mr-auto" id="chat-typing-loader">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200/75 dark:border-slate-800/90 rounded-2xl rounded-tl-none p-4 shadow-sm w-full space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600 dark:bg-indigo-400"></span>
                      </span>
                      <span className="text-[10px] font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-widest">
                        Counsel Reasoning Trace
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Step {Math.min(thinkingStep + 1, thinkingPhases.length)} of {thinkingPhases.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {thinkingPhases.map((phase, idx) => {
                      const isCompleted = idx < thinkingStep;
                      const isActive = idx === thinkingStep;
                      const isPending = idx > thinkingStep;

                      return (
                        <motion.div 
                          key={phase} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ 
                            opacity: isActive ? 1 : isCompleted ? 0.6 : 0.35,
                            x: 0,
                            scale: isActive ? 1.015 : 1
                          }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className={`flex items-start gap-2.5 transition-all duration-300 ${
                            isActive 
                              ? "font-semibold text-indigo-950 dark:text-indigo-100" 
                              : isCompleted 
                                ? "text-slate-500 dark:text-slate-400" 
                                : "text-slate-400 dark:text-slate-600"
                          }`}
                        >
                          <div className="shrink-0 mt-0.5">
                            {isCompleted ? (
                              <motion.div 
                                initial={{ scale: 0.7, rotate: -15 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="w-4.5 h-4.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-800/40"
                              >
                                <Check className="w-2.5 h-2.5" />
                              </motion.div>
                            ) : isActive ? (
                              <motion.div 
                                initial={{ scale: 0.8 }}
                                animate={{ scale: [1, 1.08, 1] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="w-4.5 h-4.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-800/40"
                              >
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              </motion.div>
                            ) : (
                              <div className="w-4.5 h-4.5 rounded-full bg-slate-50 dark:bg-slate-950/30 text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                              </div>
                            )}
                          </div>
                          <span className={`text-[11px] sm:text-xs leading-normal ${
                            isActive ? "text-indigo-600 dark:text-indigo-400" : ""
                          }`}>
                            {phase}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Animated overall mini progress slider */}
                  <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500 ease-out" 
                      style={{ width: `${((thinkingStep + 1) / thinkingPhases.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-900/30 text-xs font-semibold flex items-center gap-2" id="chat-error-toast">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form Panel */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="p-4 border-t border-slate-200 dark:border-slate-800/85 bg-white dark:bg-slate-900 flex items-center gap-3"
        id="chat-input-form"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading ? "Tiebreaker is analyzing..." : "Ask a follow-up or challenge this decision..."}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 dark:text-white text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-950/50 transition-all disabled:opacity-60"
          id="chat-text-input"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`h-[38px] px-4 rounded-xl bg-indigo-600 text-white font-semibold text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer hover:bg-indigo-700 shadow-sm shrink-0 disabled:opacity-40 disabled:hover:bg-indigo-600 disabled:cursor-not-allowed`}
          id="chat-submit-btn"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Ask AI</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
