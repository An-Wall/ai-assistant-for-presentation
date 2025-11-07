import { useState, useCallback } from 'react';

export interface SpeechComparisonResult {
  currentMatchedIndex: number;
  isCorrect: boolean;
  skippedParts: string[];
  mismatchedWords?: Array<{
    expected: string;
    spoken: string;
    position: number;
  }>;
}

export interface LLMRegenerateResult {
  regeneratedScript: string;
  summary: string;
}

const API_BASE = process.env.REACT_APP_API_URL || '';

/**
 * 백엔드 API 호출 커스텀 훅
 */
export function useApiClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 음성 vs 원고 비교
   */
  const compareSpeech = useCallback(
    async (
      spokenText: string,
      scriptText: string,
      lastMatchedIndex: number = 0
    ): Promise<SpeechComparisonResult | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/api/speech-comparison`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            spokenText,
            scriptText,
            lastMatchedIndex,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Speech comparison failed');
        }

        const data: SpeechComparisonResult = await response.json();
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Speech comparison error:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * LLM으로 누락된 부분 재구성
   */
  const regenerateWithLLM = useCallback(
    async (
      fullScript: string,
      spokenText: string,
      skippedParts: string[]
    ): Promise<LLMRegenerateResult | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/api/llm-regenerate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullScript,
            spokenText,
            skippedParts,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'LLM regeneration failed');
        }

        const data: LLMRegenerateResult = await response.json();
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('LLM regeneration error:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    error,
    compareSpeech,
    regenerateWithLLM,
  };
}