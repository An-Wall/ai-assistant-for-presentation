import { VercelRequest, VercelResponse } from '@vercel/node';
import { compareSpeeechWithScript } from './utils/comparison-service';
import type { SpeechComparisonRequest, SpeechComparisonResponse } from './utils/types';

export default function handler(
  req: VercelRequest,
  res: VercelResponse<SpeechComparisonResponse | { error: string }>
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
    const { spokenText, scriptText, lastMatchedIndex } = req.body as SpeechComparisonRequest;

    if (!spokenText || !scriptText) {
      res.status(400).json({ error: 'Missing required fields: spokenText, scriptText' });
      return;
    }

    const result = compareSpeeechWithScript(
      spokenText,
      scriptText,
      lastMatchedIndex || 0
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Speech comparison error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}