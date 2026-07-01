import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

let aiClient: GoogleGenAI | null = null;

function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in the server environment. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Helper to parse base64 data URLs
function parseBase64Image(base64Str: string) {
  if (!base64Str) return null;
  const match = base64Str.match(/^data:(image\/[a-zA-Z0-9.-]+);base64,(.+)$/);
  if (match) {
    return {
      mimeType: match[1],
      data: match[2],
    };
  }
  return null;
}

// REST API for tiebreaker generation
app.post("/api/tiebreak", async (req, res) => {
  try {
    const { topic, options, preferences, optionImages } = req.body;

    if (!topic || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        error: "Missing parameters. You must provide a decision topic and at least two options.",
      });
    }

    const ai = getGeminiClient();

    let userPrompt = `
      Decision Topic: ${topic}
      Options to analyze:
      ${options.map((opt, idx) => `- Option ${idx + 1}: "${opt}"${optionImages && optionImages[idx] ? " (Image attachment provided)" : ""}`).join("\n")}
      
      Additional User Preferences / Context:
      ${preferences ? preferences : "None specified. Use general rational decision-making principles."}
    `;

    const hasImages = optionImages && Array.isArray(optionImages) && optionImages.some(img => !!img);

    if (hasImages) {
      userPrompt += `
      
      CRITICAL MULTIMODAL INSTRUCTION:
      The user has uploaded/attached images for one or more of the options listed above.
      - Inspect each attached image carefully. Detect and identify what is shown (e.g., style, design, features, quality, aesthetic, physical condition, labels, text, or specifications).
      - Analyze how what you see in the images directly informs the decision: compare them, identify relative strengths/weaknesses visually, and use this to break the tie.
      - In your final Verdict reasoning, Pros & Cons, and SWOT Analysis, explicitly reference details you've observed in the images to make your evaluation concrete, credible, and grounded in the visual evidence.
      `;
    }

    const systemInstruction = `
      You are "The Tiebreaker", a world-class analytical decision consultant.
      The user is facing a tough choice (a tiebreaker situation). Your mission is to break the tie, run deep analytical diagnostics, and give a highly objective, rigorous decision-making pack.
      
      You must evaluate all options carefully and provide:
      1. A rigorous Verdict (recommendedOption must EXACTLY match one of the options in the list, confidence score, full reasoning, tradeoffs, next actions).
      2. A robust side-by-side Pros & Cons list for each option, with concrete points and impact level ('high', 'medium', 'low').
      3. A Comparison Table comparing the options across at least 4 key relevant criteria (e.g., Cost, Risk, Growth, Comfort, Time). For each criteria, score each option from 1 to 5 with a short 1-sentence explanation.
      4. A comprehensive SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats) for each option.
      
      Be incredibly specific, insightful, and detailed. Avoid generic advice (like "depends on your budget" if no budget is specified, instead make realistic assumptions or analyze the budget tradeoff directly). Focus on real-world outcomes.
    `;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        verdict: {
          type: Type.OBJECT,
          properties: {
            recommendedOption: {
              type: Type.STRING,
              description: "The exact name of the recommended option, matching one of the options provided.",
            },
            confidence: {
              type: Type.INTEGER,
              description: "Confidence rating of the recommendation from 0 to 100.",
            },
            reasoning: {
              type: Type.STRING,
              description: "A highly persuasive, analytical explanation of why this option is the winner.",
            },
            keyTradeoff: {
              type: Type.STRING,
              description: "The main sacrifice, risk, or tradeoff the user must accept with this choice.",
            },
            nextSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 immediate, actionable next steps to execute the decision.",
            },
          },
          required: ["recommendedOption", "confidence", "reasoning", "keyTradeoff", "nextSteps"],
        },
        prosCons: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              option: { type: Type.STRING, description: "The name of the option." },
              pros: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    point: { type: Type.STRING, description: "Concise pro title." },
                    description: { type: Type.STRING, description: "Explanation of why this is a positive." },
                    impact: { type: Type.STRING, description: "Impact: 'high', 'medium', or 'low'." },
                  },
                  required: ["point", "description", "impact"],
                },
              },
              cons: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    point: { type: Type.STRING, description: "Concise con title." },
                    description: { type: Type.STRING, description: "Explanation of why this is a negative." },
                    impact: { type: Type.STRING, description: "Impact: 'high', 'medium', or 'low'." },
                  },
                  required: ["point", "description", "impact"],
                },
              },
            },
            required: ["option", "pros", "cons"],
          },
        },
        comparisonTable: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              criteria: { type: Type.STRING, description: "Dimension of comparison (e.g. Cost, Risk, Effort)." },
              optionScores: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    option: { type: Type.STRING, description: "The name of the option." },
                    score: { type: Type.INTEGER, description: "A score from 1 to 5." },
                    justification: { type: Type.STRING, description: "1-sentence reason for this score." },
                  },
                  required: ["option", "score", "justification"],
                },
              },
            },
            required: ["criteria", "optionScores"],
          },
        },
        swotAnalysis: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              option: { type: Type.STRING, description: "The name of the option." },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
              threats: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["option", "strengths", "weaknesses", "opportunities", "threats"],
          },
        },
      },
      required: ["verdict", "prosCons", "comparisonTable", "swotAnalysis"],
    };

    // Construct the structured parts array
    const parts: any[] = [{ text: userPrompt }];

    if (hasImages) {
      optionImages.forEach((imgStr: string, idx: number) => {
        if (imgStr) {
          const parsed = parseBase64Image(imgStr);
          if (parsed) {
            parts.push({
              text: `Attached image for Option ${idx + 1} ("${options[idx] || ""}"):`,
            });
            parts.push({
              inlineData: {
                mimeType: parsed.mimeType,
                data: parsed.data,
              },
            });
          }
        }
      });
    }

    // Robust multi-model fallback list with retry & backoff mechanism
    // Prioritize gemini-2.5-flash for maximum reliability and fast fallback
    const modelsToTry = ["gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-3.5-flash"];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      let attempts = 4;
      let waitMs = 1000;

      while (attempts > 0) {
        try {
          console.log(`[The Tiebreaker] Requesting decision analysis from '${modelName}' (Attempts remaining: ${attempts})...`);
          response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema,
            },
          });
          break; // Succeeded! Break the inner attempt loop
        } catch (err: any) {
          lastError = err;
          const errMsg = String(err.message || "").toLowerCase();
          const errStatus = String(err.status || "").toUpperCase();
          const errString = String(err || "").toLowerCase();

          console.warn(`[The Tiebreaker] Model '${modelName}' encountered an issue:`, errMsg || errString);

          const isRateLimit = 
            errMsg.includes("429") || 
            errString.includes("429") || 
            errStatus.includes("RESOURCE_EXHAUSTED");

          const isUnavailableOrCongested = 
            errMsg.includes("503") || 
            errMsg.includes("unavailable") || 
            errMsg.includes("high demand") || 
            errMsg.includes("spikes in demand") ||
            errMsg.includes("overloaded") ||
            errString.includes("503") ||
            errString.includes("unavailable") ||
            errStatus.includes("UNAVAILABLE");

          if (isRateLimit && attempts > 1) {
            attempts--;
            console.log(`[The Tiebreaker] Detected rate limit. Backing off for ${waitMs}ms before retrying '${modelName}'...`);
            await new Promise((resolve) => setTimeout(resolve, waitMs));
            waitMs *= 2.0; // standard exponential backoff
          } else if (isUnavailableOrCongested) {
            console.log(`[The Tiebreaker] Model '${modelName}' is unavailable or experiencing high demand. Skipping immediately to next model...`);
            break; // Skip further retries on this model, go directly to next model
          } else if (attempts > 1) {
            attempts--;
            console.log(`[The Tiebreaker] Detected transient issue. Backing off for ${waitMs}ms before retrying '${modelName}'...`);
            await new Promise((resolve) => setTimeout(resolve, waitMs));
            waitMs *= 1.5;
          } else {
            console.log(`[The Tiebreaker] Non-transient error or exhausted attempts. Stepping to next model...`);
            break;
          }
        }
      }

      if (response) {
        break; // Successfully got response from a model! Break the outer model loop
      }
    }

    if (!response) {
      throw lastError || new Error("Failed to process decision with AI models. Both main and backup models returned transient errors.");
    }

    const text = response.text;
    if (!text) {
      throw new Error("No response text returned from the model.");
    }

    const data = JSON.parse(text.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Tiebreaker error:", error);
    res.status(500).json({
      error: error.message || "An error occurred while generating the decision report.",
    });
  }
});

