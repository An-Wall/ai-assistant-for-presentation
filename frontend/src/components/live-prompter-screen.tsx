import { useState, useEffect,useRef, useCallback} from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Mic } from "lucide-react";
import { useApiClient } from "../hooks/useApiClient";
import {
  Play,
  Pause,
  Square,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  Monitor,
  Check,
  Timer,
  Volume2,
  VolumeX,
  Volume1,
  MessageSquare,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { ImageWithFallback } from "./figma/ImageWithFallback";


interface CustomSpeechRecognition extends SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
}
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface LivePrompterScreenProps {
  onShowToast: (type: "info" | "success" | "warning" | "error", message: string) => void;
  script: string;
  fontSize: number;
  scrollSpeed: number;
  onFontSizeChange: (value: number) => void; // 글자 크기를 변경하는 함수를 받음
}



const defaultScriptParagraphs = [
  {
    id: 1,
    text: "안녕하십니까 여러분. 오늘 이 자리에서 우리의 혁신적인 신제품을 소개하게 되어 매우 기쁩니다. 이 제품은 지난 2년간의 연구개발 끝에 탄생했으며, 업계의 패러다임을 완전히 바꿀 것입니다.",
    slideNumber: 1,
    recommendedTime: 15, // seconds
  },
  {
    id: 2,
    text: "먼저 시장 현황을 살펴보겠습니다. 현재 시장은 급격한 변화를 겪고 있으며, 고객들의 니즈 또한 다양해지고 있습니다. 우리 제품은 바로 이러한 변화에 대응하기 위해 설계되었습니다.",
    slideNumber: 2,
    recommendedTime: 12,
  },
  {
    id: 3,
    text: "핵심 기능을 소개하겠습니다. 첫째, 인공지능 기반 자동화로 생산성이 3배 향상됩니다. 둘째, 직관적인 인터페이스로 누구나 쉽게 사용할 수 있습니다. 셋째, 클라우드 동기화로 언제 어디서나 작업이 가능합니다.",
    slideNumber: 3,
    recommendedTime: 18,
  },
];

export function LivePrompterScreen({ 
  onShowToast, 
  script, 
  fontSize, 
  scrollSpeed, 
  onFontSizeChange 
}: LivePrompterScreenProps)  {
  const { compareSpeech, isLoading: apiLoading } = useApiClient();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isInverted, setIsInverted] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  
  // Real-time dashboard metrics
  const [timeDelta, setTimeDelta] = useState(0); // in seconds, + means ahead, - means behind
  const [volumeHistory, setVolumeHistory] = useState<number[]>(Array(100).fill(75)); // 10 seconds at 10fps = 100 samples
  const [avgVolume, setAvgVolume] = useState(75);
  const [isVolumeSpiking, setIsVolumeSpiking] = useState(false);
  const [pronunciationHistory, setPronunciationHistory] = useState<number[]>(Array(30).fill(92));
  const [currentSentencePronunciation, setCurrentSentencePronunciation] = useState(92);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const recognitionRef = useRef<CustomSpeechRecognition | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const isStoppingRef = useRef(false);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const [scriptParagraphs, setScriptParagraphs] = useState(defaultScriptParagraphs);
  
  // Keywords state
  const [keywords, setKeywords] = useState([
    { id: 1, text: "신제품 비전", checked: false },
    { id: 2, text: "핵심 기능 소개", checked: true },
    { id: 3, text: "경쟁사 비교", checked: false },
    { id: 4, text: "가격 정책", checked: false },
  ]);
