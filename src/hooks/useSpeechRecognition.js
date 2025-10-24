// src/hooks/useSpeechRecognition.js
import { useRef } from "react";

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

/**
 * Web Speech API 래퍼
 * - start/stop 보장
 * - 실행 중일 때만 onend 재시작
 * - interim은 합쳐서 onPartial로, final은 각각 onFinal로
 */
export default function useSpeechRecognition({
  lang = "ko-KR",
  onPartial,
  onFinal,
  onState,
} = {}) {
  const recRef = useRef(null);
  const runningRef = useRef(false);
  const rafRef = useRef(null);
  const latestPartialRef = useRef("");

  const emitPartial = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      onPartial?.(latestPartialRef.current);
      rafRef.current = null;
    });
  };

  const start = () => {
    if (!SR) {
      alert("이 브라우저는 실시간 음성 인식을 지원하지 않습니다. (Chrome 권장)");
      return;
    }
    if (runningRef.current) return;

    const rec = new SR();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onstart = () => {
      runningRef.current = true;
      onState?.("running");
    };

    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const txt = r[0].transcript;
        if (r.isFinal) onFinal?.(txt);
        else interim += txt;
      }
      latestPartialRef.current = interim;
      emitPartial();
    };

    rec.onend = () => {
      if (runningRef.current) {
        try { rec.start(); } catch {}
      } else {
        onState?.("stopped");
      }
    };

    rec.onerror = (e) => {
      onState?.(`error:${e.error}`);
      console.warn("SpeechRecognition error:", e.error);
    };

    rec.start();
    recRef.current = rec;
  };

  const stop = () => {
    runningRef.current = false;
    try { recRef.current?.stop(); } catch {}
    recRef.current = null;
    onState?.("stopped");
  };

  /** 컴포넌트 언마운트 시 안전 종료용 */
  const cleanup = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    stop();
  };

  return { start, stop, cleanup, supported: !!SR, isRunningRef: runningRef };
}
