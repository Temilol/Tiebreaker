import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  HelpCircle,
  Briefcase,
  DollarSign,
  Home,
  Laptop,
  User,
  Heart,
  Compass,
  Tag as TagIcon,
  GitFork,
  X,
  UploadCloud,
  Check,
  Mic,
  MicOff,
  AlertCircle,
  Camera,
  Image as ImageIcon
} from "lucide-react";

export const getTagStyleAndIcon = (tagName: string) => {
  const name = tagName.toLowerCase();
  if (name === "career") {
    return {
      bg: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
      activeBg: "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500",
      hoverBg: "hover:bg-blue-100 dark:hover:bg-blue-950/50 text-blue-700 dark:text-blue-400",
      icon: Briefcase
    };
  }
  if (name === "finance") {
    return {
      bg: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
      activeBg: "bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500",
      hoverBg: "hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400",
      icon: DollarSign
    };
  }
  if (name === "housing") {
    return {
      bg: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
      activeBg: "bg-amber-600 text-white border-amber-600 dark:bg-amber-500 dark:border-amber-500",
      hoverBg: "hover:bg-amber-100 dark:hover:bg-amber-950/50 text-amber-700 dark:text-amber-400",
      icon: Home
    };
  }
  if (name === "tech") {
    return {
      bg: "bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900/50",
      activeBg: "bg-sky-600 text-white border-sky-600 dark:bg-sky-500 dark:border-sky-500",
      hoverBg: "hover:bg-sky-100 dark:hover:bg-sky-950/50 text-sky-700 dark:text-sky-400",
      icon: Laptop
    };
  }
  if (name === "personal") {
    return {
      bg: "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/50",
      activeBg: "bg-purple-600 text-white border-purple-600 dark:bg-purple-500 dark:border-purple-500",
      hoverBg: "hover:bg-purple-100 dark:hover:bg-purple-950/50 text-purple-700 dark:text-purple-400",
      icon: User
    };
  }
  if (name === "health") {
    return {
      bg: "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50",
      activeBg: "bg-rose-600 text-white border-rose-600 dark:bg-rose-500 dark:border-rose-500",
      hoverBg: "hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-400",
      icon: Heart
    };
  }
  if (name === "travel") {
    return {
      bg: "bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-900/50",
      activeBg: "bg-teal-600 text-white border-teal-600 dark:bg-teal-500 dark:border-teal-500",
      hoverBg: "hover:bg-teal-100 dark:hover:bg-teal-950/50 text-teal-700 dark:text-teal-400",
      icon: Compass
    };
  }
  return {
    bg: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    activeBg: "bg-slate-750 text-white border-slate-750 dark:bg-slate-700 dark:border-slate-700",
    hoverBg: "hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300",
    icon: TagIcon
  };
};

export const STANDARD_TAGS = ["Career", "Finance", "Housing", "Tech", "Personal", "Health", "Travel"];

interface DecisionFormProps {
  onSubmit: (
    topic: string,
    options: string[],
    preferences: string,
    tag: string,
    parentId?: string,
    branchedFromOption?: string,
    optionImages?: (string | null)[]
  ) => void;
  isLoading: boolean;
  branchingData?: {
    parentId: string;
    branchedFromOption: string;
    parentTopic: string;
    suggestedTopic: string;
    suggestedOptions: string[];
    suggestedPreferences: string;
    suggestedTag: string;
    isLoading?: boolean;
  } | null;
  onCancelBranching?: () => void;
}

const PRESETS = [
  {
    title: "Career Path Dilemma",
    topic: "Should I stay at my current stable corporate job or join an early-stage startup?",
    options: ["Stay at Corporate Job", "Join Early-Stage Startup"],
    preferences: "I value learning and ownership but have a mortgage. I want to minimize financial stress while maximizing potential career growth.",
    tag: "Career"
  },
  {
    title: "Buy vs. Rent Home",
    topic: "Should we rent a modern apartment in the city center or buy a house in the suburbs?",
    options: ["Rent City Apartment", "Buy Suburban House"],
    preferences: "We have a 2-year old child. We love walkable neighborhoods and good food, but want space for a garden and a safe backyard.",
    tag: "Housing"
  },
  {
    title: "Tech Stack Dilemma",
    topic: "Which framework should our team choose for the new client project?",
    options: ["React SPA with Vite", "Next.js Full-Stack App"],
    preferences: "The project must be finished in 6 weeks. SEO is extremely critical, but only two out of five developers know Next.js.",
    tag: "Tech"
  }
];

const isSpeechSupported = typeof window !== "undefined" && (!!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition);

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  onError?: (errMessage: string) => void;
  isLoading?: boolean;
  tooltip?: string;
  id?: string;
  currentValue?: string;
}

