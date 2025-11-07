import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Settings, Bell, Palette, Mic, Monitor } from "lucide-react";

interface SettingsScreenProps {
  onShowToast: (type: "info" | "success" | "warning" | "error", message: string) => void;
  theme: "light" | "dark" | "auto";
  onThemeChange: (theme: "light" | "dark" | "auto") => void;
}

export function SettingsScreen({ onShowToast, theme, onThemeChange }: SettingsScreenProps) {
  const handleSave = () => {
    onShowToast("success", "설정이 저장되었습니다");
  };

  const handleThemeChange = (newTheme: string) => {
    onThemeChange(newTheme as "light" | "dark" | "auto");
    onShowToast("success", "테마가 변경되었습니다");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">설정</h1>
        <p className="text-muted-foreground">
          애플리케이션 환경을 설정합니다
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Settings className="w-4 h-4" />
            일반
          </TabsTrigger>
          <TabsTrigger value="prompter" className="gap-2">
            <Monitor className="w-4 h-4" />
            텔레프롬프터
          </TabsTrigger>
          <TabsTrigger value="audio" className="gap-2">
            <Mic className="w-4 h-4" />
            오디오
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            알림
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="w-4 h-4" />
            외관
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>일반 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="user-name">사용자 이름</Label>
                <Input id="user-name" placeholder="이름을 입력하세요" defaultValue="홍길동" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  defaultValue="hong@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">언어</Label>
                <Select defaultValue="ko">
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ko">한국어</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>자동 저장</Label>
                  <p className="text-muted-foreground">
                    작업 내용을 자동으로 저장합니다
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompter">
          <Card>
            <CardHeader>
              <CardTitle>텔레프롬프터 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>텍스트 크기</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="16"
                    max="48"
                    defaultValue="32"
                    className="flex-1"
                  />
                  <span className="w-16 text-center">32px</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>스크롤 속도</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    defaultValue="5"
                    className="flex-1"
                  />
                  <span className="w-16 text-center">5</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text-color">텍스트 색상</Label>
                <Select defaultValue="black">
                  <SelectTrigger id="text-color">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="black">검은색</SelectItem>
                    <SelectItem value="white">흰색</SelectItem>
                    <SelectItem value="blue">파란색</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>자동 슬라이드 전환</Label>
                  <p className="text-muted-foreground">
                    음성 인식으로 슬라이드를 자동 전환합니다
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>현재 문장 하이라이트</Label>
                  <p className="text-muted-foreground">
                    진행 중인 문장을 강조 표시합니다
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>다음 문단 미리보기</Label>
                  <p className="text-muted-foreground">
                    다음 문단을 희미하게 표시합니다
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audio">
          <Card>
            <CardHeader>
              <CardTitle>오디오 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="microphone">마이크</Label>
                <Select defaultValue="default">
                  <SelectTrigger id="microphone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">기본 마이크</SelectItem>
                    <SelectItem value="usb">USB 마이크</SelectItem>
                    <SelectItem value="bluetooth">블루투스 마이크</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>마이크 감도</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    defaultValue="7"
                    className="flex-1"
                  />
                  <span className="w-16 text-center">7</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>음성 인식</Label>
                  <p className="text-muted-foreground">
                    실시간 음성 인식을 활성화합니다
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>노이즈 제거</Label>
                  <p className="text-muted-foreground">
                    배경 소음을 자동으로 제거합니다
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>알림 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>키워드 누락 알림</Label>
                  <p className="text-muted-foreground">
                    중요 키워드를 빠뜨렸을 때 알림을 표시합니다
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>시간 초과 경고</Label>
                  <p className="text-muted-foreground">
                    목표 시간을 초과할 때 경고를 표시합니다
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Q&A 알림</Label>
                  <p className="text-muted-foreground">
                    새로운 질문이 등록되면 알림을 표시합니다
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>소리 알림</Label>
                  <p className="text-muted-foreground">
                    알림 시 소리를 재생합니다
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>외관 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">테마</Label>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">라이트</SelectItem>
                    <SelectItem value="dark">다크</SelectItem>
                    <SelectItem value="auto">시스템 설정 따라가기</SelectItem>
                  </SelectContent>
                </Select>
              </div>



              <div className="flex items-center justify-between">
                <div>
                  <Label>컴팩트 모드</Label>
                  <p className="text-muted-foreground">
                    UI 요소 간격을 줄여서 표시합니다
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>애니메이션 효과</Label>
                  <p className="text-muted-foreground">
                    화면 전환 애니메이션을 활성화합니다
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 mt-8">
        <Button variant="outline">초기화</Button>
        <Button onClick={handleSave}>저장</Button>
      </div>
    </div>
  );
}
