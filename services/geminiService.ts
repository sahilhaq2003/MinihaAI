// Secure Gemini API Service - All calls go through backend (API key hidden)
import { DetectionResult, EvaluationResult, HumanizeOptions } from "../types";

// Backend URL for API calls
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

// Humanize text - calls backend proxy
export const humanizeText = async (text: string, options: HumanizeOptions): Promise<string> => {
  if (!text.trim()) return "";

  try {
    const response = await fetch(`${BACKEND_URL}/ai/humanize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        tone: options.tone || 'Natural',
        vocabulary: options.vocabulary || 'Standard',
        intensity: options.intensity || 50
      })
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to humanize text');
    }

    return data.text || '';
  } catch (error: any) {
    console.error("Humanize API Error:", error);
    throw new Error(error.message || "Failed to humanize text. Please try again.");
  }
};

// Detect AI content - calls backend proxy
export const detectAIContent = async (text: string, apiKey?: string): Promise<DetectionResult> => {
  if (!text.trim()) {
    return {
      score: 0,
      label: "Error",
      analysis: "No text provided for detection.",
      sentences: [],
      metrics: {},
      detectedModels: []
    };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/ai/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    const data = await response.json();
    
    if (!data.success) {
      return {
        score: 0,
        label: "Error",
        analysis: data.message || "Detection failed.",
        sentences: [],
        metrics: {},
        detectedModels: []
      };
    }

    return {
      score: data.score || 0,
      label: data.label || "Unknown",
      analysis: data.analysis || "No analysis available.",
      sentences: data.sentences || [],
      metrics: data.metrics || {},
      detectedModels: data.detectedModels || []
    };
  } catch (error: any) {
    console.error("Detection API Error:", error);
    return {
      score: 0,
      label: "Connection Error",
      analysis: "Unable to reach the detection service.",
      sentences: [],
      metrics: {},
      detectedModels: []
    };
  }
};

// Evaluate quality - calls backend proxy
export const evaluateQuality = async (original: string, rewritten: string, apiKey?: string): Promise<EvaluationResult> => {
  if (!original.trim() || !rewritten.trim()) {
    throw new Error("Missing content for evaluation");
  }

  try {
    const response = await fetch(`${BACKEND_URL}/ai/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ original, rewritten })
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to evaluate quality');
    }

    return {
      humanScore: data.humanScore || 0,
      meaningPreserved: data.meaningPreserved || false,
      sentenceVariety: data.sentenceVariety || 'Unable to evaluate',
      feedback: data.feedback || 'No feedback available.'
    };
  } catch (error: any) {
    console.error("Evaluation API Error:", error);
    throw new Error(error.message || "Failed to evaluate quality. Please try again.");
  }
};
