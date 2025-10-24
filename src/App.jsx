// src/App.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import Teleprompter from "./components/Teleprompter";
import useSpeechRecognition from "./hooks/useSpeechRecognition";
import {
  tokenizeWithMap, toLowerTokens,
  buildNGramIndex, advancePointer,
  HARD_MAX, TIMEOUT_MS, PUNCT_RE,
} from "./lib/match";

export default function App() {
  const [script, setScript] = useState(
`먼저 개정 배경에 대해서 알아보도록 하겠습니다.

한국 증시는 오래전부터 ‘코리아 디스카운트’라는 고질적인 문제를 겪어왔습니다.

코리아 디스카운트란 기업의 재무지표에 비해 주가가 실제보다 낮게 평가되는 현상을 말하는데요. 그 이유는 단순히 경기 변동과 같은 일시적인 요인이 아니라, 불투명한 지배구조, 낮은 주주 환원율, 대주주 중심의 의사결정 구조 때문이었습니다.

이런 구조 속에서 투자자들은 기업을 신뢰하기 어려웠고 결국 그 불신이 주가 저평가로 이어진 겁니다. 

그래서 정부와 국회는 기업 경영의 투명성을 높이고, 소액주주 권리를 강화하는 방향으로 상법 개정을 추진하게 되었습니다.

오른쪽 타임라인을 보시면, 7월 초에 1차 상법 개정안이, 이어서 노란봉투법이, 그리고 8월 말에는 2차 상법 개정안까지 연이어 국회를 통과했습니다. 굉장히 빠른 속도로 변화가 진행되고 있다는 걸 확인할 수 있습니다.`
  );

  const [partial, setPartial] = useState("");
  const [finals, setFinals] = useState([]);

  // 포인터/렌더 트리거
  const curTokRef = useRef(0);
  const lastAdvanceAtRef = useRef(Date.now());
  const lastReasonRef = useRef("-");
  const [ptrTick, setPtrTick] = useState(0);

  const stt = useSpeechRecognition({
    lang: "ko-KR",
    onPartial: (t) => setPartial(t),
    onFinal:   (t) => { setFinals((p) => [...p, t]); setPartial(""); },
    onState:   () => {},
  });

  // 언마운트 안전 종료
  useEffect(() => stt.cleanup, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 원고 토큰화(+ 소문자, 문장 끝 표시) — 문장부호는 삭제 기준으로 인덱스 구성
  const { rawTokens, rawMap, lowerTokens, isEndToken } = useMemo(() => {
    const raw = tokenizeWithMap(script);
    const lower = raw.tokens.map(w =>
      w.toLowerCase().normalize("NFKC").replace(PUNCT_RE, "").trim()
    );
    const isEnd = raw.tokens.map(t => /[.!?…]$/.test(t));
    return { rawTokens: raw.tokens, rawMap: raw.map, lowerTokens: lower, isEndToken: isEnd };
  }, [script]);

  const ngramIndex = useMemo(() => buildNGramIndex(lowerTokens, 3, 6), [lowerTokens]);

  // finals + partial 결합 tail
  const spokenTail = useMemo(() => {
    const joined = (finals.join(" ") + " " + partial).trim();
    const toks = toLowerTokens(joined);
    return toks.slice(Math.max(0, toks.length - 40));
  }, [finals, partial]);

  // 메인 전진 루프
  useEffect(() => {
    const prev = curTokRef.current;
    const next = advancePointer({
      ngramIndex, lowerTokens, isEndToken,
      curTok: prev, spokenTail,
      strongMin: 3, strongMax: 6,
      debugCb: (reason) => { lastReasonRef.current = reason; },
    });
    if (next !== prev) {
      curTokRef.current = next;
      lastAdvanceAtRef.current = Date.now();
      setPtrTick(t => t + 1); // 포인터 변경 알림
    }
  }, [spokenTail, ngramIndex, lowerTokens, isEndToken]);

  // 자동 슬라이드(전진 없고 partial 흐르면)
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      if (partial && now - lastAdvanceAtRef.current > TIMEOUT_MS) {
        const prev = curTokRef.current;
        if (prev < lowerTokens.length) {
          curTokRef.current = prev + 1;
          lastAdvanceAtRef.current = now;
          lastReasonRef.current = "timeout slide";
          setPtrTick(t => t + 1);
        }
      }
    }, 250);
    return () => clearInterval(id);
  }, [partial, lowerTokens.length]);

  // 하이라이트 계산(포인터 바뀔 때마다 재계산)
  const { before, now, after, progressPct } = useMemo(() => {
    const curTok = curTokRef.current;
    const CAP = 10;
    let endTok = curTok;
    for (let i = curTok; i < rawTokens.length && i < curTok + CAP; i++) {
      endTok = i + 1;
      if (isEndToken[i]) break;
      if (endTok - curTok >= HARD_MAX) break;
    }
    const startIdx = curTok < rawMap.length ? rawMap[curTok].start : script.length;
    const endIdx = endTok > 0 ? rawMap[endTok - 1].end : 0;

    return {
      before: script.slice(0, startIdx),
      now: script.slice(startIdx, endIdx),
      after: script.slice(endIdx),
      progressPct: Math.round((curTok / Math.max(1, rawTokens.length)) * 100),
    };
  }, [rawMap, rawTokens.length, script, isEndToken, ptrTick]); // ptrTick 포함!

  const reset = () => {
    setFinals([]); setPartial("");
    curTokRef.current = 0;
    lastAdvanceAtRef.current = Date.now();
    lastReasonRef.current = "-";
    setPtrTick(t => t + 1);
  };

  return (
    <div className="wrap">
      <h1 className="title">실시간 텔레프롬프터</h1>
      <p className="sub">최대 5단어 하이라이트 · 안정 매칭 · 확실한 정지/재시작</p>

      <Teleprompter
        script={script}
        setScript={setScript}
        before={before}
        now={now}
        after={after}
        progressPct={progressPct}
        partial={partial}
        finals={finals}
        onStart={stt.start}
        onStop={stt.stop}
        onReset={reset}
        sttSupported={stt.supported}
        sttRunning={stt.isRunningRef.current}
      />
    </div>
  );
}