function VoiceInputButton({ onTranscript, onError, isLoading, tooltip = "Speak to text", id, currentValue }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Keep references to current callbacks so they are always fresh without restarting the effect
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);
  const initialValueRef = useRef("");
  const currentValueRef = useRef(currentValue || "");
  const shouldBeListeningRef = useRef(false);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    currentValueRef.current = currentValue || "";
  }, [currentValue]);

  useEffect(() => {
    if (!isSpeechSupported) return;
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SpeechRecognitionClass();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (event: any) => {
      let sessionTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          sessionTranscript += event.results[i][0].transcript + " ";
        }
      }

      if (sessionTranscript.trim() && onTranscriptRef.current) {
        const initial = initialValueRef.current;
        const newValue = initial
          ? `${initial.trim()} ${sessionTranscript.trim()}`
          : sessionTranscript.trim();
        onTranscriptRef.current(newValue);
      }
    };

    rec.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      const errCallback = onErrorRef.current;
      
      const isFatal = event.error === "not-allowed" || event.error === "audio-capture" || event.error === "service-not-allowed";
      if (isFatal) {
        shouldBeListeningRef.current = false;
        setIsListening(false);
      }

      if (errCallback) {
        if (event.error === "not-allowed") {
          errCallback("Microphone access was blocked. Please make sure microphone permission is allowed for this application in your browser's site settings or address bar.");
        } else if (event.error === "no-speech") {
          // Handled gracefully without popping fatal error messages because we will automatically continue
        } else if (event.error === "audio-capture") {
          errCallback("No microphone was found on your device.");
        } else {
          errCallback(`Speech recognition error: ${event.error}`);
        }
      }
    };

    rec.onend = () => {
      if (shouldBeListeningRef.current) {
        try {
          // Carry over the current value of the text input as our new baseline
          initialValueRef.current = currentValueRef.current;
          rec.start();
        } catch (e) {
          console.error("Failed to auto-restart speech recognition session:", e);
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    setRecognition(rec);

    return () => {
      shouldBeListeningRef.current = false;
      try {
        rec.abort();
      } catch (e) {
        // Safe discard
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognition) return;
    if (isListening) {
      shouldBeListeningRef.current = false;
      recognition.stop();
    } else {
      shouldBeListeningRef.current = true;
      initialValueRef.current = currentValue || "";
      try {
        recognition.start();
      } catch (e) {
        console.error("Error starting speech recognition:", e);
      }
    }
  };

  if (!isSpeechSupported) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={isLoading}
      title={isListening ? "Listening... Click to stop" : tooltip}
      className={`p-2 rounded-lg transition-all flex items-center justify-center cursor-pointer shrink-0 ${
        isListening
          ? "bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/20 hover:bg-rose-600"
          : "text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
      }`}
      id={id}
    >
      {isListening ? (
        <MicOff className="w-4 h-4" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
}

export default function DecisionForm({ onSubmit, isLoading, branchingData, onCancelBranching }: DecisionFormProps) {
  const [topic, setTopic] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [optionImages, setOptionImages] = useState<(string | null)[]>([null, null]);
  const [preferences, setPreferences] = useState("");
  const [showPrefs, setShowPrefs] = useState(false);
  const [tag, setTag] = useState("Personal");
  const [customTagText, setCustomTagText] = useState("");
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Form Mode & Decoder states
  const [formMode, setFormMode] = useState<"structured" | "voice" | "visual">("structured");
  
  // Voice Dilemma Decoder state
  const [voiceDilemmaTranscript, setVoiceDilemmaTranscript] = useState("");
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodingError, setDecodingError] = useState<string | null>(null);
  const [showDecodeSuccessAlert, setShowDecodeSuccessAlert] = useState(false);

  // Visual Dilemma Decoder state
  const [visualDilemmaImages, setVisualDilemmaImages] = useState<string[]>([]);
  const [visualDilemmaNotes, setVisualDilemmaNotes] = useState("");
  const [isVisualDecoding, setIsVisualDecoding] = useState(false);
  const [visualDecodingError, setVisualDecodingError] = useState<string | null>(null);

  const [isDilemmaListening, setIsDilemmaListening] = useState(false);
  const [dilemmaRecognition, setDilemmaRecognition] = useState<any>(null);

  const dilemmaInitialValueRef = useRef("");
  const dilemmaCurrentValueRef = useRef("");
  const dilemmaShouldBeListeningRef = useRef(false);

  // Sync ref with state
  useEffect(() => {
    dilemmaCurrentValueRef.current = voiceDilemmaTranscript;
  }, [voiceDilemmaTranscript]);

  // Speech Recognition for entire spoken dilemma
  useEffect(() => {
    if (!isSpeechSupported) return;
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SpeechRecognitionClass();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onstart = () => {
      setIsDilemmaListening(true);
    };

    rec.onresult = (event: any) => {
      let sessionTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          sessionTranscript += event.results[i][0].transcript + " ";
        }
      }

      if (sessionTranscript.trim()) {
        const initial = dilemmaInitialValueRef.current;
        const newValue = initial
          ? `${initial.trim()} ${sessionTranscript.trim()}`
          : sessionTranscript.trim();
        setVoiceDilemmaTranscript(newValue);
      }
    };

    rec.onerror = (event: any) => {
      console.error("Dilemma speech recognition error:", event.error);
      const isFatal = event.error === "not-allowed" || event.error === "audio-capture" || event.error === "service-not-allowed";
      if (isFatal) {
        dilemmaShouldBeListeningRef.current = false;
        setIsDilemmaListening(false);
      }

      if (event.error === "not-allowed") {
        setSpeechError("Microphone access was blocked. Please make sure microphone permission is allowed for this application.");
      } else if (event.error === "audio-capture") {
        setSpeechError("No microphone was found on your device.");
      }
    };

    rec.onend = () => {
      if (dilemmaShouldBeListeningRef.current) {
        try {
          dilemmaInitialValueRef.current = dilemmaCurrentValueRef.current;
          rec.start();
        } catch (e) {
          console.error("Failed to auto-restart dilemma speech recognition:", e);
          setIsDilemmaListening(false);
        }
      } else {
        setIsDilemmaListening(false);
      }
    };

    setDilemmaRecognition(rec);

    return () => {
      dilemmaShouldBeListeningRef.current = false;
      try {
        rec.abort();
      } catch (e) {
        // Safe discard
      }
    };
  }, []);

  const toggleDilemmaListening = () => {
    if (!dilemmaRecognition) return;
    if (isDilemmaListening) {
      dilemmaShouldBeListeningRef.current = false;
      dilemmaRecognition.stop();
    } else {
      dilemmaShouldBeListeningRef.current = true;
      dilemmaInitialValueRef.current = voiceDilemmaTranscript;
      try {
        dilemmaRecognition.start();
      } catch (e) {
        console.error("Error starting dilemma speech recognition:", e);
      }
    }
  };

  const handleDecodeDilemma = async () => {
    if (!voiceDilemmaTranscript.trim()) return;
    setIsDecoding(true);
    setDecodingError(null);
    setShowDecodeSuccessAlert(false);

    // Stop listening if active
    if (isDilemmaListening && dilemmaRecognition) {
      dilemmaShouldBeListeningRef.current = false;
      dilemmaRecognition.stop();
      setIsDilemmaListening(false);
    }

    try {
      const response = await fetch("/api/decode-dilemma", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript: voiceDilemmaTranscript }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Decoding failed with status ${response.status}`);
      }

      const decoded = await response.json();
      
      setTopic(decoded.topic || "");
      setOptions(decoded.options && decoded.options.length >= 2 ? decoded.options : ["", ""]);
      setOptionImages(new Array(decoded.options && decoded.options.length >= 2 ? decoded.options.length : 2).fill(null));
      setPreferences(decoded.preferences || "");
      setShowPrefs(!!decoded.preferences);
      
      if (STANDARD_TAGS.includes(decoded.tag)) {
        setTag(decoded.tag);
        setCustomTagText("");
      } else {
        setTag("Custom");
        setCustomTagText(decoded.tag || "");
      }

      setFormMode("structured");
      setShowDecodeSuccessAlert(true);
      setTimeout(() => setShowDecodeSuccessAlert(false), 8000);
    } catch (err: any) {
      console.error("Dilemma decoding error:", err);
      setDecodingError(err.message || "Failed to decode spoken dilemma. Please check your network or try again.");
    } finally {
      setIsDecoding(false);
    }
  };

  const handleVisualDilemmaImageUpload = (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    
    // Process each file (limit to a total of 4 images)
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
      }

      setVisualDilemmaImages((prev) => {
        if (prev.length >= 4) {
          alert("Maximum of 4 photos allowed for a single dilemma.");
          return prev;
        }
        return prev; // dummy placeholder since state setter is async, we will append inside onload
      });

      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 800; // max size of width or height
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
            setVisualDilemmaImages((prev) => {
              if (prev.length >= 4) return prev;
              return [...prev, compressedBase64];
            });
          } else {
            setVisualDilemmaImages((prev) => {
              if (prev.length >= 4) return prev;
              return [...prev, reader.result as string];
            });
          }
        };
        img.onerror = () => {
          setVisualDilemmaImages((prev) => {
            if (prev.length >= 4) return prev;
            return [...prev, reader.result as string];
          });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDecodeVisualDilemma = async () => {
    if (visualDilemmaImages.length === 0) return;
    setIsVisualDecoding(true);
    setVisualDecodingError(null);
    setShowDecodeSuccessAlert(false);

    try {
      const response = await fetch("/api/decode-image-dilemma", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images: visualDilemmaImages,
          notes: visualDilemmaNotes,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Decoding failed with status ${response.status}`);
      }

      const decoded = await response.json();

      setTopic(decoded.topic || "");
      
      const parsedOptions = decoded.options && decoded.options.length >= 2 ? decoded.options : ["", ""];
      setOptions(parsedOptions);
      
      // Auto-map uploaded photos to the parsed options
      const mappedImages = parsedOptions.map((_, idx) => visualDilemmaImages[idx] || null);
      setOptionImages(mappedImages);
      
      setPreferences(decoded.preferences || "");
      setShowPrefs(!!decoded.preferences);

      if (STANDARD_TAGS.includes(decoded.tag)) {
        setTag(decoded.tag);
        setCustomTagText("");
      } else {
        setTag("Custom");
        setCustomTagText(decoded.tag || "");
      }

      setFormMode("structured");
      setShowDecodeSuccessAlert(true);
      setTimeout(() => setShowDecodeSuccessAlert(false), 8000);
    } catch (err: any) {
      console.error("Visual dilemma decoding error:", err);
      setVisualDecodingError(err.message || "Failed to analyze your dilemma images. Please check your network or try again.");
    } finally {
      setIsVisualDecoding(false);
    }
  };

  useEffect(() => {
    if (branchingData) {
      setTopic(branchingData.suggestedTopic);
      setOptions(branchingData.suggestedOptions.length >= 2 ? [...branchingData.suggestedOptions] : ["", ""]);
      setOptionImages(new Array(branchingData.suggestedOptions.length >= 2 ? branchingData.suggestedOptions.length : 2).fill(null));
      setPreferences(branchingData.suggestedPreferences);
      setShowPrefs(!!branchingData.suggestedPreferences);
      setTag(branchingData.suggestedTag || "Personal");
      setCustomTagText("");
    }
  }, [branchingData]);

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleTopicTranscript = (newValue: string) => {
    setTopic(newValue);
  };

  const handleOptionTranscript = (index: number, newValue: string) => {
    const updated = [...options];
    updated[index] = newValue;
    setOptions(updated);
  };

  const handlePreferencesTranscript = (newValue: string) => {
    setPreferences(newValue);
  };

  const handleImageUpload = (index: number, file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 800; // max size of width or height
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75); // jpeg compression 0.75
          const updated = [...optionImages];
          updated[index] = compressedBase64;
          setOptionImages(updated);
        } else {
          const updated = [...optionImages];
          updated[index] = reader.result as string;
          setOptionImages(updated);
        }
      };
      img.onerror = () => {
        const updated = [...optionImages];
        updated[index] = reader.result as string;
        setOptionImages(updated);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const addOptionField = () => {
    if (options.length < 5) {
      setOptions([...options, ""]);
      setOptionImages([...optionImages, null]);
    }
  };

  const removeOptionField = (index: number) => {
    if (options.length > 2) {
      const updatedOpts = options.filter((_, i) => i !== index);
      const updatedImgs = optionImages.filter((_, i) => i !== index);
      setOptions(updatedOpts);
      setOptionImages(updatedImgs);
    }
  };

  const loadPreset = (preset: typeof PRESETS[0]) => {
    setTopic(preset.topic);
    setOptions([...preset.options]);
    setOptionImages(new Array(preset.options.length).fill(null));
    setPreferences(preset.preferences);
    setShowPrefs(true);
    setTag(preset.tag);
    setCustomTagText("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTopic = topic.trim();
    const cleanOptions = options.map(o => o.trim()).filter(Boolean);

    if (!cleanTopic) return;
    if (cleanOptions.length < 2) return;

    const finalTag = tag === "Custom" ? (customTagText.trim() || "Other") : tag;
    
    if (branchingData) {
      onSubmit(cleanTopic, cleanOptions, preferences.trim(), finalTag, branchingData.parentId, branchingData.branchedFromOption, optionImages);
    } else {
      onSubmit(cleanTopic, cleanOptions, preferences.trim(), finalTag, undefined, undefined, optionImages);
    }
  };

  if (branchingData?.isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-sm flex flex-col items-center justify-center min-h-[400px]" id="branching-loader">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-100 dark:border-slate-800 border-t-indigo-600 dark:border-t-indigo-500 animate-spin"></div>
          <Sparkles className="w-6 h-6 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
        </div>
        <div className="space-y-3 max-w-md">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">AI Branch Mapping in Progress...</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Gemini is evaluating your choice <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">&ldquo;{branchingData.branchedFromOption}&rdquo;</span> from the parent dilemma and formulating relevant sub-options, custom trade-offs, and critical criteria to expand your decision tree.
          </p>
        </div>
        {onCancelBranching && (
          <button
            type="button"
            onClick={onCancelBranching}
            className="mt-4 px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-850 transition-all cursor-pointer"
          >
            Cancel Generation
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm transition-colors duration-200" id="decision-form-container">
      {branchingData && (
        <div className="mb-6 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl flex items-start gap-3.5 relative" id="branching-active-banner">
          <div className="p-2 bg-indigo-500/10 rounded-lg shrink-0 text-indigo-600 dark:text-indigo-400">
            <GitFork className="w-5 h-5 rotate-180" />
          </div>
          <div className="flex-1 space-y-1 pr-6">
            <span className="text-[10px] font-bold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">Sub-Dilemma Exploration</span>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Branching off Option: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">&ldquo;{branchingData.branchedFromOption}&rdquo;</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Parent Dilemma: &ldquo;{branchingData.parentTopic}&rdquo;
            </p>
          </div>
          {onCancelBranching && (
            <button
              type="button"
              onClick={onCancelBranching}
              className="absolute top-3.5 right-3.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
              title="Cancel branching"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2" id="form-heading">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          {branchingData ? "Define the Sub-Dilemma" : "State Your Dilemma"}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {branchingData 
            ? "Drill down into this option to analyze the secondary choice or next steps."
            : "Tell us what you're choosing between, and the AI Tiebreaker will build a personalized, analytical decision package."}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      {!branchingData && (
        <div className="mb-6 flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/85 max-w-md" id="form-mode-tabs">
          <button
            type="button"
            onClick={() => {
              setFormMode("structured");
              setDecodingError(null);
              setVisualDecodingError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              formMode === "structured"
                ? "bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/40 dark:border-slate-800"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Form
          </button>
          <button
            type="button"
            onClick={() => {
              setFormMode("voice");
              setShowDecodeSuccessAlert(false);
              setDecodingError(null);
              setVisualDecodingError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              formMode === "voice"
                ? "bg-white dark:bg-slate-850 text-rose-500 dark:text-rose-400 shadow-sm border border-slate-200/40 dark:border-slate-800"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Speak
          </button>
          <button
            type="button"
            onClick={() => {
              setFormMode("visual");
              setShowDecodeSuccessAlert(false);
              setDecodingError(null);
              setVisualDecodingError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              formMode === "visual"
                ? "bg-white dark:bg-slate-850 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/40 dark:border-slate-800"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Photo
          </button>
        </div>
      )}

      {/* Preset Badges */}
      {!branchingData && formMode === "structured" && (
        <div className="mb-6 flex flex-wrap items-center gap-2" id="preset-container">
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 mr-1 uppercase tracking-wider">Presets:</span>
          {PRESETS.map((preset, index) => (
            <button
              key={index}
              type="button"
              id={`preset-btn-${index}`}
              onClick={() => loadPreset(preset)}
              className="text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 font-medium py-1.5 px-3 rounded-full transition-colors cursor-pointer"
            >
              {preset.title}
            </button>
          ))}
        </div>
      )}

      {formMode === "voice" && !branchingData ? (
        <div className="space-y-6" id="voice-narration-console">
          {decodingError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200" id="decoding-error-alert">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold text-rose-900 dark:text-rose-100">Decoding Error:</span> {decodingError}
              </div>
              <button
                type="button"
                onClick={() => setDecodingError(null)}
                className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-md transition-colors text-rose-500 shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Instructions & Interactive Microphone */}
          <div className="bg-slate-50/50 dark:bg-slate-950/35 border border-slate-150 dark:border-slate-800/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4" id="microphone-console">
            <div className="relative">
              {/* Animated background rings when listening */}
              {isDilemmaListening && (
                <>
                  <div className="absolute inset-0 rounded-full bg-rose-500/10 animate-ping" />
                  <div className="absolute -inset-4 rounded-full bg-rose-500/5 animate-pulse" />
                </>
              )}
              <button
                type="button"
                onClick={toggleDilemmaListening}
                disabled={isDecoding}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer ${
                  isDilemmaListening
                    ? "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20 scale-105"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20"
                }`}
                id="main-voice-record-btn"
                title={isDilemmaListening ? "Click to stop recording" : "Click to start recording"}
              >
                {isDilemmaListening ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {isDilemmaListening ? "Listening continuously..." : "Click to narrate your dilemma"}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm leading-relaxed">
                {isDilemmaListening
                  ? "Speak freely. Describe what choices you are deciding between, any budgets, preferences, or rules you have."
                  : "Describe your dilemma naturally. e.g. 'I need to choose a vacation spot between Maui and Paris. Maui has beautiful beaches, but Paris has great food and history. Maui is cheaper but Paris is a once-in-a-lifetime trip.'"}
              </p>
            </div>
          </div>

          {/* Transcript Text Box */}
          <div className="space-y-2" id="voice-transcript-container">
            <label htmlFor="voice-dilemma-transcript" className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
              Your Spoken Transcript
            </label>
            <textarea
              id="voice-dilemma-transcript"
              rows={6}
              disabled={isDecoding}
              placeholder="Speak using the microphone above, or type your dilemma directly here in your own words..."
              value={voiceDilemmaTranscript}
              onChange={(e) => setVoiceDilemmaTranscript(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 dark:text-slate-100 transition-all text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-slate-50/50 dark:bg-slate-950/40"
            />
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                {voiceDilemmaTranscript.trim().split(/\s+/).filter(Boolean).length} words
              </span>
              {voiceDilemmaTranscript && (
                <button
                  type="button"
                  onClick={() => setVoiceDilemmaTranscript("")}
                  disabled={isDecoding}
                  className="text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  Clear Transcript
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setFormMode("structured");
                setDecodingError(null);
              }}
              disabled={isDecoding}
              className="flex-1 py-3 px-4 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel & Switch to Form
            </button>
            <button
              type="button"
              onClick={handleDecodeDilemma}
              disabled={isDecoding || !voiceDilemmaTranscript.trim()}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-sm transition-all text-xs cursor-pointer ${
                isDecoding || !voiceDilemmaTranscript.trim()
                  ? "bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-650 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-md shadow-indigo-600/15"
              }`}
              id="decode-dilemma-submit-btn"
            >
              {isDecoding ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Decoding Decision Structure...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  Decode & Structure Dilemma
                </>
              )}
            </button>
          </div>
        </div>
      ) : formMode === "visual" && !branchingData ? (
        <div className="space-y-6" id="visual-scanner-console">
          {visualDecodingError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200" id="visual-decoding-error-alert">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold text-rose-900 dark:text-rose-100">Analysis Error:</span> {visualDecodingError}
              </div>
              <button
                type="button"
                onClick={() => setVisualDecodingError(null)}
                className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-md transition-colors text-rose-500 shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Drag & Drop Multi-Upload Zone */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Upload Dilemma Photos <span className="text-xs font-normal text-slate-400 dark:text-slate-500">(1 to 4 photos)</span>
              </label>
              {visualDilemmaImages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setVisualDilemmaImages([])}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </button>
              )}
            </div>
            
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const files = e.dataTransfer.files;
                if (files && files.length > 0) handleVisualDilemmaImageUpload(files);
              }}
              className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 bg-slate-50/50 dark:bg-slate-950/20 transition-colors cursor-pointer relative"
              onClick={() => {
                const input = document.getElementById("visual-dilemma-file-input");
                if (input) input.click();
              }}
            >
              <input
                type="file"
                id="visual-dilemma-file-input"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) handleVisualDilemmaImageUpload(files);
                }}
              />
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full">
                <Camera className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Drag and drop up to 4 images here, or <span className="text-indigo-600 dark:text-indigo-400 hover:underline">browse</span>
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed max-w-sm">
                  Tip: Upload separate photos of each option (e.g. choice A and choice B) and Gemini will automatically extract and map them!
                </p>
              </div>
            </div>

            {/* Uploaded Images Grid */}
            {visualDilemmaImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2" id="uploaded-images-grid">
                {visualDilemmaImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl overflow-hidden aspect-square border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 group/img shadow-xs"
                  >
                    <img
                      src={img}
                      alt={`Uploaded preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 bg-black/70 backdrop-blur-xs text-[9px] font-bold text-white rounded-md">
                      Photo {idx + 1}
                    </div>
                    
                    {/* Hover delete button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVisualDilemmaImages((prev) => prev.filter((_, i) => i !== idx));
                      }}
                      className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-lg opacity-90 hover:opacity-100 hover:scale-105 transition-all shadow-xs cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Optional additional slot if count is < 4 */}
                {visualDilemmaImages.length < 4 && (
                  <div
                    onClick={() => {
                      const input = document.getElementById("visual-dilemma-file-input");
                      if (input) input.click();
                    }}
                    className="border border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl aspect-square flex flex-col items-center justify-center text-center bg-slate-50/30 dark:bg-slate-950/10 cursor-pointer transition-colors"
                  >
                    <Camera className="w-5 h-5 text-slate-400 dark:text-slate-600 mb-1" />
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                      Add Photo ({visualDilemmaImages.length}/4)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Optional Notes Container */}
          <div className="space-y-2">
            <label htmlFor="visual-dilemma-notes" className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
              Descriptive Notes <span className="text-xs font-normal text-slate-400 dark:text-slate-500">(Optional)</span>
            </label>
            <textarea
              id="visual-dilemma-notes"
              rows={3}
              disabled={isVisualDecoding}
              placeholder="e.g. I'm choosing a new jacket for work. Photo 1 is a sleek grey blazer, and Photo 2 is a double-breasted navy coat."
              value={visualDilemmaNotes}
              onChange={(e) => setVisualDilemmaNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 dark:text-slate-100 transition-all text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-slate-50/50 dark:bg-slate-950/40"
            />
          </div>

          {/* Visual Scanner Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setFormMode("structured");
                setVisualDecodingError(null);
              }}
              disabled={isVisualDecoding}
              className="flex-1 py-3 px-4 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel & Switch to Form
            </button>
            <button
              type="button"
              onClick={handleDecodeVisualDilemma}
              disabled={isVisualDecoding || visualDilemmaImages.length === 0}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-sm transition-all text-xs cursor-pointer ${
                isVisualDecoding || visualDilemmaImages.length === 0
                  ? "bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-650 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-md shadow-emerald-600/15"
              }`}
              id="decode-visual-dilemma-submit-btn"
            >
              {isVisualDecoding ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Analyzing Photos with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  Scan Photos & Extract Dilemma
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" id="dilemma-form">
          {showDecodeSuccessAlert && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-200 animate-fadeIn" id="decode-success-alert">
              <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 animate-bounce" />
              <div className="flex-1">
                <span className="font-bold text-emerald-950 dark:text-emerald-300">AI Decoder Success:</span> We have parsed your spoken dilemma! We extracted the decision, identified the options, and summarized your preferences. Feel free to refine any fields below, upload photos, or click <strong className="font-bold text-indigo-600 dark:text-indigo-400">"Break the Tie"</strong> to analyze!
              </div>
              <button
                type="button"
                onClick={() => setShowDecodeSuccessAlert(false)}
                className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 rounded-md transition-colors text-emerald-500 shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        {speechError && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200" id="speech-error-alert">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-rose-900 dark:text-rose-100">Speech Input Notice:</span> {speechError}
            </div>
            <button
              type="button"
              onClick={() => setSpeechError(null)}
              className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-md transition-colors text-rose-500 shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Topic Input */}
        <div id="topic-group">
          <label htmlFor="topic-input" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
            What decision are you trying to make?
          </label>
          <div className="relative flex items-center">
            <input
              id="topic-input"
              type="text"
              required
              disabled={isLoading}
              placeholder="e.g., Should we move our office to Austin, Texas or remain in Boston?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 dark:text-slate-100 transition-all text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-slate-50/50 dark:bg-slate-950/40"
            />
            {isSpeechSupported && (
              <div className="absolute right-2.5">
                <VoiceInputButton
                  onTranscript={handleTopicTranscript}
                  onError={setSpeechError}
                  isLoading={isLoading}
                  tooltip="Speak your dilemma"
                  id="voice-btn-topic"
                  currentValue={topic}
                />
              </div>
            )}
          </div>
        </div>

        {/* Options Input */}
        <div id="options-group">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              What options are you considering?
            </label>
            <span className="text-xs text-slate-400 dark:text-slate-500">(2 - 5 options)</span>
          </div>

          <div className="space-y-4" id="options-list">
            {options.map((option, index) => (
              <div
                key={index}
                className="space-y-2 p-3.5 bg-slate-50/40 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/80 rounded-xl"
                id={`option-row-${index}`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative flex items-center">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-150 dark:bg-slate-800 rounded-md w-6 h-6 flex items-center justify-center">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      required
                      disabled={isLoading}
                      placeholder={`e.g., Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="w-full pl-12 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 dark:text-slate-100 transition-all text-sm bg-white dark:bg-slate-950/40"
                      id={`option-input-${index}`}
                    />
                    {isSpeechSupported && (
                      <div className="absolute right-2">
                        <VoiceInputButton
                          onTranscript={(text) => handleOptionTranscript(index, text)}
                          onError={setSpeechError}
                          isLoading={isLoading}
                          tooltip={`Speak Option ${index + 1}`}
                          id={`voice-btn-option-${index}`}
                          currentValue={option}
                        />
                      </div>
                    )}
                  </div>
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOptionField(index)}
                      disabled={isLoading}
                      className="p-2.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/25 rounded-xl transition-colors cursor-pointer"
                      title="Remove Option"
                      id={`remove-option-btn-${index}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Option Image upload / preview container */}
                <div className="pl-12 flex flex-wrap items-center gap-3">
                  {!optionImages[index] ? (
                    <label className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-250 dark:border-slate-800/80 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-350 cursor-pointer transition-colors shadow-3xs hover:border-indigo-500/50">
                      <UploadCloud className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>Attach Option Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(index, file);
                        }}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800/80 shadow-3xs">
                      <img
                        src={optionImages[index] || ""}
                        alt={`Option ${index + 1} Preview`}
                        className="w-10 h-10 object-cover rounded-md border border-slate-200 dark:border-slate-800"
                      />
                      <div className="text-[10px] space-y-0.5">
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                          <Check className="w-3 h-3 text-emerald-500" /> Image Loaded
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...optionImages];
                            updated[index] = null;
                            setOptionImages(updated);
                          }}
                          className="text-rose-500 dark:text-rose-400 hover:underline cursor-pointer flex items-center gap-0.5 font-bold"
                        >
                          <Trash2 className="w-3 h-3 inline" /> Remove
                        </button>
                      </div>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                    (Optional: Provide photo of this option for Google visual detection)
                  </span>
                </div>
              </div>
            ))}
          </div>

          {options.length < 5 && (
            <button
              type="button"
              onClick={addOptionField}
              disabled={isLoading}
              className="mt-3.5 flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold cursor-pointer"
              id="add-option-btn"
            >
              <Plus className="w-4 h-4" />
              Add Option
            </button>
          )}
        </div>

        {/* Tag / Category Selector */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-5" id="tag-selector-group">
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
            Choose a Category / Tag
          </label>
          <div className="flex flex-wrap gap-2 mb-3" id="tag-pills-container">
            {STANDARD_TAGS.map((t) => {
              const isActive = tag === t;
              const { activeBg, bg, hoverBg, icon: Icon } = getTagStyleAndIcon(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                    isActive ? activeBg : `${bg} ${hoverBg}`
                  }`}
                  id={`tag-btn-${t.toLowerCase()}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setTag("Custom")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                tag === "Custom"
                  ? "bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-150 dark:hover:bg-slate-750"
              }`}
              id="tag-btn-custom"
            >
              <TagIcon className="w-3.5 h-3.5" />
              Custom...
            </button>
          </div>

          {tag === "Custom" && (
            <div className="mt-2" id="custom-tag-input-container">
              <input
                type="text"
                maxLength={20}
                disabled={isLoading}
                placeholder="Type your custom category/tag (e.g., Shopping, Family)"
                value={customTagText}
                onChange={(e) => setCustomTagText(e.target.value)}
                className="w-full max-w-xs px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 dark:text-slate-100 transition-all text-sm bg-slate-50/50 dark:bg-slate-950/40"
                id="custom-tag-input"
              />
            </div>
          )}
        </div>

        {/* Collapsible Preferences */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4" id="preferences-group">
          <button
            type="button"
            onClick={() => setShowPrefs(!showPrefs)}
            className="flex items-center justify-between w-full text-left font-semibold text-slate-800 dark:text-slate-200 text-sm hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
            id="toggle-prefs-btn"
          >
            <span className="flex items-center gap-1.5">
              Personal concerns, weights or preferences?
              <span className="text-xs font-normal text-slate-400 dark:text-slate-500">(Optional)</span>
            </span>
            {showPrefs ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showPrefs && (
            <div className="mt-3" id="preferences-input-container">
              <div className="relative flex items-start">
                <textarea
                  placeholder="e.g., I value short commute times above all else. Budget is restricted to $2,000/month. We need this resolved by next month."
                  rows={3}
                  disabled={isLoading}
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 dark:text-slate-100 transition-all text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-slate-50/50 dark:bg-slate-950/40"
                  id="preferences-textarea"
                />
                {isSpeechSupported && (
                  <div className="absolute right-2.5 top-2.5">
                    <VoiceInputButton
                      onTranscript={handlePreferencesTranscript}
                      onError={setSpeechError}
                      isLoading={isLoading}
                      tooltip="Speak your preferences"
                      id="voice-btn-preferences"
                      currentValue={preferences}
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                Providing weights, goals, budgets, or emotional factors helps the AI weigh the pros/cons accurately according to your values.
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className={`w-full py-3.5 px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-sm transition-all text-sm cursor-pointer ${
            isLoading || !topic.trim()
              ? "bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-650 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-600/10 active:scale-[0.99] dark:bg-indigo-600 dark:hover:bg-indigo-500"
          }`}
          id="submit-decision-btn"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Running Multi-Criteria Analysis...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Break the Tie
            </>
          )}
        </button>
      </form>
      )}
    </div>
  );
}