// REST API for follow-up Q&A
app.post("/api/followup", async (req, res) => {
  try {
    const { topic, options, preferences, report, question, chatHistory } = req.body;

    if (!question || !topic || !options || !report) {
      return res.status(400).json({
        error: "Missing required parameters (question, topic, options, or report).",
      });
    }

    const ai = getGeminiClient();

    const systemInstruction = `
      You are "The Tiebreaker", a world-class analytical decision consultant.
      The user has already received a detailed decision analysis report for their dilemma.
      They are now asking a follow-up question or seeking further clarification.
      
      Here is the context of the decision:
      - Topic: "${topic}"
      - Options: ${options.map(o => `"${o}"`).join(", ")}
      - Original user preferences: ${preferences || "None specified"}
      
      The original report analyzed this dilemma and generated:
      - Recommended Option: "${report.verdict?.recommendedOption}"
      - Confidence: ${report.verdict?.confidence}%
      - Primary Reasoning: "${report.verdict?.reasoning}"
      - Tradeoff: "${report.verdict?.keyTradeoff}"
      
      CRITICAL FORMATTING & VISUALIZATION REQUIREMENTS:
      1. BE EXTREMELY CONCISE: Do not write long paragraphs. Your response must be brief (under 160 words total), structured with bold subheadings (using Markdown '## Section Name' or '### Sub-section') and clear bullet points. Avoid any introductory "Certainly!" or conversational fluff.
      2. MAKE SECTIONS HIGHLY DISTINCT:
         - Partition your answer into 2 or 3 distinct sections.
         - Use markdown horizontal rule dividers ('---') to cleanly separate these sections.
         - Use blockquotes ('> Write a key advice, warning, or tip here') for critical conclusions or advice to draw the eye.
      3. USE DYNAMIC CHARTS: To better illustrate your analysis, you MUST include exactly ONE dynamic, beautifully configured interactive chart using the [CHART_DATA] tag format.
         
         The chart data MUST be placed inside the message like this:
         [CHART_DATA]
         {
           "type": "bar", // can be "bar", "line", "radar", or "pie"
           "title": "A highly descriptive, visual title for the data",
           "data": [
             { "name": "Option/Factor Name", "MetricName1": 85, "MetricName2": 45 },
             { "name": "Another Option/Factor", "MetricName1": 70, "MetricName2": 60 }
           ],
           "keys": ["MetricName1", "MetricName2"]
         }
         [/CHART_DATA]
         
         Rules for Charts:
         - Select the type ("bar", "line", "radar", "pie") that best represents the question.
           * "bar" / "radar": excellent for comparing multi-attribute scores of options (e.g. Cost, Speed, Long-term Value).
           * "line": perfect for progressive steps, timelines, probability spreads, or risk trends.
           * "pie": perfect for breakdown of resources, weights, or relative importance of criteria (keys for "pie" should be ["value"]).
         - The JSON inside [CHART_DATA] tags must be 100% valid. Do not wrap it in codeblock markers like \`\`\`json. Just put the [CHART_DATA] and [/CHART_DATA] tags on their own lines.
         - Focus on using realistic numbers based on the user's dilemma to make the visualization highly informative and actionable.
    `;

    const contents: any[] = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((msg) => {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      });
    }

    contents.push({
      role: "user",
      parts: [{ text: question }],
    });

    // Robust multi-model fallback list with retry & backoff mechanism
    // Prioritize gemini-2.5-flash for maximum reliability and fast fallback
    const modelsToTry = ["gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-3.5-flash"];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      let attempts = 4;
      let waitMs = 1000;

      while (attempts > 0) {
        try {
          console.log(`[The Tiebreaker Followup] Requesting followup response from '${modelName}' (Attempts remaining: ${attempts})...`);
          response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
              systemInstruction,
            },
          });
          break; // Succeeded! Break the inner attempt loop
        } catch (err: any) {
          lastError = err;
          const errMsg = String(err.message || "").toLowerCase();
          const errStatus = String(err.status || "").toUpperCase();
          const errString = String(err || "").toLowerCase();

          console.warn(`[The Tiebreaker Followup] Model '${modelName}' encountered an issue:`, errMsg || errString);

          const isRateLimit = 
            errMsg.includes("429") || 
            errString.includes("429") || 
            errStatus.includes("RESOURCE_EXHAUSTED");

          const isUnavailableOrCongested = 
            errMsg.includes("503") || 
            errMsg.includes("unavailable") || 
            errMsg.includes("high demand") || 
            errMsg.includes("spikes in demand") ||
            errMsg.includes("overloaded") ||
            errString.includes("503") ||
            errString.includes("unavailable") ||
            errStatus.includes("UNAVAILABLE");

          if (isRateLimit && attempts > 1) {
            attempts--;
            console.log(`[The Tiebreaker Followup] Detected rate limit. Backing off for ${waitMs}ms before retrying '${modelName}'...`);
            await new Promise((resolve) => setTimeout(resolve, waitMs));
            waitMs *= 2.0; // standard exponential backoff
          } else if (isUnavailableOrCongested) {
            console.log(`[The Tiebreaker Followup] Model '${modelName}' is unavailable or experiencing high demand. Skipping immediately to next model...`);
            break; // Skip further retries on this model, go directly to next model
          } else if (attempts > 1) {
            attempts--;
            console.log(`[The Tiebreaker Followup] Detected transient issue. Backing off for ${waitMs}ms before retrying '${modelName}'...`);
            await new Promise((resolve) => setTimeout(resolve, waitMs));
            waitMs *= 1.5;
          } else {
            console.log(`[The Tiebreaker Followup] Non-transient error or exhausted attempts. Stepping to next model...`);
            break;
          }
        }
      }

      if (response) {
        break; // Successfully got response from a model! Break the outer model loop
      }
    }

    if (!response) {
      throw lastError || new Error("Failed to process follow-up with Gemini. Both main and backup models returned transient errors.");
    }

    const reply = response.text;
    if (!reply) {
      throw new Error("No response text returned from the model.");
    }

    res.json({ reply });
  } catch (error: any) {
    console.error("Followup endpoint error:", error);
    res.status(500).json({
      error: error.message || "An error occurred while answering your follow-up question.",
    });
  }
});

