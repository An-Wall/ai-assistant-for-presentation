import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Upload, FileText, Check, AlertTriangle, Settings, ChevronRight, Turtle, Rabbit } from "lucide-react";
import { Progress } from "./ui/progress";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Textarea } from "./ui/textarea";

interface PreparationScreenProps {
  onNavigate: (screen: string) => void;
  onShowToast: (type: "info" | "success" | "warning" | "error", message: string) => void;
  onScriptUpload: (script: string) => void;

  fontSize: number;
  scrollSpeed: number;
  isAutoSlide: boolean;
  isHighlight: boolean;

  // App.tsx로부터 받을 설정 변경 함수들의 타입을 추가
  onFontSizeChange: (value: number) => void;
  onScrollSpeedChange: (value: number) => void;
  onIsAutoSlideChange: (value: boolean) => void;
  onIsHighlightChange: (value: boolean) => void;
}

// Slide-Script Alignment Component
function SlideScriptAlignment({ onShowToast }: { onShowToast: (type: "info" | "success" | "warning" | "error", message: string) => void }) {
  const [selectedSlide, setSelectedSlide] = useState(1);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedScript, setEditedScript] = useState("");
  const [isSlideSelectDialogOpen, setIsSlideSelectDialogOpen] = useState(false);
  const [tempSelectedSlideId, setTempSelectedSlideId] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState(32);

  const [slides, setSlides] = useState([
    {
      id: 1,
      title: "인트로",
      script: "안녕하십니까 여러분. 오늘 이 자리에서 우리의 혁신적인 신제품을 소개하게 되어 매우 기쁩니다. 이 제품은 지난 2년간의 연구개발 끝에 탄생했으며, 업계의 패러다임을 완전히 바꿀 것입니다.",
      status: "match" as const,
      matchRate: 95,
    },
    {
      id: 2,
      title: "시장 분석",
      script: "먼저 시장 현황을 살펴보겠습니다. 현재 시장은 급격한 변화를 겪고 있으며, 고객들의 니즈 또한 다양해지고 있습니다. 우리 제품은 바로 이러한 변화에 대응하기 위해 설계되었습니다.",
      status: "warning" as const,
      matchRate: 78,
      issues: ["스크립트에 언급된 '시장 점유율' 데이터가 슬라이드에 없습니다"],
    },
    {
      id: 3,
      title: "핵심 기능",
      script: "핵심 기능을 소개하겠습니다. 첫째, 인공지능 기반 자동화로 생산성이 3배 향상됩니다. 둘째, 직관적인 인터페이스로 누구나 쉽게 사용할 수 있습니다. 셋째, 클라우드 동기화로 언제 어디���나 작업이 가능합니다.",
      status: "match" as const,
      matchRate: 92,
    },
    {
      id: 4,
      title: "가격 정책",
      script: "이제 가격 정책에 대해 말씀드리겠습니다. 합리적인 가격으로 최고의 가치를 제공하고자 합니다.",
      status: "info" as const,
      matchRate: 85,
      issues: ["스크립트가 짧습니다. 추가 설명을 권장합니다"],
    },
    {
      id: 5,
      title: "마무리",
      script: "감사합니다. 질문이 있으시면 언제든지 말씀해 주세요.",
      status: "match" as const,
      matchRate: 90,
    },
  ]);

  const currentSlide = slides.find((s) => s.id === selectedSlide) || slides[0];

  const handleOpenEditDialog = () => {
    setEditedScript(currentSlide.script);
    setIsEditDialogOpen(true);
  };

  const handleSaveScript = () => {
    setIsEditDialogOpen(false);
    setTimeout(() => {
      onShowToast("success", "스크립트가 저장되었습니다");
    }, 0);
  };

  const handleOpenSlideSelectDialog = () => {
    setTempSelectedSlideId(currentSlide.id);
    setIsSlideSelectDialogOpen(true);
  };

  const handleConfirmSlideSelection = () => {
    if (tempSelectedSlideId !== null && tempSelectedSlideId !== currentSlide.id) {
      // 현재 슬라이드의 스크립트를 선택한 슬라이드에 복사
      setSlides(prevSlides => 
        prevSlides.map(slide => 
          slide.id === tempSelectedSlideId 
            ? { ...slide, script: currentSlide.script }
            : slide
        )
      );
      // 선택한 슬라이드로 이동
      setSelectedSlide(tempSelectedSlideId);
      setTimeout(() => {
        onShowToast("success", `슬라이드 ${tempSelectedSlideId}에 스크립트가 적용되었습니다`);
      }, 0);
    }
    setIsSlideSelectDialogOpen(false);
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left: Slide List */}
      <div className="col-span-3">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>슬라이드 목록</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="space-y-1 flex-1 overflow-y-auto">
              {slides.map((slide) => (
                <button
                  key={slide.id}
                  onClick={() => setSelectedSlide(slide.id)}
                  className={`w-full text-left p-4 border-b transition-colors ${
                    selectedSlide === slide.id
                      ? "bg-blue-50 dark:bg-gray-700 border-l-4 border-l-blue-500 dark:text-[#FFFFFF]"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={selectedSlide === slide.id ? "dark:text-[#FFFFFF]" : ""}>슬라이드 {slide.id}</span>
                    <Badge
                      variant={
                        slide.status === "match"
                          ? "default"
                          : slide.status === "warning"
                          ? "destructive"
                          : "secondary"
                      }
                      className={
                        slide.status === "match"
                          ? "bg-green-500 text-white"
                          : slide.status === "warning"
                          ? "bg-yellow-500 text-white"
                          : "bg-blue-500 text-white"
                      }
                    >
                      {slide.matchRate}%
                    </Badge>
                  </div>
                  <p className={`text-muted-foreground ${selectedSlide === slide.id ? "dark:text-[#FFFFFF]/70" : ""}`}>{slide.title}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Slide Preview & Script */}
      <div className="col-span-9 flex flex-col gap-6">
        {/* Slide Preview & Script - Side by Side */}
        <div className="grid grid-cols-10 gap-6">
          {/* Slide Preview - 40% */}
          <div className="col-span-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-sm">슬라이드 {currentSlide.id}</span>
                  <Badge
                    variant={
                      currentSlide.status === "match"
                        ? "default"
                        : currentSlide.status === "warning"
                        ? "destructive"
                        : "secondary"
                    }
                    className={
                      currentSlide.status === "match"
                        ? "bg-green-500"
                        : currentSlide.status === "warning"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    }
                  >
                    {currentSlide.status === "match" ? "정합" : currentSlide.status === "warning" ? "경고" : "확인"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1608222351212-18fe0ec7b13b?w=800"
                    alt={`Slide ${currentSlide.id}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm mb-1">{currentSlide.title}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">매칭률:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            currentSlide.matchRate >= 90
                              ? "bg-green-500"
                              : currentSlide.matchRate >= 80
                              ? "bg-blue-500"
                              : "bg-yellow-500"
                          }`}
                          style={{ width: `${currentSlide.matchRate}%` }}
                        />
                      </div>
                      <span className="text-sm">{currentSlide.matchRate}%</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full hover:bg-gray-200 dark:hover:bg-white/25 dark:hover:!text-[#FFFFFF]" onClick={handleOpenSlideSelectDialog}>
                    슬라이드 수정
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Script Content - 60% */}
          <div className="col-span-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>매칭된 스크립트</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-[calc(100%-80px)]">
                <div className="p-4 bg-[rgba(249,250,251,0.06)] rounded-lg mb-4 flex-1 overflow-y-auto">
                  <p className="leading-relaxed">{currentSlide.script}</p>
                </div>
                <Button variant="outline" size="sm" className="hover:bg-gray-200 dark:hover:bg-white/25 dark:hover:!text-[#FFFFFF]" onClick={handleOpenEditDialog}>
                  스크립트 편집
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Issues */}
        {currentSlide.issues && currentSlide.issues.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                발견된 문제
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentSlide.issues.map((issue, index) => (
                  <div
                    key={index}
                    className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="flex-1">{issue}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onShowToast("info", "자동 수정 기능은 개발 중입니다")}
                      >
                        자동 수정
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Keywords for this slide */}
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>이 슬라이드의 핵심 키워드</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex flex-wrap gap-3 text-sm">
              {currentSlide.id === 1 && (
                <>
                  <Badge variant="outline" className="px-4 py-1.5 border-2">신제품</Badge>
                  <Badge variant="outline" className="px-4 py-1.5 border-2">혁신</Badge>
                  <Badge variant="outline" className="px-4 py-1.5 border-2">패러다임</Badge>
                </>
              )}
              {currentSlide.id === 2 && (
                <>
                  <Badge variant="outline" className="px-4 py-1.5 border-2">시장 현황</Badge>
                  <Badge variant="outline" className="px-4 py-1.5 border-2">고객 니즈</Badge>
                  <Badge variant="outline" className="px-4 py-1.5 border-2 bg-yellow-100">시장 점유율 (누락)</Badge>
                </>
              )}
              {currentSlide.id === 3 && (
                <>
                  <Badge variant="outline" className="px-4 py-1.5 border-2">인공지능</Badge>
                  <Badge variant="outline" className="px-4 py-1.5 border-2">생산성</Badge>
                  <Badge variant="outline" className="px-4 py-1.5 border-2">클라우드</Badge>
                </>
              )}
              {currentSlide.id === 4 && (
                <>
                  <Badge variant="outline" className="px-4 py-1.5 border-2">가격</Badge>
                  <Badge variant="outline" className="px-4 py-1.5 border-2">가치</Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Script Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>스크립트 편집 - 슬라이드 {currentSlide.id}</DialogTitle>
            <DialogDescription>
              슬라이드에 매칭된 스크립트를 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">슬라이드 제목</label>
              <p className="p-3 bg-gray-50 dark:bg-white/10 rounded">{currentSlide.title}</p>
            </div>
            <div>
              <label className="block mb-2">스크립트</label>
              <Textarea
                value={editedScript}
                onChange={(e) => setEditedScript(e.target.value)}
                className="min-h-[200px]"
                placeholder="스크립트를 입력하세요..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveScript}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Slide Select Dialog */}
      <Dialog open={isSlideSelectDialogOpen} onOpenChange={setIsSlideSelectDialogOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>슬라이드 선택</DialogTitle>
            <DialogDescription>
              업로드된 슬라이드 중 하나를 선택하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-4">
            {slides.map((slide) => (
              <button
                key={slide.id}
                onClick={() => setTempSelectedSlideId(slide.id)}
                className={`relative p-4 border-2 rounded-lg transition-all ${
                  tempSelectedSlideId === slide.id
                    ? "border-[#0064FF] bg-blue-50 text-[#000000]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  <ImageWithFallback
                    src={`https://images.unsplash.com/photo-1608222351212-18fe0ec7b13b?w=400&h=225&fit=crop&auto=format&q=80&seed=${slide.id}`}
                    alt={`Slide ${slide.id}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <p>슬라이드 {slide.id}</p>
                  <p className="text-muted-foreground">{slide.title}</p>
                </div>
                {tempSelectedSlideId === slide.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-[#0064FF] rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSlideSelectDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleConfirmSlideSelection} disabled={tempSelectedSlideId === null}>
              선택 완료
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function PreparationScreen({ 
    onNavigate, 
    onShowToast, 
    onScriptUpload,
    fontSize,
    scrollSpeed,
    isAutoSlide,
    isHighlight,
    onFontSizeChange,
    onScrollSpeedChange,
    onIsAutoSlideChange,
    onIsHighlightChange
}: PreparationScreenProps){
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("upload");
  const scriptFileInputRef = useRef<HTMLInputElement>(null);
  const slideFileInputRef = useRef<HTMLInputElement>(null);
  const referenceFileInputRef = useRef<HTMLInputElement>(null);
  const [isScriptFileSelected, setIsScriptFileSelected] = useState(false);
  const [isReferenceFileSelected, setIsReferenceFileSelected] = useState(false);
  const [scriptUploadProgress, setScriptUploadProgress] = useState(85);
  const [referenceUploadProgress, setReferenceUploadProgress] = useState(92);

  const handleUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onShowToast("success", "파일 업로드가 완료되었습니다");
          }, 0);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleScriptFileClick = () => {
    scriptFileInputRef.current?.click();
  };

  const handleSlideFileClick = () => {
    slideFileInputRef.current?.click();
  };

  const handleScriptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TXT 파일인지 확인
      if (file.name.endsWith(".txt")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const fileContent = event.target?.result as string;
          onScriptUpload(fileContent); // 읽어온 내용을 App.tsx 상태로 전달
          setTimeout(() => {
            onShowToast("success", `${file.name} 스크립트가 업로드되었습니다.`);
          }, 0);
        };
        reader.readAsText(file, "UTF-8"); // 파일을 텍스트로 읽음
      } else {
        onShowToast("warning", "TXT 파일만 업로드할 수 있습니다.");
      }
      handleUpload(); // 업로드 진행률 UI 표시
    }
  };

  const handleSlideFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTimeout(() => {
        onShowToast("info", `슬라이드 파일 선택됨: ${file.name}`);
      }, 0);
    }
  };

  const handleReferenceFileClick = () => {
    referenceFileInputRef.current?.click();
  };

  const handleReferenceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTimeout(() => {
        onShowToast("info", `참고자료 파일 선택됨: ${file.name}`);
      }, 0);
      handleUpload();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">발표 준비</h1>
        <p className="text-muted-foreground">
          스크립트와 슬라이드를 업로드하고 정합성을 검증합니다
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8 dark:bg-gray-800">
          <TabsTrigger value="upload" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=inactive]:text-gray-400">자료 업로드</TabsTrigger>
          <TabsTrigger value="alignment" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=inactive]:text-gray-400">정합성 검증</TabsTrigger>
          <TabsTrigger value="settings" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=inactive]:text-gray-400">환경 설정</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  스크립트 업로드
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="mb-4">
                    PDF, DOCX, TXT 파일을 드래그하거나 클릭하여 업로드
                  </p>
                  <input
                    ref={scriptFileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleScriptFileChange}
                    className="hidden"
                  />
                  <Button onClick={handleScriptFileClick}>파일 선택</Button>
                </div>
                {uploadProgress > 0 && (
                  <div className="mt-4">
                    <Progress value={uploadProgress} />
                    <p className="mt-2 text-center text-muted-foreground">
                      {uploadProgress === 100 ? "업로드가 완료되었습니다" : `업로드 중... ${uploadProgress}%`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  슬라이드 업로드
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="mb-4">
                    PPTX, PDF 파일을 드래그하거나 클릭하여 업로드
                  </p>
                  <input
                    ref={slideFileInputRef}
                    type="file"
                    accept=".pptx,.pdf"
                    onChange={handleSlideFileChange}
                    className="hidden"
                  />
                  <Button onClick={handleSlideFileClick}>파일 선택</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  참고자료 업로드
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="mb-4">
                    PDF, DOCX, XLSX 파일을 드래그하거나 클릭하여 업로드
                  </p>
                  <input
                    ref={referenceFileInputRef}
                    type="file"
                    accept=".pdf,.docx,.xlsx"
                    onChange={handleReferenceFileChange}
                    className="hidden"
                  />
                  <Button onClick={handleReferenceFileClick}>파일 선택</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>업로드된 스크립트</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isScriptFileSelected && (
                    <div className="flex gap-2 mb-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setTimeout(() => {
                            onShowToast("info", "파일 수정 기능");
                          }, 0);
                          setIsScriptFileSelected(false);
                        }}
                      >
                        수정
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setTimeout(() => {
                            onShowToast("success", "파일이 삭제되었습니다");
                          }, 0);
                          setIsScriptFileSelected(false);
                        }}
                      >
                        삭제
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-3 border-2 border-dashed rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={isScriptFileSelected}
                        onCheckedChange={(checked) => setIsScriptFileSelected(checked === true)}
                      />
                      <div>
                        <p className="dark:text-foreground">2025_신제품발표_스크립트.docx</p>
                        <p className="text-muted-foreground">2.4 MB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={scriptUploadProgress} className="w-24" />
                      <span className="text-muted-foreground">{scriptUploadProgress}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>업로드된 조사 자료</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isReferenceFileSelected && (
                    <div className="flex gap-2 mb-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setTimeout(() => {
                            onShowToast("info", "파일 수정 기능");
                          }, 0);
                          setIsReferenceFileSelected(false);
                        }}
                      >
                        수정
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setTimeout(() => {
                            onShowToast("success", "파일이 삭제되었습니다");
                          }, 0);
                          setIsReferenceFileSelected(false);
                        }}
                      >
                        삭제
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-3 border-2 border-dashed rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={isReferenceFileSelected}
                        onCheckedChange={(checked) => setIsReferenceFileSelected(checked === true)}
                      />
                      <div>
                        <p className="dark:text-foreground">2025_시장조사_보고서.pdf</p>
                        <p className="text-muted-foreground">5.1 MB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={referenceUploadProgress} className="w-24" />
                      <span className="text-muted-foreground">{referenceUploadProgress}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => onNavigate("dashboard")}>
              취소
            </Button>
            <Button onClick={() => setActiveTab("alignment")}>
              다음: 정합성 검증
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="alignment" className="space-y-6">
          {/* Main Area: Slide-by-Slide Script Alignment */}
          <SlideScriptAlignment onShowToast={onShowToast} />

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setActiveTab("upload")}>
              이전
            </Button>
            <Button onClick={() => setActiveTab("settings")}>
              다음: 환경 설정
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                텔레프롬프터 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label>스크롤 속도</label>
                  <span className="text-muted-foreground">속도: {scrollSpeed}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Turtle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div className="w-full">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={scrollSpeed}
                      onChange={(e) => onScrollSpeedChange(Number(e.target.value))}
                      className="w-full accent-[#0064FF]"
                      style={{ border: 'none', outline: 'none' }}
                    />
                    <div className="flex justify-between text-muted-foreground mt-1" style={{ fontSize: '11px' }}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <span key={num} className="w-0 text-center">{num}</span>
                      ))}
                    </div>
                  </div>
                  <Rabbit className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
                
                {/* Live Scroll Preview */}
                <div className="mt-4 p-4 border border-border rounded-lg bg-background overflow-hidden relative h-32">
                  <p className="text-muted-foreground mb-2">미리보기</p>
                  <div className="overflow-hidden h-20 relative">
                    <div 
                      key={scrollSpeed}
                      className="absolute"
                      style={{ 
                        animationName: 'scrollAnimation',
                        animationDuration: `${11 - scrollSpeed}s`,
                        animationTimingFunction: 'linear',
                        animationIterationCount: 'infinite',
                        fontFamily: 'Pretendard'
                      }}
                    >
                      <p>안녕하십니까 여러분. 오늘 이 자리에서 우리의 혁신적인 신제품을 소개하게 되어 매우 기쁩니다.</p>
                      <p className="mt-4">이 제품은 지난 2년간의 연구개발 끝에 탄생했으며, 업계의 패러다임을 완전히 바꿀 것입니다.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2">텍스트 크기</label>
                <input
                  type="range"
                  min="16"
                  max="48"
                  value={fontSize}
                  onChange={(e) => onFontSizeChange(Number(e.target.value))}
                  className="w-full accent-[#0064FF]"
                  style={{ border: 'none', outline: 'none' }}
                />
                <div className="flex items-center justify-between text-muted-foreground mt-2">
                  <span>16px</span>
                  <span>{fontSize}px</span>
                  <span>48px</span>
                </div>
                
                {/* Live Text Preview */}
                <div className="mt-4 p-4 border border-border rounded-lg bg-background">
                  <p className="text-muted-foreground mb-2">미리보기</p>
                  <p style={{ fontSize: `${fontSize}px`, lineHeight: '1.5', fontFamily: 'Pretendard' }}>
                    안녕하십니까 여러분. 오늘 이 자리에서 우리의 혁신적인 신제품을 소개하게 되어 매우 기쁩니다.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox id="auto-advance" />
                <label htmlFor="auto-advance">
                  자동 슬라이드 전환 활성화
                </label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox id="highlight" defaultChecked />
                <label htmlFor="highlight">
                  현재 문장 하이라이트 표시
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setActiveTab("alignment")}>
              이전
            </Button>
            <Button onClick={() => {
              setTimeout(() => {
                onShowToast("success", "준비가 완료되었습니다. 라이브를 시작할 수 있습니다");
              }, 0);
              setTimeout(() => onNavigate("live"), 1500);
            }}>
              준비 완료
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
