import { useState, useEffect, useRef } from 'react';

// 1. 'SpeechRecognition'이라는 이름의 *변수*를 
//    'SpeechRecognitionAPI'로 변경하여 *타입*과의 충돌을 피합니다.
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

// 2. API가 없는 브라우저에 대한 방어 코드
if (!SpeechRecognitionAPI) {
  alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
  // 혹은 에러를 throw 하거나, 빈 훅 기능을 반환할 수 있습니다.
}

// 3. 'SpeechRecognition'은 이제 전역 '타입'으로만 사용됩니다.
//    인스턴스는 'SpeechRecognitionAPI' 변수로 생성합니다.
const recognition: any = new SpeechRecognitionAPI();

// 4. API 설정
recognition.lang = 'ko-KR';
recognition.interimResults = true;
recognition.continuous = true;

export const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  // 5. 여기서 <SpeechRecognition>은 '타입'을 의미하며, 이제 오류가 없습니다.
  const recognitionRef = useRef<any>(recognition);

  useEffect(() => {
    const rec = recognitionRef.current;

    // 6. 이벤트 타입도 전역 타입을 사용합니다.
    rec.onresult = (event: any) => {
      let fullTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        fullTranscript += event.results[i][0].transcript;
      }
      setTranscript(fullTranscript);
    };

    rec.onend = () => {
      if (isListening) {
        rec.start();
      }
    };
    
    // 7. 에러 이벤트 타입도 전역 타입을 사용합니다.
    rec.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };

    return () => {
      rec.stop();
    };
  }, [isListening]);

  const startListening = () => {
    setTranscript('');
    setIsListening(true);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    setIsListening(false);
    recognitionRef.current.stop();
  };

  return {
    transcript,
    isListening,
    startListening,
    stopListening
  };
};