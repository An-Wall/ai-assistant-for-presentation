import { LivePrompter } from './components/LivePrompter'
import './styles/globals.css'


import { useState, useEffect } from "react";
import { AppBar } from "./components/app-bar";
import {
  ToastContainer,
  Toast,
} from "./components/glass-toast";
import { DashboardScreen } from "./components/dashboard-screen";
import { PreparationScreen } from "./components/preparation-screen";
import { LivePrompterScreen } from "./components/live-prompter-screen";
import { QnaScreen } from "./components/qna-screen";
import { ReportScreen } from "./components/report-screen";
import { SettingsScreen } from "./components/settings-screen";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./components/ui/button";

export default function App() {
  const screens = [
    "dashboard",
    "preparation",
    "live",
    "qna",
    "report",
    "settings",
  ];
  const [currentScreen, setCurrentScreen] = //현재 화면이 뭔지 담고 있는 변수
    useState("dashboard");


  const [script, setScript] = useState(""); // 대본 텍스트 저장 변수


  const [currentProject, setCurrentProject] =
    useState("2025 신제품 발표");

  const [micStatus, setMicStatus] = useState< //마이크상태 저장 변수 ("active", "muted", "off" 중 하나)
    "active" | "muted" | "off"
  >("active");
  const [networkStatus, setNetworkStatus] = useState< //네트워크 상태 저장 변수 ("excellent", "good", "poor" 중 하나)
    "excellent" | "good" | "poor"
  >("excellent");
  const [timer, setTimer] = useState("00:00");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [theme, setTheme] = useState<"light" | "dark" | "auto">(
    () => {
      const saved = localStorage.getItem("theme");
      return (saved as "light" | "dark" | "auto") || "light";
    },
  );
    
  const [fontSize, setFontSize] = useState(32); // 기본 글자 크기
  const [scrollSpeed, setScrollSpeed] = useState(5);// 스크롤 속도
  const [isAutoSlide, setIsAutoSlide] = useState(false);// 자동 슬라이드 여부
  const [isHighlight, setIsHighlight] = useState(true);// 강조 표시 여부

  // Theme effect
  useEffect(() => {
    const applyTheme = (newTheme: "light" | "dark") => {
      const root = document.documentElement;
      if (newTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    if (theme === "auto") {
      const mediaQuery = window.matchMedia(
        "(prefers-color-scheme: dark)",
      );
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? "dark" : "light");
      };

      applyTheme(mediaQuery.matches ? "dark" : "light");
      mediaQuery.addEventListener("change", handleChange);

      return () =>
        mediaQuery.removeEventListener("change", handleChange);
    } else {
      applyTheme(theme);
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  // Timer simulation
  useEffect(() => {
    if (currentScreen === "live") {
      let seconds = 0;
      const interval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        setTimer(
          `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`,
        );
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimer("00:00");
    }
  }, [currentScreen]);

  const showToast = (
    type: "info" | "success" | "warning" | "error",
    message: string,
  ) => {
    const newToast: Toast = {
      id: Date.now().toString(),
      type,
      message,
      duration: 3000,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) =>
      prev.filter((toast) => toast.id !== id),
    );
  };

  const currentScreenIndex = screens.indexOf(currentScreen);
  const canGoPrevious = currentScreenIndex > 0;
  const canGoNext = currentScreenIndex < screens.length - 1;

  const goToPreviousScreen = () => {
    if (canGoPrevious) {
      setCurrentScreen(screens[currentScreenIndex - 1]);
    }
  };

  const goToNextScreen = () => {
    if (canGoNext) {
      setCurrentScreen(screens[currentScreenIndex + 1]);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return (
          <DashboardScreen onNavigate={setCurrentScreen} />
        );
      case "preparation":
        return (
          <PreparationScreen
            onNavigate={setCurrentScreen}
            onShowToast={showToast}
            onScriptUpload={setScript} 

            fontSize={fontSize}
            scrollSpeed={scrollSpeed}
            isAutoSlide={isAutoSlide}
            isHighlight={isHighlight}

            onFontSizeChange={setFontSize}
            onScrollSpeedChange={setScrollSpeed}
            onIsAutoSlideChange={setIsAutoSlide}
            onIsHighlightChange={setIsHighlight}
          />
        );
      case "live":
        return <LivePrompterScreen 
                  onShowToast={showToast} 
                  script={script}
                  // [추가] 설정 값을 props로 전달
                  fontSize={fontSize}
                  scrollSpeed={scrollSpeed}
                  onFontSizeChange={setFontSize}
               />;
      case "qna":
        return <QnaScreen onShowToast={showToast} />;
      case "report":
        return <ReportScreen onShowToast={showToast} />;
      case "settings":
        return (
          <SettingsScreen
            onShowToast={showToast}
            theme={theme}
            onThemeChange={setTheme}
            // [추가] 현재 설정 값들을 props로 전달
            fontSize={fontSize}
            scrollSpeed={scrollSpeed}
            isAutoSlide={isAutoSlide}
            isHighlight={isHighlight}
            // [추가] 설정 상태를 변경하는 함수(리모컨)들을 props로 전달
            onFontSizeChange={setFontSize}
            onScrollSpeedChange={setScrollSpeed}
            onIsAutoSlideChange={setIsAutoSlide}
            onIsHighlightChange={setIsHighlight}
          />
        );
      default:
        return (
          <DashboardScreen onNavigate={setCurrentScreen} />
        );
    }
  };

  return (

    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Screen Navigation Section - Fixed */}
      <div className="h-12 border-b border-border bg-background flex items-center justify-between px-4 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPreviousScreen}
          disabled={!canGoPrevious}
          className="disabled:opacity-30 h-8 w-8"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextScreen}
          disabled={!canGoNext}
          className="disabled:opacity-30 h-8 w-8"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* App Bar - Fixed */}
      <div className="flex-shrink-0">
        <AppBar
          currentTab={currentScreen}
          onTabChange={setCurrentScreen}
          currentProject={currentProject}
          micStatus={micStatus}
          networkStatus={networkStatus}
          timer={timer}
        />
      </div>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-auto">
        {renderScreen()}
      </main>

      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
      />
    </div>
  );
}