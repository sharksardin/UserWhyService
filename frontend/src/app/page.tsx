"use client";

import React, { useState } from "react";
import axios from "axios";
import {
  Search,
  Loader2,
  BarChart3,
  Users,
  Target,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

// API 응답 타입 정의
interface AnalysisResponse {
  recommended_market: string;
  total_score: number;
  status_label: "GO" | "CAUTION" | "STOP";
  analysis: {
    marketability: number;
    competition: number;
    description: string;
  };
  target_audience: {
    gender: string;
    age_top: string;
  };
}

export default function UserWhyDashboard() {
  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!productName.trim()) {
      alert("상품명을 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(
        "http://168.107.33.24:8000/api/analyze",
        {
          product_name: productName,
          target_market: "auto",
        },
      );
      setResult(response.data);
    } catch (err: any) {
      console.error("API Error:", err);
      setError(
        err.response?.data?.detail ||
          "AI 분석 중 오류가 발생했습니다. 서버 상태를 확인해주세요.",
      );
    } finally {
      setLoading(false);
    }
  };

  // 상태 라벨에 따른 테마 색상 결정
  const getThemeColor = (status: string) => {
    switch (status) {
      case "GO":
        return {
          text: "text-blue-600",
          bg: "bg-blue-50",
          border: "border-blue-200",
          icon: <CheckCircle2 className="w-6 h-6 text-blue-500" />,
        };
      case "CAUTION":
        return {
          text: "text-orange-600",
          bg: "bg-orange-50",
          border: "border-orange-200",
          icon: <AlertTriangle className="w-6 h-6 text-orange-500" />,
        };
      case "STOP":
        return {
          text: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-200",
          icon: <AlertCircle className="w-6 h-6 text-red-500" />,
        };
      default:
        return {
          text: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-200",
          icon: null,
        };
    }
  };

  const theme = result ? getThemeColor(result.status_label) : null;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            UserWhy{" "}
            <span className="text-blue-600 italic">AI Market Analyzer</span>
          </h1>
          <p className="text-slate-500">
            글로벌 진출을 위한 최적의 시장과 타겟을 AI로 정밀 분석합니다.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="분석할 상품명을 입력하세요 (예: 비건 달팽이 크림)"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold px-8 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "분석하기"
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <Target className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 w-6 h-6 animate-pulse" />
            </div>
            <p className="text-slate-600 font-medium animate-pulse">
              AI가 글로벌 시장 데이터를 분석 중입니다...
            </p>
          </div>
        )}

        {/* Result Section */}
        {result && theme && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
            {/* Main Score Card */}
            <div
              className={`bg-white rounded-3xl p-8 border ${theme.border} shadow-lg relative overflow-hidden`}
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 ${theme.bg} rounded-bl-full -mr-8 -mt-8 opacity-50`}
              ></div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${theme.bg} ${theme.text} border ${theme.border}`}
                    >
                      Result: {result.status_label}
                    </span>
                    <span className="text-slate-400 text-sm">
                      Recommended Market:
                    </span>
                    <span className="font-bold text-slate-800">
                      {result.recommended_market}
                    </span>
                  </div>
                  <h2 className="text-5xl font-black text-slate-900">
                    {result.total_score}
                    <span className="text-2xl font-normal text-slate-400 ml-1">
                      pts
                    </span>
                  </h2>
                  <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                    {result.analysis.description}
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100 min-w-[200px]">
                  {theme.icon}
                  <p className={`mt-2 font-bold text-xl ${theme.text}`}>
                    진출 {result.status_label}
                  </p>
                </div>
              </div>
            </div>

            {/* Sub Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Detailed Scores */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h3>지표 세부 분석</h3>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-600">
                        시장성 (Marketability)
                      </span>
                      <span className="text-blue-600">
                        {result.analysis.marketability}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                        style={{ width: `${result.analysis.marketability}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-600">
                        경쟁강도 (Competition)
                      </span>
                      <span className="text-orange-600">
                        {result.analysis.competition}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-1000"
                        style={{ width: `${result.analysis.competition}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      * 경쟁강도는 높을수록 진입 장벽이 높음을 의미합니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* Target Audience */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3>핵심 타겟 고객</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                    <p className="text-xs text-slate-500 uppercase">
                      주요 성별
                    </p>
                    <p className="text-lg font-bold text-slate-800">
                      {result.target_audience.gender}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                    <p className="text-xs text-slate-500 uppercase">
                      주요 연령층
                    </p>
                    <p className="text-lg font-bold text-slate-800">
                      {result.target_audience.age_top}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-700 leading-tight">
                      해당 타겟층은 현재 SNS 구매 전환율이 가장 높은 집단으로
                      분석됩니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
