import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Play, Upload, BarChart3, MessageSquare } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface DashboardScreenProps {
  onNavigate: (screen: string) => void;
}

export function DashboardScreen({ onNavigate }: DashboardScreenProps) {
  const recentProjects = [
    { id: 1, name: "2025 신제품 발표", date: "2025-10-28", status: "준비완료" },
    { id: 2, name: "Q4 실적 보고", date: "2025-10-25", status: "수정 중" },
    { id: 3, name: "기술 컨퍼런스", date: "2025-10-20", status: "발표완료" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">텔레프롬프터 대시보드</h1>
        <p className="text-muted-foreground">
          발표 준비부터 실시간 전달, 분석까지 모든 과정을 관리합니다
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg dark:hover:shadow-[0_10px_15px_-3px_rgba(255,255,255,0.1),0_4px_6px_-4px_rgba(255,255,255,0.1)] transition-shadow cursor-pointer" onClick={() => onNavigate("preparation")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Upload className="w-6 h-6 text-[#0064FF]" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="mb-2">새 발표 준비</h3>
            <p className="text-muted-foreground text-[15px]">
              스크립트와 슬라이드를 업로드하여 시작하세요
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg dark:hover:shadow-[0_10px_15px_-3px_rgba(255,255,255,0.1),0_4px_6px_-4px_rgba(255,255,255,0.1)] transition-shadow cursor-pointer" onClick={() => onNavigate("live")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Play className="w-6 h-6 text-green-600" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="mb-2">라이브 시작</h3>
            <p className="text-muted-foreground text-[15px]">
              실시간 텔레프롬프터를 시작합니다
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg dark:hover:shadow-[0_10px_15px_-3px_rgba(255,255,255,0.1),0_4px_6px_-4px_rgba(255,255,255,0.1)] transition-shadow cursor-pointer" onClick={() => onNavigate("report")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="mb-2">분석 리포트</h3>
            <p className="text-muted-foreground text-[15px]">
              발표 성과와 개선점을 확인하세요
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg dark:hover:shadow-[0_10px_15px_-3px_rgba(255,255,255,0.1),0_4px_6px_-4px_rgba(255,255,255,0.1)] transition-shadow cursor-pointer" onClick={() => onNavigate("qna")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="mb-2">Q&A 관리</h3>
            <p className="text-muted-foreground text-[15px]">
              청중 질문을 실시간으로 관리합니다
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>최근 프로젝트</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="group flex items-center justify-between p-4 rounded-lg border border-gray-300 dark:border-gray-600 hover:shadow-lg dark:hover:bg-white/10 dark:hover:border-transparent transition-all cursor-pointer"
                onClick={() => onNavigate("preparation")}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1582192904915-d89c7250b235?w=100"
                      alt={project.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <h4>{project.name}</h4>
                    <p className="text-muted-foreground">{project.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full ${
                      project.status === "발표완료"
                        ? "bg-green-100 text-green-700"
                        : project.status === "준비완료"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {project.status}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate("preparation");
                    }}
                  >
                    열기
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
