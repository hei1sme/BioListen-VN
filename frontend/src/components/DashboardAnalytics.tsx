"use client";

import React from "react";
import { TrendingUp, Award } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface TrendPoint {
  timestamp: string;
  shannon_index: number;
  species_richness: number;
}

interface DashboardAnalyticsProps {
  mounted: boolean;
  trendData: TrendPoint[];
}

export function DashboardAnalytics({ mounted, trendData }: DashboardAnalyticsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Trend Chart */}
      <div className="lg:col-span-8 border border-border-deep bg-panel-bg p-5 rounded-[2px] shadow-lg">
        <h2 className="text-xs font-bold font-mono tracking-widest text-foreground/80 mb-6 flex items-center gap-2 uppercase">
          <TrendingUp className="h-4 w-4 text-primary" /> Đồ thị xu hướng đa dạng Shannon H&apos; theo thời gian
        </h2>

        {/* Recharts Wrapper */}
        <div className="w-full h-80 font-mono text-[9px] relative">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="shannonGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff8f" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00ff8f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 143, 0.03)" />
                <XAxis dataKey="timestamp" stroke="rgba(226, 232, 240, 0.3)" />
                <YAxis domain={[0, 2.0]} stroke="rgba(226, 232, 240, 0.3)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0c1310",
                    borderColor: "#16221c",
                    color: "#e2e8f0",
                    fontFamily: "monospace",
                    fontSize: "10px",
                  }}
                  itemStyle={{ color: "#00ff8f" }}
                />
                <Area
                  type="monotone"
                  dataKey="shannon_index"
                  name="Chỉ số Shannon H'"
                  stroke="#00ff8f"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#shannonGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-foreground/30 font-mono">
              Đang tải biểu đồ đa dạng...
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-4 p-3 border border-border-deep bg-background text-[10px] text-foreground/50 rounded-[2px] font-mono">
          <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span>
            Chỉ số đa dạng Shannon được cập nhật tự động từ kết quả lượng giá quần thể loài chỉ thị theo thời
            gian thực.
          </span>
        </div>
      </div>

      {/* Bio Assessment specs */}
      <div className="lg:col-span-4 border border-border-deep bg-panel-bg p-5 rounded-[2px] font-mono shadow-lg">
        <h2 className="text-xs font-bold tracking-widest text-primary mb-4 flex items-center gap-2 uppercase">
          <Award className="h-4 w-4 text-primary" /> Quy chuẩn đánh giá đa dạng
        </h2>

        <div className="flex flex-col gap-4 text-xs">
          <div className="p-3 border border-border-deep bg-background rounded-[2px]">
            <div className="text-foreground/40 text-[9px] mb-1 uppercase tracking-wider font-semibold">
              Thuật toán Shannon-Wiener (H&apos;)
            </div>
            <code className="text-primary text-xs font-bold font-mono">H&apos; = - ∑ (p_i * ln(p_i))</code>
            <div className="text-foreground/45 text-[9px] mt-2 leading-relaxed font-sans">
              Với p_i là mật độ xác suất hiện diện của loài i thu được trên phổ âm kiểm tra.
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="text-foreground/60 text-[9px] uppercase tracking-wider font-bold">
              Thang đo chỉ số H&apos;:
            </div>

            <div className="flex justify-between border-b border-border-deep pb-1.5 text-foreground/60">
              <span>H&apos; &gt; 2.0</span>
              <span className="text-primary font-bold bg-primary/10 px-1.5 rounded-[2px] border border-primary/20">
                Độ đa dạng: Rất cao
              </span>
            </div>

            <div className="flex justify-between border-b border-border-deep pb-1.5 text-foreground/60">
              <span>1.5 ≤ H&apos; ≤ 2.0</span>
              <span className="text-primary/80 font-semibold bg-primary/5 px-1.5 rounded-[2px] border border-primary/10">
                Độ đa dạng: Tốt
              </span>
            </div>

            <div className="flex justify-between border-b border-border-deep pb-1.5 text-foreground/60">
              <span>1.0 ≤ H&apos; &lt; 1.5</span>
              <span className="text-foreground/80 bg-background px-1.5 rounded-[2px] border border-border-deep">
                Độ đa dạng: Trung bình
              </span>
            </div>

            <div className="flex justify-between border-b border-border-deep pb-1.5 text-foreground/60">
              <span>H&apos; &lt; 1.0</span>
              <span className="text-alert-crimson font-bold bg-alert-crimson/10 px-1.5 rounded-[2px] border border-alert-crimson/25 animate-pulse">
                Báo động: Suy giảm cao
              </span>
            </div>
          </div>

          <div className="border border-border-deep bg-background p-3 text-foreground/50 text-[10px] leading-relaxed rounded-[2px] font-sans">
            <span className="text-alert-crimson font-bold font-mono">Quy chế cảnh báo:</span> Khi phát hiện
            tiếng động phá hoại rừng (cưa máy/súng), chỉ số H&apos; sẽ bị đè cưỡng bức về mức &lt;0.50 nhằm
            phát tín hiệu xáo trộn sinh cảnh khẩn cấp.
          </div>
        </div>
      </div>
    </div>
  );
}
export default DashboardAnalytics;