// Endpoint to automatically suggest a sub-dilemma when branching
app.post("/api/suggest-branch", async (req, res) => {
  try {
    const { parentTopic, branchedFromOption, preferences } = req.body;

    if (!parentTopic || !branchedFromOption) {
      return res.status(400).json({
        error: "Missing required parameters: parentTopic and branchedFromOption",
      });
    }

    const ai = getGeminiClient();

    const systemInstruction = `
      You are "The Tiebreaker", a premium decision engineering assistant.
      The user decided to move forward with the option "${branchedFromOption}" from their main dilemma: "${parentTopic}".
      Now they want to create a sub-decision (a nested branch) to explore next steps, execution choices, or specialized sub-options for "${branchedFromOption}".
      
      Your job is to automatically suggest a highly logical, professional, and practical secondary decision.
      For example:
      - If the option was "Tesla Model Y", a logical sub-decision might be "Long Range AWD vs. Performance" or "Buy New vs. Lease".
      - If the option was "React Single Page App", a logical sub-decision might be "Tailwind CSS vs. CSS Modules" or "Vercel vs. Self-hosted on AWS".
      
      Make the topic concise, realistic, and highly engaging.
      Return the response in the exact JSON schema requested.
    `;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        suggestedTopic: {
          type: Type.STRING,
          description: "Concise, analytical question defining the sub-dilemma for this option.",
        },
        suggestedOptions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "A list of exactly 2 or 3 highly specific sub-options or implementation paths to choose between.",
        },
        suggestedPreferences: {
          type: Type.STRING,
          description: "A tailored recommendation of relevant criteria, weights, or conditions to include in the preferences.",
        },
        suggestedTag: {
          type: Type.STRING,
          description: "One of: Career, Finance, Housing, Tech, Personal, Health, Travel",
        }
      },
      required: ["suggestedTopic", "suggestedOptions", "suggestedPreferences", "suggestedTag"],
    };

    const userPrompt = `
      Parent Dilemma Topic: "${parentTopic}"
      Chosen Option to explore: "${branchedFromOption}"
      Existing general preferences context: "${preferences || "None specified."}"
    `;

    // Prioritize gemini-2.5-flash and fallback to highly available models
    const modelsToTry = ["gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-3.5-flash"];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[Suggest Branch] Requesting suggestion from '${modelName}'...`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: userPrompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
          },
        });
        if (response) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Suggest Branch] Model '${modelName}' failed:`, err.message || err);
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error("Failed to generate branch suggestion with Gemini.");
    }

    const data = JSON.parse(response.text.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Suggest Branch endpoint error:", error);
    res.status(500).json({
      error: error.message || "An error occurred while generating decision branch recommendations.",
    });
  }
});

