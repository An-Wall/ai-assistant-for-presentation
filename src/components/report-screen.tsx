import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Download, TrendingUp, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

interface ReportScreenProps {
  onShowToast: (type: "info" | "success" | "warning" | "error", message: string) => void;
}

// Custom Tooltip for Bar Chart
const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-[10px] shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
        <p className="font-medium">{payload[0].payload.section}</p>
        <p className="text-blue-600 dark:text-blue-400">
          점수: <span className="font-medium">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Line Chart
const CustomLineTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-[10px] shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
        <p className="font-medium mb-1 text-[#000000] dark:text-[#ffffff]">슬라이드 {payload[0].payload.time}</p>
        <p className="text-gray-600 dark:text-gray-400">
          계획 시간: <span className="font-medium">{payload[0].value}초</span>
        </p>
        <p className="text-blue-600 dark:text-blue-400">
          실제 진행 시간: <span className="font-medium">{payload[1].value}초</span>
        </p>
      </div>
    );
  }
  return null;
};

export function ReportScreen({ onShowToast }: ReportScreenProps) {
  const deliveryData = [
    { section: "인트로", score: 85 },
    { section: "시장분석", score: 78 },
    { section: "핵심기능", score: 92 },
    { section: "가격정책", score: 88 },
    { section: "마무리", score: 90 },
  ];

  const timelineData = [
    { time: 1, planned: 60, actual: 55 },
    { time: 2, planned: 120, actual: 125 },
    { time: 3, planned: 180, actual: 175 },
    { time: 4, planned: 240, actual: 248 },
    { time: 5, planned: 300, actual: 295 },
    { time: 6, planned: 360, actual: 365 },
  ];

  const keywordData = [
    { name: "언급함", value: 8, color: "#10b981" },
    { name: "누락", value: 2, color: "#f59e0b" },
  ];

  const handleExport = () => {
    onShowToast("success", "리포트가 PDF로 다운로드되었습니다");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="mb-2">분석 리포트</h1>
          <p className="text-muted-foreground">
            2025 신제품 발표 - 2025년 10월 28일
          </p>
        </div>
        <Button onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          PDF 다운로드
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              발표 시간
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-3xl">10:05</span>
              <span className="text-muted-foreground mb-1">/ 10:00</span>
            </div>
            <p className="text-muted-foreground mt-2">
              목표 대비 +5초
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              전달력 점수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-3xl text-green-600 dark:text-green-400">87</span>
              <span className="text-muted-foreground mb-1">/ 100</span>
            </div>
            <p className="text-green-600 dark:text-green-400 mt-2">
              평균 이상
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              키워드 달성
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-3xl">8</span>
              <span className="text-muted-foreground mb-1">/ 10</span>
            </div>
            <p className="text-muted-foreground mt-2">
              80% 달성
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              개선 포인트
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-3xl text-yellow-600 dark:text-yellow-400">3</span>
              <span className="text-muted-foreground mb-1">개</span>
            </div>
            <p className="text-muted-foreground mt-2">
              섹션별 분석 참고
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>섹션별 전달력 점수</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deliveryData}>
                <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
                <XAxis dataKey="section" tick={{ fill: 'currentColor' }} className="dark:text-gray-300" />
                <YAxis domain={[0, 100]} tick={{ fill: 'currentColor' }} className="dark:text-gray-300" />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="score" fill="#0064FF" name="점수" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>슬라이드 진행 속도 비교</CardTitle>
            <p className="text-muted-foreground mt-2">계획된 시간과 실제 발표 시간의 차이 (단위: 초)</p>
          </CardHeader>
          <CardContent className="hover:dark:text-[#000000] transition-colors cursor-pointer">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={timelineData} margin={{ top: 5, right: 30, left: 20, bottom: 32 }}>
                <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fill: 'currentColor', fontSize: 11 }} 
                  className="dark:text-gray-300"
                  label={{ value: '슬라이드 번호', position: 'insideBottom', offset: -10, fill: 'currentColor', fontSize: 11 }}
                />
                <YAxis 
                  tick={{ fill: 'currentColor', fontSize: 11 }} 
                  className="dark:text-gray-300"
                  label={{ value: '누적 시간 (초)', angle: -90, position: 'insideLeft', fill: 'currentColor', fontSize: 11 }}
                />
                <Tooltip content={<CustomLineTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', paddingTop: '16px', textAlign: 'center', width: '100%' }}
                  iconSize={10}
                  align="center"
                  layout="horizontal"
                />
                <Line
                  type="monotone"
                  dataKey="planned"
                  stroke="#94a3b8"
                  name="계획 시간"
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#0064FF"
                  name="실제 진행 시간"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Keyword Analysis & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>키워드 달성률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="flex-1 flex flex-col items-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={keywordData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                        return (
                          <text 
                            x={x} 
                            y={y} 
                            fill="white" 
                            textAnchor="middle" 
                            dominantBaseline="central"
                            fontWeight="600"
                            fontSize="18"
                          >
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="none"
                    >
                      {keywordData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-6 mt-4">
                  {keywordData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span>{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="mb-3">누락된 키워드</h4>
                <div className="space-y-2">
                  <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded border-l-4 border-yellow-500 dark:text-yellow-100">
                    경쟁사 비교
                  </div>
                  <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded border-l-4 border-yellow-500 dark:text-yellow-100">
                    기술 스펙
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>개선 권장사항</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="mb-1 dark:text-blue-100">시장분석 섹션 강화</h4>
                    <p className="text-muted-foreground">
                      전달력 점수가 78점으로 낮습니다. 데이터 시각화를 추가하세요.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="mb-1 dark:text-blue-100">키워드 누락 방지</h4>
                    <p className="text-muted-foreground">
                      '경쟁사 비교', '기술 스펙' 키워드를 스크립트에 추가하세요.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="mb-1 dark:text-blue-100">타이밍 조정</h4>
                    <p className="text-muted-foreground">
                      목표 시간 대비 +5초 초과했습니다. 인트로를 5초 단축하세요.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
