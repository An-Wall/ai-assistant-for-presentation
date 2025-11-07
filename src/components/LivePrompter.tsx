import React, { useState, useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

// 헬퍼 함수: 단어를 비교하기 좋게 정규화
const normalize = (word: string) => {
  return word.toLowerCase().replace(/[.,!?;:]/g, '');
};

// 대본 단어의 타입 정의
interface Word {
  id: string;
  text: string;
}

export function LivePrompter() {
  const { transcript, isListening, startListening, stopListening } = useSpeechRecognition();
  
  // 대본 state를 빈 배열로 시작
  const [scriptWords, setScriptWords] = useState<Word[]>([]);
  const [spokenWordIndex, setSpokenWordIndex] = useState(-1);

  // 파일 업로드 처리 함수
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // TypeScript의 optional chaining
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const text = e.target?.result as string; // 타입 단언
        if (text) {
          const loadedScriptWords = text.split(' ')
                                      .filter(word => word.length > 0)
                                      .map((word, index) => ({
                                        id: `w-${index}`,
                                        text: word,
                                      }));
          setScriptWords(loadedScriptWords);
          setSpokenWordIndex(-1);
        }
      };
      reader.readAsText(file);
    } else {
      alert("올바른 .txt 파일을 업로드해주세요.");
    }
  };
  
  // 매칭 알고리즘 (useEffect)
  useEffect(() => {
    if (!transcript || scriptWords.length === 0) return;

    const spokenWords = transcript.split(' ');
    let currentMatchIndex = 0;

    while (
      currentMatchIndex < spokenWords.length &&
      currentMatchIndex < scriptWords.length
    ) {
      const spokenWord = normalize(spokenWords[currentMatchIndex]);
      const scriptWord = normalize(scriptWords[currentMatchIndex].text);

      if (spokenWord === scriptWord) {
        currentMatchIndex++;
      } else {
        break;
      }
    }
    setSpokenWordIndex(currentMatchIndex - 1);
  }, [transcript, scriptWords]);

  // 시작/중지 버튼 토글
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      if (scriptWords.length === 0) {
        alert("먼저 대본 .txt 파일을 업로드해주세요.");
        return;
      }
      setSpokenWordIndex(-1);
      startListening();
    }
  };

  // 렌더링 (JSX)
  return (
    <div className="prompter-container">
      <h2>실시간 발표 프롬프터</h2>
      
      <div className="controls">
        <input 
          type="file" 
          accept=".txt" 
          onChange={handleFileUpload} 
        />
        <button onClick={toggleListening} disabled={scriptWords.length === 0}>
          {isListening ? '인식 중지' : '인식 시작'}
        </button>
      </div>

      <div className="script-box">
        {scriptWords.length > 0 ? (
          scriptWords.map((word, index) => (
            <span
              key={word.id}
              className={`word ${index <= spokenWordIndex ? 'spoken' : ''}`}
            >
              {word.text}{' '}
            </span>
          ))
        ) : (
          <p style={{ color: '#999' }}>.txt 대본 파일을 업로드해주세요.</p>
        )}
      </div>
      
      <p className="debug-transcript">
        [인식된 텍스트] {transcript}
      </p>

      {/* App.tsx가 아닌 여기에 스타일을 직접 넣거나
        LivePrompter.css 파일을 따로 만들어도 좋습니다.
      */}
      <style>{`
        .prompter-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        .controls {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .debug-transcript {
          font-size: 0.9rem;
          color: #888;
          height: 20px;
        }
      `}</style>
    </div>
  );
}