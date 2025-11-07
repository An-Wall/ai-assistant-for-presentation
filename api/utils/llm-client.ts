/**
 * LLM API 클라이언트
 * Google Gemini API를 사용합니다.
 * 환경 변수: GEMINI_API_KEY
 */

interface GeminiContent {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface GeminiRequest {
  contents: GeminiContent[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

/**
 * Google Gemini API를 호출하여 누락된 부분을 재구성합니다.
 */
export async function regenerateWithLLM(
  fullScript: string,
  spokenText: string,
  skippedParts: string[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const prompt = `당신은 프레젠테이션 원고를 작성하는 전문가입니다.

[전체 원고]
${fullScript}

[발표자가 말한 부분]
${spokenText}

[발표자가 누락한 부분]
${skippedParts.join('\n')}

위의 정보를 바탕으로:
1. 발표자가 누락한 부분을 고려하여
2. 원고의 흐름과 맥락에 맞춰
3. 누락된 내용을 자연스럽게 포함하는 재구성된 원고를 작성해주세요.

재구성된 원고만 출력하고, 다른 설명은 하지 마세요.`;

  const request: GeminiRequest = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2000,
    },
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data: GeminiResponse = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || '';
  } catch (error) {
    console.error('LLM regeneration error:', error);
    throw error;
  }
}
