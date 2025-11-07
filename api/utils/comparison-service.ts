/**
 * 단어를 비교하기 좋게 정규화
 */
function normalize(word: string): string {
  return word.toLowerCase().replace(/[.,!?;:\s]/g, '');
}

/**
 * 유사도 계산 (Levenshtein Distance 기반)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const normalized1 = normalize(str1);
  const normalized2 = normalize(str2);
  
  if (normalized1 === normalized2) return 1.0;
  
  const longer = normalized1.length > normalized2.length ? normalized1 : normalized2;
  const shorter = normalized1.length > normalized2.length ? normalized2 : normalized1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Levenshtein Distance 계산
 */
function getEditDistance(s1: string, s2: string): number {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

/**
 * 음성 vs 원고 비교 메인 함수
 */
export function compareSpeeechWithScript(
  spokenText: string,
  scriptText: string,
  lastMatchedIndex: number = 0
): {
  currentMatchedIndex: number;
  isCorrect: boolean;
  skippedParts: string[];
  mismatchedWords: Array<{
    expected: string;
    spoken: string;
    position: number;
  }>;
} {
  if (!spokenText || !scriptText) {
    return {
      currentMatchedIndex: lastMatchedIndex,
      isCorrect: true,
      skippedParts: [],
      mismatchedWords: [],
    };
  }

  const spokenWords = spokenText.split(/\s+/).filter(w => w.length > 0);
  const scriptWords = scriptText.split(/\s+/).filter(w => w.length > 0);

  let matchedIndex = lastMatchedIndex;
  const skippedParts: string[] = [];
  const mismatchedWords: Array<{
    expected: string;
    spoken: string;
    position: number;
  }> = [];

  // 현재 위치부터 시작해서 스포큰 단어들과 매칭
  for (const spokenWord of spokenWords) {
    let found = false;

    // 현재 위치부터 다음 20개 단어 범위에서 매칭 시도
    for (let i = matchedIndex; i < Math.min(matchedIndex + 20, scriptWords.length); i++) {
      const scriptWord = scriptWords[i];
      const similarity = calculateSimilarity(spokenWord, scriptWord);

      // 유사도 80% 이상이면 매칭으로 간주
      if (similarity >= 0.8) {
        // 건너뛴 부분 기록
        if (i > matchedIndex) {
          const skipped = scriptWords.slice(matchedIndex, i).join(' ');
          skippedParts.push(skipped);
        }

        matchedIndex = i + 1;
        found = true;
        break;
      }
    }

    // 매칭을 찾지 못했으면 현재 스포큰 단어가 mismatch
    if (!found && matchedIndex < scriptWords.length) {
      mismatchedWords.push({
        expected: scriptWords[matchedIndex],
        spoken: spokenWord,
        position: matchedIndex,
      });
    }
  }

  const isCorrect = mismatchedWords.length === 0 && skippedParts.length === 0;

  return {
    currentMatchedIndex: matchedIndex,
    isCorrect,
    skippedParts,
    mismatchedWords,
  };
}