/*
  const scriptParagraphs = [
    {
      id: 1,
      text: "안녕하십니까 여러분. 오늘 이 자리에서 우리의 혁신적인 신제품을 소개하게 되어 매우 기쁩니다. 이 제품은 지난 2년간의 연구개발 끝에 탄생했으며, 업계의 패러다임을 완전히 바꿀 것입니다.",
      slideNumber: 1,
      recommendedTime: 15, // seconds
    },
    {
      id: 2,
      text: "먼저 시장 현황을 살펴보겠습니다. 현재 시장은 급격한 변화를 겪고 있으며, 고객들의 니즈 또한 다양해지고 있습니다. 우리 제품은 바로 이러한 변화에 대응하기 위해 설계되었습니다.",
      slideNumber: 2,
      recommendedTime: 12,
    },
    {
      id: 3,
      text: "핵심 기능을 소개하겠습니다. 첫째, 인공지능 기반 자동화로 생산성이 3배 향상됩니다. 둘째, 직관적인 인터페이스로 누구나 쉽게 사용할 수 있습니다. 셋째, 클라우드 동기화로 언제 어디서나 작업이 가능합니다.",
      slideNumber: 3,
      recommendedTime: 18,
    },
  ];
*/
  useEffect(() => {
    if (script) {
      const paragraphs = script.split('\n').filter(p => p.trim() !== '').map((p, index) => ({ id: index + 1, text: p.trim(), slideNumber: index + 1, recommendedTime: 15 }));
      if (paragraphs.length > 0) {
        setScriptParagraphs(paragraphs);
        setCurrentWordIndex(0);
      } else {
        setScriptParagraphs(defaultScriptParagraphs);
      }
    } else {
        setScriptParagraphs(defaultScriptParagraphs);
    }
  }, [script]);

  const allWords = scriptParagraphs.flatMap((p) => p.text.split(" "));

  // Speech Recognition 초기화 (한 번만 실행)
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      onShowToast("warning", "이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }

    const recognition = new SpeechRecognitionAPI() as CustomSpeechRecognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "ko-KR";

    recognition.onstart = () => {
      setIsRecognizing(true);
    };

    recognition.onend = () => {
      setIsRecognizing(false);
      // 중지 중이거나 isPlaying이 false면 재시작하지 않음
      if (!isStoppingRef.current && isPlayingRef.current) {
        try {
          recognition.start();
        } catch (err) {
          console.error("Restart error:", err);
        }
      }
      isStoppingRef.current = false;
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      // aborted는 정상적인 중지 시 발생하므로 에러 토스트 표시 안함
      if (event.error !== "aborted" && event.error !== "no-speech") {
        onShowToast("error", `음성 인식 오류: ${event.error}`);
      }
      // aborted 에러 시 인식 중지 플래그 설정
      if (event.error === "aborted") {
        isStoppingRef.current = true;
      }
      setIsRecognizing(false);
    };

    // [핵심] 음성 인식 결과 처리
    recognition.onresult = async (event) => {
      // 일시정지 상태에서는 이벤트 무시
      if (!isPlayingRef.current) return;
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      const transcript = (finalTranscript || interimTranscript).trim();
      if (transcript === "") return;

      // 전체 원고 텍스트 구성
      console.log("음성 인식 결과:", transcript);
      setLastTranscript(transcript);

      const fullScript = scriptParagraphs.map(p => p.text).join(" ");

      try {
        // 백엔드 API 호출
        const result = await compareSpeech(transcript, fullScript, currentWordIndex);
        if (result) {
          setCurrentWordIndex(result.currentMatchedIndex);
          // 토스트 메시지는 디버깅 시에만 필요하므로 제거
        }
      } catch (error) {
        console.error("API call error:", error);
      }
    };

    recognitionRef.current = recognition;

    // 컴포넌트 언마운트 시 음성 인식 정리
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onShowToast]); // 의존성 배열 최소화
/*
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentWordIndex((prev) => {
          if (prev >= allWords.length - 1) {
            setIsPlaying(false);
            onShowToast("success", "발표가 완료되었습니다");
            return prev;
          }
          return prev + 1;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isPlaying, allWords.length, onShowToast]);
*/

  const handlePlayPause = async () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      onShowToast("error", "음성 인식을 초기화할 수 없습니다.");
      return;
    }

    if (isPlaying) {
      // 일시정지: 먼저 플래그와 상태를 false로 설정
      isStoppingRef.current = true;
      setIsPlaying(false);
      // ref 업데이트 보장
      await new Promise(resolve => setTimeout(resolve, 50));
      try {
        recognition.stop();
      } catch (err) {
        console.error("Stop error:", err);
        isStoppingRef.current = false;
      }
      onShowToast("info", "일시정지되었습니다.");
    } else {
      // 재개/시작 - 마이크 권한 요청
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        isStoppingRef.current = false;
        setIsPlaying(true);
        // ref 업데이트 보장
        await new Promise(resolve => setTimeout(resolve, 50));
        // recognition이 이미 실행 중일 수 있으므로 try-catch로 감싸기
        try {
          recognition.start();
        } catch (err: any) {
          console.error("Start error:", err);
          // 이미 시작된 경우 무시
          if (err.message && !err.message.includes('already started')) {
            throw err;
          }
        }
        onShowToast("info", "음성 인식을 시작합니다.");
      } catch (err) {
        setIsPlaying(false);
        isStoppingRef.current = false;
        onShowToast("error", "마이크 접근 권한이 필요합니다.");
        console.error("Mic access error:", err);
      }
    }
  };

  const handleStop = async () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      onShowToast("error", "음성 인식을 초기화할 수 없습니다.");
      return;
    }

    // 중지: 음성 인식 중지하고 처음으로 돌아가기
    isStoppingRef.current = true;
    const wasPlaying = isPlaying;
    setIsPlaying(false);
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // 재생 중이었을 때만 recognition.stop() 호출
    if (wasPlaying) {
      try {
        recognition.stop();
      } catch (err) {
        console.error("Stop error:", err);
        isStoppingRef.current = false;
      }
    } else {
      // 이미 멈춰있는 경우 플래그만 초기화
      isStoppingRef.current = false;
    }
    
    setCurrentWordIndex(0);
    onShowToast("info", "발표가 중지되고 처음으로 돌아갔습니다.");
  };
  // Simulate real-time metrics changes
  useEffect(() => {
    if (isPlaying) {
      const metricsInterval = setInterval(() => {
        // Calculate time delta based on recommended time vs actual time
        const getCurrentParagraphData = () => {
          let wordCount = 0;
          for (const para of scriptParagraphs) {
            const paraWords = para.text.split(" ");
            if (currentWordIndex < wordCount + paraWords.length) {
              return { para, wordsInPara: currentWordIndex - wordCount, totalWords: paraWords.length };
            }
            wordCount += paraWords.length;
          }
          return { para: scriptParagraphs[scriptParagraphs.length - 1], wordsInPara: 0, totalWords: 0 };
        };

        const { para, wordsInPara, totalWords } = getCurrentParagraphData();
        const progressInPara = totalWords > 0 ? wordsInPara / totalWords : 0;
        const elapsedTime = progressInPara * para.recommendedTime;
        const remainingRecommendedTime = para.recommendedTime - elapsedTime;
        
        // Simulate actual remaining time with some variance
        setTimeDelta((prev) => {
          const variance = (Math.random() - 0.5) * 1;
          return Math.max(-10, Math.min(10, remainingRecommendedTime + variance - 5));
        });
        
        // Simulate volume with 10-second averaging
        setVolumeHistory((prev) => {
          const newVolume = 60 + Math.random() * 30;
          const updated = [...prev.slice(1), newVolume];
          
          // Calculate 10-second average (last 100 samples)
          const avg = updated.reduce((a, b) => a + b, 0) / updated.length;
          setAvgVolume(avg);
          
          // Detect sudden spike (more than 20 above average)
          if (newVolume > avg + 20) {
            setIsVolumeSpiking(true);
            setTimeout(() => setIsVolumeSpiking(false), 2000);
          }
          
          return updated;
        });
        
        // Update pronunciation only at sentence boundaries (ends with . ? !)
        const currentText = allWords.slice(0, currentWordIndex + 1).join(" ");
        const lastChar = currentText.trim().slice(-1);
        if (lastChar === "." || lastChar === "?" || lastChar === "!") {
          const newScore = 85 + Math.random() * 13;
          setCurrentSentencePronunciation(newScore);
          setPronunciationHistory((prev) => [...prev.slice(1), newScore]);
        }
      }, 100);
      
      return () => clearInterval(metricsInterval);
    }
  }, [isPlaying, currentWordIndex, scriptParagraphs]);

  const getCurrentParagraph = () => {
    let wordCount = 0;
    for (const para of scriptParagraphs) {
      const paraWords = para.text.split(" ");
      if (currentWordIndex < wordCount + paraWords.length) {
        return para;
      }
      wordCount += paraWords.length;
    }
    return scriptParagraphs[scriptParagraphs.length - 1];
  };

  const renderHighlightedText = (paragraph: typeof scriptParagraphs[0]) => {
    const text = paragraph.text;
    let globalWordIndex = 0;
    for (let i = 0; i < scriptParagraphs.indexOf(paragraph); i++) {
      globalWordIndex += scriptParagraphs[i].text.split(" ").length;
    }

    const phrases: { text: string; wordCount: number }[] = [];
    
    // 1차: 문장 부호(. ! ?)로 문장 구분
    const sentencePattern = /([^.!?]+[.!?])/g;
    const sentenceMatches = text.match(sentencePattern) || [text];
    
    sentenceMatches.forEach((sentence) => {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) return;
      
      // 문장 부호 분리
      const punctuationMatch = trimmedSentence.match(/([.!?]+)$/);
      const punctuation = punctuationMatch ? punctuationMatch[0] : "";
      const sentenceWithoutPunc = punctuation 
        ? trimmedSentence.slice(0, -punctuation.length).trim()
        : trimmedSentence;
      
      const words = sentenceWithoutPunc.split(/\s+/).filter(w => w.length > 0);
      if (words.length === 0) return;
      
      // 2차: 각 문장 내에서 조사 기준으로 구 분할
      // 수식구를 포함한 완전한 의미 단위로 묶음
      let currentPhrase: string[] = [];
      
      for (let j = 0; j < words.length; j++) {
        const word = words[j];
        currentPhrase.push(word);
        
        // 조사 패턴 체크 (쉼표 제거 후 체크)
        const wordWithoutComma = word.replace(/,$/g, "");
        let hasBoundary = false;
        
        // 다음 단어 확인 (보조용언 체크용)
        const nextWord = j + 1 < words.length ? words[j + 1] : "";
        const nextWordWithoutComma = nextWord.replace(/,$/g, "");
        
        // 보조용언 패턴: 있으며, 있습니다, 있고, 되어, 됩니다, 드립니다 등
        const isNextAuxiliaryVerb = /^(있으며|있습니다|있고|있는|되어|됩니다|되고|드립니다|드리고|주며|주고|줍니다)/.test(nextWordWithoutComma);
        
        // 2글자 이상 조사 (확실한 조사)
        if (/(은|는|을|를|에서|에게|으로|또한|조차|되어|하며)$/.test(wordWithoutComma) && wordWithoutComma.length >= 2) {
          hasBoundary = true;
        }
        // 1글자 조사 (단어가 2글자 이상일 때만 조사로 인정)
        // 단, "~고" 뒤에 보조용언이 오면 끊지 않음
        else if (/(이|가|에|로|도|만|며|고)$/.test(wordWithoutComma) && wordWithoutComma.length >= 2) {
          // "~고" 패턴이고 다음이 보조용언이면 끊지 않음
          if (/고$/.test(wordWithoutComma) && isNextAuxiliaryVerb) {
            hasBoundary = false;
          } else {
            hasBoundary = true;
          }
        }
        
        // '의'는 수식구 연결자 - 끊지 않음
        const hasModifier = /의$/.test(wordWithoutComma);
        
        // 조사로 끝나면 구 완성 (단, '의'는 제외)
        if (hasBoundary && !hasModifier) {
          const phraseText = currentPhrase.join(" ");
          phrases.push({
            text: phraseText,
            wordCount: currentPhrase.length
          });
          currentPhrase = [];
        }
      }
      
      // 남은 단어들 (서술어 등) - 문장의 마지막 구에 문장부호 추가
      if (currentPhrase.length > 0) {
        const phraseText = currentPhrase.join(" ") + punctuation;
        phrases.push({
          text: phraseText,
          wordCount: currentPhrase.length
        });
      }
    });

    let wordOffset = 0;
    
    return (
      <div className="leading-relaxed">
        {phrases.map((phrase, phraseIndex) => {
          const phraseStartIndex = wordOffset;
          const phraseEndIndex = wordOffset + phrase.wordCount - 1;
          const currentLocalIndex = currentWordIndex - globalWordIndex;
          
          const isHighlighted = currentLocalIndex >= phraseStartIndex && currentLocalIndex <= phraseEndIndex;
          const isPast = currentLocalIndex > phraseEndIndex;
          
          wordOffset += phrase.wordCount;
          
          return (
            <span
              key={phraseIndex}
              className={`transition-all duration-200 ${
                isHighlighted
                  ? "bg-[#0064FF] text-white px-1 rounded"
                  : isPast
                  ? "text-gray-400"
                  : ""
              }`}
            >
              {phrase.text}{" "}
            </span>
          );
        })}
      </div>
    );
  };

  const currentParagraph = getCurrentParagraph();
  const nextParagraphIndex = scriptParagraphs.indexOf(currentParagraph) + 1;
  const nextParagraph =
    nextParagraphIndex < scriptParagraphs.length
      ? scriptParagraphs[nextParagraphIndex]
      : null;

  // Toggle keyword checked state
  const toggleKeyword = (id: number) => {
    setKeywords(prev => 
      prev.map(keyword => 
        keyword.id === id ? { ...keyword, checked: !keyword.checked } : keyword
      )
    );
  };

  // Determine volume icon and color based on 10-second average
  const getVolumeIcon = () => {
    if (isVolumeSpiking) return VolumeX;
    if (avgVolume >= 65 && avgVolume <= 85) return Volume2;
    if (avgVolume > 85) return VolumeX;
    return Volume1;
  };

  const getVolumeColor = () => {
    if (isVolumeSpiking) return "text-red-600";
    if (avgVolume >= 65 && avgVolume <= 85) return "text-green-600";
    if (avgVolume > 85) return "text-yellow-600";
    return "text-yellow-600";
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <div className={`h-full flex flex-col ${isInverted ? "bg-black text-white" : ""}`}>
      {/* Status Bar - Fixed */}
      <div className={`h-14 border-b px-6 flex items-center justify-between flex-shrink-0 ${isInverted ? "border-gray-700" : ""}`}>
        <div className="flex items-center gap-4">
          <Badge variant={isPlaying ? "default" : "secondary"} className="bg-red-500">
            {isPlaying ? "● REC" : "■ READY"}
          </Badge>
          {isRecognizing && (
              <Badge variant="outline" className="flex items-center gap-2 border-blue-500 text-blue-500">
                  <Mic className="w-4 h-4 animate-pulse" />
                  음성 인식 활성화
              </Badge>
          )}
          <span>슬라이드 {currentParagraph.slideNumber} / {scriptParagraphs.length}</span>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <span className="text-muted-foreground">경과: </span>
            <span>
              {Math.floor((currentWordIndex / allWords.length) * 10)}:
              {String(Math.floor(((currentWordIndex / allWords.length) * 600) % 60)).padStart(2, "0")}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">잔여: </span>
            <span>
              {Math.floor(((allWords.length - currentWordIndex) / allWords.length) * 10)}:
              {String(Math.floor((((allWords.length - currentWordIndex) / allWords.length) * 600) % 60)).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 flex overflow-hidden">
        {/* Prompter - 66% */}
        <div className="flex-[2] flex flex-col overflow-hidden">
          {/* Script Area */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div
              className="max-w-[80ch] mx-auto"
              style={{ fontSize: `${fontSize}px`, fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
            >
              {/* Current Paragraph */}
              <div className="mb-12">
                {renderHighlightedText(currentParagraph)}
              </div>

              {/* Next Paragraph Preview */}
              {nextParagraph && (
                <div className="opacity-40 border-t pt-8">
                  <p className="text-muted-foreground mb-2">다음:</p>
                  <p>{nextParagraph.text}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side Panel - 34% */}
        <div className={`flex-1 border-l p-6 overflow-y-auto ${isInverted ? "border-gray-700" : ""}`}>
          {/* 1. Real-time Metrics */}
          <Card className="mb-6">
            <div className="p-4">
              <h4 className="mb-3">실시간 모니터링</h4>
              
              <div className="grid grid-cols-3 gap-2">
                {/* Time Delta - Based on recommended time remaining */}
                <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-white/10 rounded-lg border hover:dark:text-[#000000] transition-colors cursor-pointer">
                  <Timer className={`w-5 h-5 mb-1 ${
                    Math.abs(timeDelta) < 3 ? "text-green-600 dark:text-green-400" :
                    Math.abs(timeDelta) < 7 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"
                  }`} />
                  <span className={`text-sm ${
                    Math.abs(timeDelta) < 3 ? "text-green-600 dark:text-green-400" :
                    Math.abs(timeDelta) < 7 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"
                  }`}>
                    {timeDelta > 0 ? "+" : ""}{timeDelta.toFixed(1)}s
                  </span>
                </div>

                {/* Volume - 10 second average with spike detection */}
                <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-white/10 rounded-lg border hover:dark:text-[#000000] transition-colors cursor-pointer">
                  <VolumeIcon className={`w-5 h-5 mb-1 ${getVolumeColor()} dark:${getVolumeColor().replace('-600', '-400')}`} />
                  <span className={`text-sm ${getVolumeColor()} dark:${getVolumeColor().replace('-600', '-400')}`}>
                    {Math.round(avgVolume)}%
                  </span>
                </div>

                {/* Pronunciation - Sentence-based measurement */}
                <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-white/10 rounded-lg border hover:dark:text-[#000000] transition-colors cursor-pointer">
                  <MessageSquare className={`w-5 h-5 mb-1 ${
                    currentSentencePronunciation >= 90 ? "text-green-600 dark:text-green-400" :
                    currentSentencePronunciation >= 80 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"
                  }`} />
                  <span className={`text-sm ${
                    currentSentencePronunciation >= 90 ? "text-green-600 dark:text-green-400" :
                    currentSentencePronunciation >= 80 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"
                  }`}>
                    {Math.round(currentSentencePronunciation)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* 2. Progress */}
          <Card className="mb-6">
            <div className="p-4">
              <h4 className="mb-4">진행률</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">현재 섹션</span>
                  <span>{scriptParagraphs.indexOf(currentParagraph) + 1} / {scriptParagraphs.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#0064FF] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentWordIndex / allWords.length) * 100).toFixed(1)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{((currentWordIndex / allWords.length) * 100).toFixed(1)}%</span>
                  <span>{currentWordIndex} / {allWords.length} 단어</span>
                </div>
              </div>
            </div>
          </Card>

          {/* 3. Current & Next Slides */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Current Slide */}
            <Card>
              <div className="p-3">
                <p className="mb-2">현재</p>
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-2">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1608222351212-18fe0ec7b13b?w=400"
                    alt="Current slide"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <p className="text-center">
                  슬라이드 {currentParagraph.slideNumber}
                </p>
              </div>
            </Card>

            {/* Next Slide */}
            <Card className="opacity-60">
              <div className="p-3">
                <p className="mb-2">다음</p>
                <div className="aspect-video bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-white">슬라이드 {currentParagraph.slideNumber + 1}</span>
                </div>
                <p className="text-center">
                  슬라이드 {currentParagraph.slideNumber + 1}
                </p>
              </div>
            </Card>
          </div>

          {/* 4. Keywords Checklist */}
          <Card>
            <div className="p-4">
              <h4 className="mb-4">키워드 체크</h4>
              <div className="space-y-3">
                {keywords.map((keyword) => (
                  <div key={keyword.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`live-keyword-${keyword.id}`}
                      checked={keyword.checked}
                      onCheckedChange={() => toggleKeyword(keyword.id)}
                    />
                    <label
                      htmlFor={`live-keyword-${keyword.id}`}
                      className={`cursor-pointer ${keyword.checked ? "line-through text-muted-foreground" : ""}`}
                      onClick={() => toggleKeyword(keyword.id)}
                    >
                      {keyword.text}
                    </label>
                    {keyword.checked && <Check className="w-4 h-4 text-green-500" />}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Control Bar - Fixed */}
      <div className={`h-20 border-t px-6 flex items-center justify-between flex-shrink-0 ${isInverted ? "border-gray-700" : ""}`}>
        <div className="flex items-center gap-2">
          <Button
            size="lg"
            onClick={handlePlayPause}
            className="gap-2"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isPlaying ? "일시정지" : "시작"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleStop}
            className="gap-2"
            disabled={!isPlaying && currentWordIndex === 0}
          >
            <Square className="w-5 h-5 text-red-500" />
            중지
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWordIndex(Math.max(0, currentWordIndex - 10))}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWordIndex(Math.min(allWords.length - 1, currentWordIndex + 10))}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">속도</span>
            <input
              type="range"
              min="1"
              max="10"
              defaultValue={scrollSpeed}
              className="w-24 accent-[#0064FF]"
              style={{ border: 'none', outline: 'none' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onFontSizeChange(Math.max(16, fontSize - 4))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="w-12 text-center">{fontSize}px</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onFontSizeChange(Math.min(48, fontSize + 4))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsInverted(!isInverted)}
          >
            {isInverted ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="icon">
            <Monitor className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
