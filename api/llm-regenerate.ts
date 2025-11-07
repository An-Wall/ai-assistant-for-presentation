import { VercelRequest, VercelResponse } from '@vercel/node';
import { regenerateWithLLM } from './utils/llm-client';
import type { LLMRegenerateRequest, LLMRegenerateResponse } from './utils/types';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse<LLMRegenerateResponse | { error: string }>
) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { fullScript, spokenText, skippedParts } = req.body as LLMRegenerateRequest;

    if (!fullScript || !spokenText || !skippedParts) {
      res.status(400).json({
        error: 'Missing required fields: fullScript, spokenText, skippedParts',
      });
      return;
    }

    const regeneratedScript = await regenerateWithLLM(
      fullScript,
      spokenText,
      skippedParts
    );

    res.status(200).json({
      regeneratedScript,
      summary: `누락된 ${skippedParts.length}개 부분을 포함하여 원고를 재구성했습니다.`,
    });
  } catch (error) {
    console.error('LLM regenerate error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}