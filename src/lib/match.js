// src/lib/match.js

/* ===== 상수 ===== */
export const PUNCT_RE = /[.,!?…'"“”‘’()[\]{}:;·/\\-]+/g;
export const HARD_MAX = 5;     // 한 번에 하이라이트할 최대 단어 수
export const TIMEOUT_MS = 900; // 매칭 안 되면 자동 한 칸 밀기 시간

/* ===== 유틸 ===== */
export function normalize(s = "") {
  return String(s)
    .toLowerCase()
    .normalize("NFKC")
    .replace(PUNCT_RE, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeWithMap(str = "") {
  const tokens = [];
  const map = [];
  const re = /[^\s]+/g;
  let m;
  while ((m = re.exec(str)) !== null) {
    tokens.push(m[0]);
    map.push({ start: m.index, end: m.index + m[0].length });
  }
  return { tokens, map };
}

export function toLowerTokens(str = "") {
  const n = normalize(str);
  return n ? n.split(" ") : [];
}

/* ===== n-그램 인덱스 ===== */
export function buildNGramIndex(tokens, nMin = 3, nMax = 6) {
  const indexByLen = new Array(nMax + 1);
  for (let n = nMin; n <= nMax; n++) indexByLen[n] = new Map();

  const cache = new Array(tokens.length);
  for (let i = 0; i < tokens.length; i++) {
    let acc = tokens[i];
    cache[i] = [acc];
    for (let k = 1; k < nMax; k++) {
      const j = i + k;
      if (j >= tokens.length) break;
      acc = acc + " " + tokens[j];
      cache[i][k] = acc;
    }
  }

  for (let n = 3; n <= nMax; n++) {
    const table = indexByLen[n];
    const off = n - 1;
    for (let i = 0; i + n <= tokens.length; i++) {
      const key = cache[i][off];
      let arr = table.get(key);
      if (!arr) { arr = []; table.set(key, arr); }
      arr.push(i);
    }
  }
  return indexByLen;
}

export function lowerBound(arr, x) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < x) lo = mid + 1; else hi = mid;
  }
  return lo;
}

/* ===== 문자 유사도 (Q-gram Jaccard; 공백 흔들림 보정) ===== */
function qgrams(str, q = 2) {
  const s = str.replace(/\s+/g, ""); // 공백 제거 후 비교
  const out = new Set();
  for (let i = 0; i + q <= s.length; i++) out.add(s.slice(i, i + q));
  return out;
}
function jaccard(aSet, bSet) {
  let inter = 0;
  for (const x of aSet) if (bSet.has(x)) inter++;
  const union = aSet.size + bSet.size - inter || 1;
  return inter / union;
}

/* ===== 포인터 전진 ===== */
export function advancePointer({
  ngramIndex, lowerTokens, isEndToken,
  curTok, spokenTail,
  strongMin = 3, strongMax = 6,
  debugCb,
}) {
  if (!spokenTail.length) return curTok;
  const len = spokenTail.length;

  // 1) 강매칭 6→3
  for (let n = Math.min(strongMax, len); n >= strongMin; n--) {
    const key = spokenTail.slice(len - n).join(" ");
    const table = ngramIndex[n];
    const arr = table && table.get(key);
    if (arr && arr.length) {
      const i = lowerBound(arr, curTok);
      if (i < arr.length) {
        const start = arr[i];
        const next = start + n;
        if (next > curTok) { debugCb?.(`strong ${n}-gram`); return next; }
      }
    }
  }

  // 2) 약매칭 2-그램, 1-그램 (근처 탐색)
  const tail2 = spokenTail.slice(-2).join(" ");
  if (tail2) {
    for (let p = curTok; p + 2 <= lowerTokens.length && p < curTok + 10; p++) {
      if (lowerTokens[p] + " " + lowerTokens[p + 1] === tail2) { debugCb?.("weak 2-gram"); return p + 2; }
    }
  }
  const lastWord = spokenTail[spokenTail.length - 1];
  if (lastWord) {
    for (let p = curTok; p < lowerTokens.length && p < curTok + 6; p++) {
      if (lowerTokens[p] === lastWord) { debugCb?.("weak 1-gram"); return p + 1; }
    }
  }

  // 3) 문자 유사도: tail vs 다음 2~4단어
  const tailStr = spokenTail.slice(-12).join(" ");
  const tailSet = qgrams(tailStr, 2);
  for (let w = 4; w >= 2; w--) {
    const end = Math.min(curTok + w, lowerTokens.length);
    const cand = lowerTokens.slice(curTok, end).join(" ");
    if (!cand) continue;
    const score = jaccard(tailSet, qgrams(cand, 2));
    const thr = w === 4 ? 0.55 : w === 3 ? 0.60 : 0.65;
    if (score >= thr) { debugCb?.(`similarity w=${w} (${score.toFixed(2)})`); return end; }
  }

  // 4) 문장부호 직후 한 칸 슬라이드
  if (curTok > 0 && isEndToken[curTok - 1]) { debugCb?.("punct slide"); return Math.min(curTok + 1, lowerTokens.length); }

  debugCb?.("hold");
  return curTok;
}