// Endpoint to decode unstructured voice/text speech transcript into structured dilemma elements
app.post("/api/decode-dilemma", async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript || typeof transcript !== "string" || !transcript.trim()) {
      return res.status(400).json({
        error: "Missing transcript. Please provide the spoken text to decode.",
      });
    }

    const ai = getGeminiClient();

    const systemInstruction = `
      You are "The Dilemma Decoder", a premier consulting AI.
      The user has narrated or spoken a messy, unstructured description of a tough decision they are facing.
      Your job is to analyze their spoken words and carefully decode a clean, highly structured decision-making profile.
      
      Analyze the transcript and extract:
      1. topic: A clear, concise, professional question defining the core dilemma (e.g., "Should I accept the new senior developer offer or stay at my current stable job?").
      2. options: An array of 2 to 4 concrete, distinct options or paths being considered (e.g., ["Accept New Offer", "Stay at Current Job"]).
         - If the user only described one option, propose a natural counter-alternative or "Do nothing/Keep status quo" as the second option.
         - Make options concise (usually 1-4 words).
      3. preferences: A rich, clear summary of any stated priorities, background context, weights, constraints, budget, feelings, or rules of choice the user expressed.
      4. tag: The single most appropriate category for this dilemma. It MUST be exactly one of: Career, Finance, Housing, Tech, Personal, Health, Travel.
      
      Do not make up options that the user explicitly rejected, but do make the options clear and mutually exclusive.
      Return the response in the exact JSON schema requested.
    `;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        topic: {
          type: Type.STRING,
          description: "Clear, concise core question or decision topic.",
        },
        options: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "An array of 2 to 4 distinct options or alternatives being compared.",
        },
        preferences: {
          type: Type.STRING,
          description: "Extracted context, stated criteria, weights, feelings, or constraints.",
        },
        tag: {
          type: Type.STRING,
          description: "The most relevant category: Career, Finance, Housing, Tech, Personal, Health, or Travel.",
        },
      },
      required: ["topic", "options", "preferences", "tag"],
    };

    const userPrompt = `Spoken Dilemma Transcript:\n"${transcript}"`;

    // Prioritize gemini-2.5-flash and fallback to highly available models
    const modelsToTry = ["gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-3.5-flash"];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[Dilemma Decoder] Requesting decoding from '${modelName}'...`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: userPrompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
          },
        });
        if (response) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Dilemma Decoder] Model '${modelName}' failed:`, err.message || err);
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error("Failed to decode dilemma transcript with Gemini.");
    }

    const data = JSON.parse(response.text.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Decode Dilemma endpoint error:", error);
    res.status(500).json({
      error: error.message || "An error occurred while decoding your spoken dilemma transcript.",
    });
  }
});

