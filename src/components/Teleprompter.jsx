// src/components/Teleprompter.jsx
import React from "react";

export default function Teleprompter({
  script, setScript,
  before, now, after,
  progressPct,
  partial, finals,
  onStart, onStop, onReset,
  sttSupported, sttRunning,
}) {
  return (
    <>
      <div className="area">
        <textarea
          value={script}
          onChange={(e) => { setScript(e.target.value); onReset(); }}
          placeholder="여기에 발표 원고를 붙여넣으세요."
        />
        <div className="hint">원고를 바꾸면 포인터와 기록이 리셋됩니다.</div>
      </div>

      <div className="row">
        <button type="button" className="btn" onClick={onStart} disabled={!sttSupported || sttRunning}>🎤 STT 시작</button>
        <button type="button" className="btn" onClick={onStop}  disabled={!sttRunning}>⏹ 정지</button>
        <button type="button" className="btn" onClick={onReset}>🔁 리셋</button>
      </div>

      <div className="progress"><div className="bar" style={{ width: `${progressPct}%` }} /></div>

      <div className="prompt">
        <span className="before">{before}</span>
        <span className="now">{now || "여기부터 읽습니다…"}</span>
        <span className="after">{after}</span>
      </div>

      <h3>partial</h3>
      <div className="area" aria-live="polite">{partial || "실시간 partial 텍스트"}</div>

      <h3>final</h3>
      <ul>{finals.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </>
  );
}
