import { Mic, Wifi, Clock, ChevronDown, User } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface AppBarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentProject: string;
  micStatus: "active" | "muted" | "off";
  networkStatus: "excellent" | "good" | "poor";
  timer: string;
}

export function AppBar({
  currentTab,
  onTabChange,
  currentProject,
  micStatus,
  networkStatus,
  timer,
}: AppBarProps) {
  const tabs = [
    { id: "dashboard", label: "대시보드" },
    { id: "preparation", label: "준비" },
    { id: "live", label: "라이브" },
    { id: "report", label: "리포트" },
    { id: "qna", label: "Q&A" },
    { id: "settings", label: "설정" },
  ];

  const getMicColor = () => {
    switch (micStatus) {
      case "active":
        return "text-green-500";
      case "muted":
        return "text-yellow-500";
      default:
        return "text-gray-400";
    }
  };

  const getNetworkColor = () => {
    switch (networkStatus) {
      case "excellent":
        return "text-green-500";
      case "good":
        return "text-yellow-500";
      default:
        return "text-red-500";
    }
  };

  return (
    <header className="h-14 border-b bg-background px-6 flex items-center justify-between gap-4">
      {/* Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#0064FF] flex items-center justify-center">
          <span className="text-white">P</span>
        </div>
      </div>

      {/* Project Dropdown */}
      <div className="shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 hover:text-[#000000] dark:hover:text-[#ffffff] transition-colors">
              <span className="whitespace-nowrap">{currentProject}</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>2025 신제품 발표</DropdownMenuItem>
            <DropdownMenuItem>Q4 실적 보고</DropdownMenuItem>
            <DropdownMenuItem>기술 컨퍼런스</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Global Tabs - horizontal scroll */}
      <nav className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentTab === tab.id
                ? "bg-[#0064FF] text-white"
                : "hover:bg-gray-100 dark:hover:text-[#000000]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Status Indicators - fixed width */}
      <div className="flex items-center gap-4 shrink-0" style={{ width: "180px" }}>
        <div className="flex items-center gap-2">
          <Mic className={`w-4 h-4 ${getMicColor()}`} />
        </div>
        <div className="flex items-center gap-2">
          <Wifi className={`w-4 h-4 ${getNetworkColor()}`} />
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="whitespace-nowrap">{timer}</span>
        </div>
      </div>

      {/* User Menu */}
      <div className="shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full dark:hover:text-[#000000]">
              <User className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>프로필</DropdownMenuItem>
            <DropdownMenuItem>환경설정</DropdownMenuItem>
            <DropdownMenuItem>로그아웃</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