// Endpoint to decode visual "this or that" or image-based dilemma into structured dilemma elements
app.post("/api/decode-image-dilemma", async (req, res) => {
  try {
    const { image, images, notes } = req.body;

    const base64List: string[] = [];
    if (images && Array.isArray(images)) {
      base64List.push(...images.filter(img => typeof img === "string" && img.trim() !== ""));
    } else if (image && typeof image === "string") {
      base64List.push(image);
    }

    if (base64List.length === 0) {
      return res.status(400).json({
        error: "Missing image. Please provide at least one photo or screenshot of the dilemma.",
      });
    }

    const ai = getGeminiClient();

    const systemInstruction = `
      You are "The Image Dilemma Decoder", a premier visual consulting AI.
      The user has uploaded ${base64List.length} image(s) of a dilemma (e.g., comparing multiple items/options, choice of outfits, products, foods, vacation spots, or a buy-or-not-buy decision) along with optional notes.
      Your job is to examine the image(s) and notes carefully and decode a clean, highly structured decision-making profile.
      
      Analyze the visual contents and extract:
      1. topic: A clear, concise, professional question defining the core dilemma (e.g., "Which dress should I choose for the cocktail party?" or "Should I purchase this gourmet burger or eat healthy?").
      2. options: An array of 2 to 4 concrete, distinct options being compared.
         - If multiple separate images were uploaded, map each option precisely to what is pictured in each respective image in order (e.g., Image 1 is Option 1, Image 2 is Option 2).
         - Make options concise (usually 1-4 words).
      3. preferences: A rich, clear summary of what is visible in the images (colors, features, condition, styles, differences between the items) and any stated criteria, constraints, or feelings from the user's notes.
      4. tag: The single most appropriate category for this dilemma. It MUST be exactly one of: Career, Finance, Housing, Tech, Personal, Health, Travel.
      
      Return the response in the exact JSON schema requested.
    `;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        topic: {
          type: Type.STRING,
          description: "Clear, concise core question or decision topic.",
        },
        options: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "An array of 2 to 4 distinct options or alternatives being compared.",
        },
        preferences: {
          type: Type.STRING,
          description: "Extracted context, details visible in the image, and any written notes.",
        },
        tag: {
          type: Type.STRING,
          description: "The most relevant category: Career, Finance, Housing, Tech, Personal, Health, or Travel.",
        },
      },
      required: ["topic", "options", "preferences", "tag"],
    };

    const parts: any[] = [];
    if (notes && notes.trim()) {
      parts.push({ text: `User's descriptive notes:\n"${notes.trim()}"\n\nPlease analyze the image(s) in conjunction with these notes to form the structured dilemma.` });
    } else {
      parts.push({ text: `Analyze the provided ${base64List.length} image(s) to decode the user's dilemma and identify distinct option names.` });
    }

    // Add each base64 image as a part
    for (let i = 0; i < base64List.length; i++) {
      const parsed = parseBase64Image(base64List[i]);
      if (parsed) {
        parts.push({
          inlineData: {
            mimeType: parsed.mimeType,
            data: parsed.data,
          },
        });
      }
    }

    const modelsToTry = ["gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-3.5-flash"];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[Image Dilemma Decoder] Requesting decoding from '${modelName}'...`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: parts,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
          },
        });
        if (response) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Image Dilemma Decoder] Model '${modelName}' failed:`, err.message || err);
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error("Failed to decode image dilemma with Gemini.");
    }

    const data = JSON.parse(response.text.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Decode Image Dilemma endpoint error:", error);
    res.status(500).json({
      error: error.message || "An error occurred while decoding your image-based dilemma.",
    });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`The Tiebreaker server is online on port ${PORT}`);
  });
}

startServer();
