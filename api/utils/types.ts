// Speech Comparison Request/Response
export interface SpeechComparisonRequest {
  spokenText: string;
  scriptText: string;
  lastMatchedIndex: number;
}

export interface SpeechComparisonResponse {
  currentMatchedIndex: number;
  isCorrect: boolean;
  skippedParts: string[];
  mismatchedWords?: {
    expected: string;
    spoken: string;
    position: number;
  }[];
}

// LLM Regenerate Request/Response
export interface LLMRegenerateRequest {
  fullScript: string;
  spokenText: string;
  skippedParts: string[];
}

export interface LLMRegenerateResponse {
  regeneratedScript: string;
  summary: string;
}

// API Error Response
export interface ApiErrorResponse {
  error: string;
  code: string;
  timestamp: string;
}