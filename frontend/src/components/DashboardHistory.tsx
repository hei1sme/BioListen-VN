"use client";

import React from "react";
import { History, ArrowRight } from "lucide-react";
import { HistoricalRecord } from "@/lib/api";
import { SENSORS } from "@/hooks/useDashboardState";

interface DashboardHistoryProps {
  history: HistoricalRecord[];
  onViewDetails: (record: HistoricalRecord) => void;
}

export function DashboardHistory({ history, onViewDetails }: DashboardHistoryProps) {
  return (
    <div className="border border-border-deep bg-panel-bg p-5 rounded-[2px] font-mono shadow-lg">
      <h2 className="text-xs font-bold tracking-widest text-foreground/80 mb-4 flex items-center gap-2 uppercase">
        <History className="h-4 w-4 text-primary" /> Nhật ký giám sát âm thanh lịch sử
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-[10px] text-left border-collapse">
          <thead>
            <tr className="border-b border-border-deep text-foreground/40 uppercase tracking-wider text-[8px] font-bold bg-[#070b09]">
              <th className="py-3 px-3">Thời gian ghi nhận</th>
              <th className="py-3 px-3">Trạm cảm biến</th>
              <th className="py-3 px-3">Kết quả cảnh báo</th>
              <th className="py-3 px-3">Khu hệ sinh vật phát hiện</th>
              <th className="py-3 px-3 text-right">Chỉ số Shannon H&apos;</th>
              <th className="py-3 px-3 text-right">Độ trễ AI</th>
              <th className="py-3 px-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-deep">
            {history.length > 0 ? (
              history.map((h) => (
                <tr
                  key={h.id}
                  className={`hover:bg-surface-hover/50 transition-colors duration-150 ${
                    h.threats.length > 0 ? "bg-alert-crimson/5 text-alert-crimson" : "text-foreground/80"
                  }`}
                >
                  <td className="py-3.5 px-3 text-foreground/45 font-mono">
                    {new Date(h.timestamp).toLocaleString("vi-VN")}
                  </td>
                  <td className="py-3.5 px-3 font-bold text-foreground">
                    {SENSORS.find((s) => s.id === h.sensor_id)?.name || h.sensor_id}
                  </td>
                  <td className="py-3.5 px-3 font-bold">
                    {h.threats.length > 0 ? (
                      <span className="text-alert-crimson bg-alert-crimson/15 px-2 py-0.5 border border-alert-crimson/30 rounded-[2px] text-[8px] uppercase tracking-wide animate-pulse">
                        🚨{" "}
                        {h.threats
                          .map((t) => (t.threat_type === "chainsaw" ? "TIẾNG CƯA MÁY" : "TIẾNG SÚNG"))
                          .join(", ")}
                      </span>
                    ) : (
                      <span className="text-primary bg-primary/10 px-2 py-0.5 border border-primary/20 rounded-[2px] text-[8px] font-semibold">
                        An toàn
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    {h.species.length > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        {h.species.map((sp, idx) => (
                          <span key={idx} className="text-primary font-semibold">
                            {sp.common_name} ({(sp.confidence * 100).toFixed(0)}%)
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-foreground/30">Không có</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-primary font-mono">
                    {h.shannon_index.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-3 text-right text-foreground/45 font-mono">
                    {h.processing_time_ms}ms
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => onViewDetails(h)}
                      className="text-primary hover:text-primary-dark font-bold hover:underline cursor-pointer flex items-center gap-1 justify-end ml-auto transition-all active:scale-[0.98]"
                    >
                      XEM CHI TIẾT <ArrowRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-10 text-center text-foreground/30 font-mono">
                  Chưa ghi nhận bản ghi nhật ký lịch sử nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default DashboardHistory;
