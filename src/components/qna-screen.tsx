import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { MessageSquare, Check, X, Search, Sparkles } from "lucide-react";

interface QnaScreenProps {
  onShowToast: (type: "info" | "success" | "warning" | "error", message: string) => void;
}

interface Question {
  id: number;
  author: string;
  question: string;
  status: "pending" | "answered";
  timestamp: string;
  aiSuggestion: string | null;
}

export function QnaScreen({ onShowToast }: QnaScreenProps) {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      author: "김철수",
      question: "신제품의 출시 예정일은 언제인가요?",
      status: "pending",
      timestamp: "2분 전",
      aiSuggestion: null,
    },
    {
      id: 2,
      author: "이영희",
      question: "기존 제품과의 호환성은 어떻게 되나요?",
      status: "pending",
      timestamp: "5분 전",
      aiSuggestion: null,
    },
    {
      id: 3,
      author: "박민수",
      question: "가격대는 어느 정도 예상하시나요?",
      status: "pending",
      timestamp: "8분 전",
      aiSuggestion: null,
    },
    {
      id: 4,
      author: "정수현",
      question: "해외 시장 진출 계획이 있나요?",
      status: "pending",
      timestamp: "10분 전",
      aiSuggestion: null,
    },
  ]);

  const [filter, setFilter] = useState<"all" | "pending" | "answered">("all");

  const handleGenerateAI = (id: number) => {
    // AI 답변 생성 시뮬레이션
    const aiSuggestions: { [key: number]: string } = {
      1: "스크립트 분석 결과: 발표 자료에는 구체적인 출시일이 명시되지 않았습니다. 다만, 슬라이드 1 '인트로' 섹션에서 '2년간의 연구개발'이 언급되어 개발이 완료 단계임을 시사합니다. 추가 정보 제공을 권장합니다.",
      2: "스크립트 및 슬라이드 분석 결과: 기존 제품과의 호환성에 대한 직접적인 언급은 없습니다. 슬라이드 3 '핵심 기능' 섹션에서 '클라우드 동기화'가 언급되어 있어, 기존 시스템과의 연동 가능성을 강조할 수 있습니다.",
      4: "스크립트 분석 결과: 해외 시장 진출에 대한 명시적 언급은 발견되지 않았습니다. 슬라이드 2 '시장 분석' 섹션에서 '시장 현황'과 '고객 니즈'가 다루어졌으나, 국내 시장 중심으로 해석됩니다. 글로벌 전략 관련 추가 자료가 필요할 수 있습니다.",
    };

    setQuestions(
      questions.map((q) => 
        q.id === id 
          ? { ...q, aiSuggestion: aiSuggestions[id] || "AI 분석 중입니다..." } 
          : q
      )
    );
    onShowToast("success", "AI 답변이 생성되었습니다");
  };

  const handleAnswer = (id: number) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, status: "answered" as const } : q))
    );
    onShowToast("success", "질문에 답변했습니다");
  };

  const handleDismiss = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id));
    onShowToast("info", "질문을 숨겼습니다");
  };

  const filteredQuestions = questions.filter((q) =>
    filter === "all" ? true : q.status === filter
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Q&A 관리</h1>
        <p className="text-muted-foreground">
          청중의 질문을 실시간으로 관리하고 답변합니다
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>전체 질문</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-4xl">{questions.length}</span>
              <span className="text-muted-foreground mb-1">개</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>대기중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-4xl text-yellow-600">
                {questions.filter((q) => q.status === "pending").length}
              </span>
              <span className="text-muted-foreground mb-1">개</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>답변완료</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-4xl text-green-600">
                {questions.filter((q) => q.status === "answered").length}
              </span>
              <span className="text-muted-foreground mb-1">개</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>질문 목록</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  전체
                </Button>
                <Button
                  variant={filter === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("pending")}
                  className="hover:!bg-[#0064FF] hover:!border-transparent hover:!text-[#FFFFFF]"
                >
                  대기중
                </Button>
                <Button
                  variant={filter === "answered" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("answered")}
                  className="dark:hover:!bg-[#0064FF] dark:hover:!border-transparent dark:hover:!text-[#FFFFFF]"
                >
                  답변완료
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="질문 검색..." className="pl-10 w-64 dark:border-gray-600" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredQuestions.map((question) => (
              <div
                key={question.id}
                className="p-4 rounded-lg border bg-white/80 dark:bg-white/5"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <MessageSquare className="w-5 h-5 text-gray-400" />
                        <span>{question.author}</span>
                        <span className="text-muted-foreground">
                          {question.timestamp}
                        </span>
                        {question.status === "pending" ? (
                          <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                            대기중
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-600">
                            답변완료
                          </Badge>
                        )}
                      </div>
                      <p className="mb-3 ml-8">{question.question}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {question.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateAI(question.id)}
                            className="gap-2 dark:bg-white/30 hover:bg-accent hover:dark:bg-white/40 hover:text-foreground dark:hover:text-foreground"
                          >
                            <Sparkles className="w-4 h-4" />
                            AI 답변 생성
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAnswer(question.id)}
                            className="gap-2 dark:bg-white/30 hover:!bg-[#0064FF] hover:!text-[#FFFFFF] hover:!border-[#0064FF]"
                          >
                            <Check className="w-4 h-4" />
                            답변완료
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDismiss(question.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {question.aiSuggestion && (
                    <div className="ml-8 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-start gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <h4 className="text-blue-900 dark:text-blue-100">AI 생성 답변</h4>
                      </div>
                      <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                        {question.aiSuggestion}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
