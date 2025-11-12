# 프레젠테이션 프롬프터 - 백엔드/프론트엔드 분리 설정 가이드

## 프로젝트 구조

```
project/
├── frontend/                    # React Vite 프론트엔드
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── api/                         # Vercel Functions (백엔드)
│   ├── speech-comparison.ts     # 음성 vs 원고 비교
│   ├── llm-regenerate.ts        # LLM으로 누락된 부분 재구성
│   └── utils/
│       ├── comparison-service.ts
│       ├── llm-client.ts
│       └── types.ts
├── vercel.json                  # Vercel 배포 설정
└── package.json                 # 루트 package.json
```

## 설치 방법

### 1. 의존성 설치

```bash
npm install
cd frontend && npm install
```

또는 한 번에:

```bash
npm run install-all
```

### 2. 환경변수 설정

`.env.local` 니일을 루트에 생성하고 다음을 추가:

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

> Gemini API 키는 https://aistudio.google.com/app/apikey 에서 발급받으세요

### 3. 로컬 개발

서버 실행을 위해 vercel을 설치합니다.
```bash
# vercel cli 설치
npm i -g vercel
```
백엔드용 터미널과 프론트엔드용 터미널을 각각 실행합니다.
```bash
# 백엔드 개발 서버 실행 (포트 3000)
vercel dev
```

```bash
# 프론트엔드 폴더로 이동하여 개발 서버 실행 (포트 5173)
cd frontend
npm run dev
```
http://localhost:5173 를 통해 테스트 할 수 있습니다.
프론트엔드는 자동으로 /api/* 요청을 localhost:3000로 프록시합니다.

## API 엔드포인트

### 1. 음성 vs 원고 비교

**POST** `/api/speech-comparison`

요청:
```json
{
  "spokenText": "발표자가 말한 텍스트",
  "scriptText": "원고 전체 텍스트",
  "lastMatchedIndex": 0
}
```

응답:
```json
{
  "currentMatchedIndex": 12,
  "isCorrect": true,
  "skippedParts": [],
  "mismatchedWords": []
}
```

### 2. LLM으로 누락된 부분 재구성

**POST** `/api/llm-regenerate`

요청:
```json
{
  "fullScript": "원고 전체",
  "spokenText": "발표자가 말한 부분",
  "skippedParts": ["누락된 부분 1", "누락된 부분 2"]
}
```

응답:
```json
{
  "regeneratedScript": "재구성된 원고...",
  "summary": "누락된 2개 부분을 포함하여 원고를 재구성했습니다."
}
```

## Vercel 배포

### 1. Vercel 계정 연결

```bash
npm i -g vercel
vercel login
```

### 2. 환경변수 설정

Vercel 대시보드에서 프로젝트 설정 → Environment Variables:

- `GEMINI_API_KEY`: Gemini API 키

### 3. 배포

```bash
vercel deploy --prod
```

## 프론트엔드에서 API 호출

`useApiClient` 훅을 사용:

```typescript
import { useApiClient } from '@/hooks/useApiClient';

function MyComponent() {
  const { compareSpeech, regenerateWithLLM, isLoading, error } = useApiClient();

  // 음성 비교
  const result = await compareSpeech(spokenText, scriptText);

  // LLM 재구성
  const regenerated = await regenerateWithLLM(fullScript, spokenText, skippedParts);
}
```

## 트러블슈팅

### API 호출 실패

1. 환경변수가 설정되었는지 확인
2. 프론트엔드가 올바른 경로로 요청하는지 확인
3. 브라우저 콘솔에서 네트워크 탭 확인

### OpenAI API 에러

- API 키가 유효한지 확인
- API 키가 활성화되었는지 확인
- 사용량이 제한을 넘었는지 확인

## 현재 기능 상태

### 구현된 기능
✅ 백엔드/프론트엔드 분리 완료
✅ 음성 인식 (클라이언트)
✅ 음성 vs 원고 비교 (백엔드)
❎ 누락된 부분 감지 (백엔드)
❎ 발음 오류 감지 (백엔드)
❎ LLM API 준비 (미배포)

### 예정된 기능
- [ ] 원고 vs 음성 빨간색 표시 UI
- [ ] LLM으로 누락된 부분 재구성
- [ ] 실시간 대시보드 개선
- [ ] 발표 기록 저장 및 분석

## 빌드 정보

- 프론트엔드 번들 크기: ~810KB (Vite 최소화)
- 백엔드 런타임: Node.js 18.x
- 지원 브라우저: Chrome, Firefox, Safari (Web Speech API 지원 필수)

## 다음 단계

1. **Vercel 배포**
   ```bash
   vercel deploy --prod
   ```

2. **Gemini API 키 설정**
   - Vercel 프로젝트 Settings → Environment Variables
   - `GEMINI_API_KEY` 추가

3. **실시간 테스트**
   - Live Prompter 화면에서 음성 인식 시작
   - 음성 vs 원고 비교 결과 확인
   - 누락된 부분 감지 확인
