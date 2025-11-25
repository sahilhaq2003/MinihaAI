
import { GoogleGenAI, Type } from "@google/genai";
import { Tone, DetectionResult, EvaluationResult, HumanizeOptions, Vocabulary } from "../types";

// Default API key (fallback for production)
const DEFAULT_API_KEY = 'AIzaSyCO5ugrB87_9Cxmr4uU5WNCLnmq79C7wcs';

// Helper to safely get AI client
const getAiClient = (apiKey?: string) => {
  // Priority: UI-provided key > Environment Variable > Default
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY || DEFAULT_API_KEY;

  if (!key) {
    throw new Error("MISSING_API_KEY");
  }
  return new GoogleGenAI({ apiKey: key });
};

// --- PIPELINE STEP 1: PREPROCESSING ---
// Cleans input to remove AI formatting artifacts before processing
const preprocessText = (text: string): string => {
  return text
    .replace(/^["']|["']$/g, '') // Remove surrounding quotes often pasted
    .replace(/\*\*/g, '')         // Remove bold markdown
    .replace(/##/g, '')           // Remove heading markdown
    .replace(/^\s*[-—]\s+/gm, '') // Remove list dashes/em-dashes at start of lines
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered lists
    .replace(/—/g, '-')           // Convert em-dashes to hyphens
    .replace(/–/g, '-')           // Convert en-dashes to hyphens
    .replace(/\n{3,}/g, '\n\n')   // Normalize newlines
    .trim();
};

// --- PIPELINE STEP 4: POSTPROCESSING ---
// Final cleanup to ensure clean output without meta-commentary
const postprocessText = (text: string): string => {
  let result = text.trim();
  // Remove "Here is the rewritten text" meta-talk common in LLMs
  result = result.replace(/^(Here is|Sure,|I have rewritten|The following is).+?:/i, '').trim();
  // Remove surrounding quotes if model adds them
  result = result.replace(/^"([\s\S]*)"$/, '$1');
  // Enforce hyphen preference over em-dash per user request
  result = result.replace(/—/g, '-').replace(/–/g, '-');
  return result;
};

export const humanizeText = async (text: string, options: HumanizeOptions): Promise<string> => {
  if (!text.trim()) return "";

  try {
    const ai = getAiClient(options.apiKey);
    // Updated to gemini-2.0-flash as requested
    const model = 'gemini-2.0-flash';
    const cleanInput = preprocessText(text);
    
    // High creativity settings to beat ZeroGPT/Originality (High temperature = High Perplexity)
    // Intensity 0 -> Temp 0.85
    // Intensity 100 -> Temp 1.65 (Pushing boundaries for Originality.ai)
    const baseTemp = 0.85 + (options.intensity / 100) * 0.8;
    const temperature = Math.min(Math.max(baseTemp, 0.7), 1.7);

    // --- PIPELINE STEP 2: HUMANIZATION PASS (Drafting) ---
    // Specifically targets: Turnitin, Originality.ai, GPTZero, ZeroGPT, Copyleaks, DrillBit, AntiPlag
    const promptPass1 = `
      You are an Elite Anti-Detection Ghostwriter. 
      Your mission is to rewrite the text to bypass aggressive academic detectors used in Sri Lanka and globally: 
      Turnitin, DrillBit, AntiPlag, Originality.ai, GPTZero, and Copyleaks.

      THE "HUMAN" ALGORITHM (Apply Strictly):

      1.  **DEFEAT TURNITIN / DRILLBIT / ANTIPLAG (Structure & Logic Hacking)**:
          - **Anti-Structure**: AI uses "Topic Sentence -> Evidence -> Conclusion". YOU MUST BREAK THIS. Bury the main point in the middle.
          - **Logic Reversal**: If the original says "X causes Y because of Z", rewrite as "Looking at Z, we can see why Y happens when X is involved." Change the ORDER of information.
          - **DrillBit Defense**: DrillBit looks for direct phrase matches. You must deep-paraphrase: Change Active Voice to Passive (or vice versa) and split one sentence into two, or combine two into one.

      2.  **DEFEAT QUILLBOT / GRAMMARLY PATTERNS**:
          - **NO Synonym Stuffing**: Do NOT replace simple words with complex ones (e.g., don't change "use" to "utilize" or "make" to "orchestrate"). This triggers "AI Spinner" detection. Use simple, natural vocabulary.
          - **Anti-Grammarly**: Grammarly makes text "clean." You must make it "human." Allow occasional sentence fragments. Start sentences with conjunctions (And, But, So). Use contractions (It's, We're).

      3.  **DEFEAT ORIGINALITY.AI (Vocabulary Ban)**:
          - **STRICTLY BANNED WORDS**: "delve", "tapestry", "realm", "landscape", "underscores", "crucial", "leverage", "utilize", "orchestrate", "testament", "pivotal", "nuance".
          - **BANNED TRANSITIONS**: "Moreover", "Furthermore", "In conclusion", "Additionally", "Conversely", "Notably", "Thus", "Hence".
          - **USE HUMAN TRANSITIONS**: "Plus", "On top of that", "Honestly", "So", "But", "Funny enough", "As for", "Besides".

      4.  **DEFEAT GPTZERO (Perplexity & Burstiness)**:
          - **Burstiness**: Mix extremely short sentences (2-5 words) with very long, winding sentences (30+ words).
          - **Perplexity**: Make unpredictable word choices. Avoid the most "likely" next word.

      5.  **FORMATTING RULES**:
          - NO bullet points. NO numbered lists. NO bold text. NO headings.
          - Write in continuous, natural paragraphs.

      SETTINGS:
      - Tone: ${options.tone}
      - Vocabulary: ${options.vocabulary} (Standard/Simple is best for DrillBit/AntiPlag)
      - Intensity: ${options.intensity}%

      INPUT TEXT:
      "${cleanInput}"
    `;

    const response1 = await ai.models.generateContent({
      model: model,
      contents: promptPass1,
      config: {
        temperature: temperature,
        topP: 0.98, // Increased for more random vocabulary selection
        topK: 100,
      }
    });

    const draft = response1.text || "";
    if (!draft) throw new Error("Phase 1 generation failed");

    // --- PIPELINE STEP 3: REFINEMENT PASS (Polishing) ---
    // Focuses on Flow, Logic, and removing any lingering "AI Smell"
    const promptPass2 = `
      You are a "Humanizer" Editor. Your job is to make the text below undetectable by DrillBit, AntiPlag, and Turnitin.

      INSTRUCTIONS:
      1.  **Read Aloud Check**: If a sentence sounds too "perfect" or academic, rewrite it to sound conversational (unless Academic tone is selected, then use "hedging" language like 'It seems that' instead of 'It is').
      2.  **Hyphens**: Ensure all dashes are standard hyphens (-), not em-dashes (—).
      3.  **Kill the Robot**: Remove any phrase that sounds like a summary (e.g., "In summary", "Ultimately"). Just end the text naturally.
      4.  **Anti-Perfection**: Do NOT fix "comma splices" or "fragments" if they add to the voice. Humans write with flow, not perfect grammar rules.
      5.  **Clarity**: Ensure the meaning is instantly easy to understand.

      DRAFT TEXT:
      "${draft}"
    `;

    const response2 = await ai.models.generateContent({
      model: model, 
      contents: promptPass2,
      config: {
        temperature: Math.max(temperature - 0.2, 0.7), 
        topP: 0.95,
      }
    });

    const refinedDraft = response2.text || draft; 

    return postprocessText(refinedDraft);

  } catch (error: any) {
    if (error.message === "MISSING_API_KEY") {
        throw new Error("MISSING_API_KEY");
    }
    console.error("Gemini API Pipeline Error:", error);
    throw new Error("Failed to humanize text. Please try again.");
  }
};

export const evaluateQuality = async (original: string, rewritten: string, apiKey?: string): Promise<EvaluationResult> => {
  if (!original.trim() || !rewritten.trim()) throw new Error("Missing content for evaluation");

  try {
    const ai = getAiClient(apiKey);
    const prompt = `
        You are a Senior Editor and Quality Assurance Specialist. 
        Compare the ORIGINAL AI text with the REWRITTEN humanized version.
        
        Evaluate on three criteria:
        1. **Human-Likeness**: Does the rewrite sound authentically human, or does it still feel robotic?
        2. **Meaning Preservation**: Is the core message of the original preserved in the rewrite?
        3. **Sentence Variety**: Does the rewrite use a good mix of short and long sentences?

        ORIGINAL: "${original.substring(0, 1000)}"
        
        REWRITTEN: "${rewritten.substring(0, 1000)}"

        Provide results in strict JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            humanScore: {
              type: Type.INTEGER,
              description: "Score from 0-100 where 100 is perfectly natural human writing.",
            },
            meaningPreserved: {
              type: Type.BOOLEAN,
              description: "True if the core meaning is intact, False if it was lost.",
            },
            sentenceVariety: {
              type: Type.STRING,
              description: "Short assessment of sentence structure (e.g. 'Excellent variety', 'Still repetitive').",
            },
            feedback: {
              type: Type.STRING,
              description: "One sentence of constructive feedback.",
            },
          },
          required: ["humanScore", "meaningPreserved", "sentenceVariety", "feedback"],
        },
      },
    });

    const textResponse = response.text;
    if (!textResponse) throw new Error("Empty response from Evaluation");
    
    return JSON.parse(textResponse) as EvaluationResult;

  } catch (error: any) {
    if (error.message === "MISSING_API_KEY") {
        throw new Error("MISSING_API_KEY");
    }
    console.error("Evaluation API Error:", error);
    return {
      humanScore: 0,
      meaningPreserved: false,
      sentenceVariety: "Error",
      feedback: "Could not evaluate quality."
    };
  }
};

export const detectAIContent = async (text: string, apiKey?: string): Promise<DetectionResult> => {
  if (!text.trim()) throw new Error("Text is empty");

  try {
    const ai = getAiClient(apiKey);
    // Robust prompt for detection simulating top detectors including DrillBit/AntiPlag
    const prompt = `
        Act as a Master AI Detector combining the logic of Turnitin, DrillBit, AntiPlag, Originality.ai, and GPTZero.
        Analyze the following text for AI generation patterns.

        STRICT CRITERIA FOR "AI" VERDICT (Flag these):
        1.  **Originality.ai Logic**: Uses "Glue Words" (Furthermore, Moreover, In conclusion).
        2.  **Turnitin/DrillBit Logic**: Perfect 5-paragraph essay structure with topic sentences. Linear logic flow.
        3.  **GPTZero Logic**: Low Perplexity (predictable words) and Low Burstiness (uniform sentence length).
        4.  **Vocabulary**: Words like "delve", "tapestry", "underscores".

        CRITERIA FOR "HUMAN" VERDICT:
        - Conversational flow.
        - High Burstiness (mix of 3-word and 30-word sentences).
        - Imperfect transitions (starting sentences with And/But).
        - Unpredictable logic structure (e.g. starting with an example).
        
        INPUT TEXT:
        "${text.substring(0, 3000)}"

        Provide the result in strict JSON format.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.INTEGER,
              description: "Probability score (0-100). 100 means definitely AI, 0 means definitely Human.",
            },
            label: {
              type: Type.STRING,
              description: "Verdict: 'Human-Written', 'Mixed/Edited', 'Fully AI-Generated'.",
            },
            analysis: {
              type: Type.STRING,
              description: "Specific reasons citing detector logic (e.g., 'Triggered Originality.ai due to use of transition words').",
            },
          },
          required: ["score", "label", "analysis"],
        },
      },
    });

    const textResponse = response.text;
    if (!textResponse) throw new Error("Empty response from AI");
    
    try {
        const result = JSON.parse(textResponse);
        return result as DetectionResult;
    } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        return {
            score: 0,
            label: "Error",
            analysis: "Could not parse detection results."
        };
    }

  } catch (error: any) {
    if (error.message === "MISSING_API_KEY") {
        throw new Error("MISSING_API_KEY");
    }
    console.error("Detection API Error:", error);
    return {
      score: 0,
      label: "Connection Error",
      analysis: "Unable to reach the detection service."
    };
  }
};
