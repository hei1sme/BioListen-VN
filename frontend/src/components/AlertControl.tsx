"use client";

import React from "react";
import { ShieldAlert, CheckCircle, Activity, AlertTriangle, FileText, Database } from "lucide-react";
import { AudioPredictionResponse } from "@/lib/api";
import { SENSORS } from "@/hooks/useDashboardState";

interface AlertControlProps {
  prediction: AudioPredictionResponse | null;
  activeSensor: string;
}

export function AlertControl({ prediction, activeSensor }: AlertControlProps) {
  const hasAlert = prediction?.threat_detections?.some((t) => t.is_alert);
  const sensorObj = SENSORS.find((s) => s.id === activeSensor);

  const handleDispatchPatrol = () => {
    alert(
      `[DISPATCH CONTROL] Đã kích hoạt lệnh cử tuần tra cơ động tới ${sensorObj?.name}. Lực lượng biên sẽ di chuyển ngay lập tức.`
    );
  };

  return (
    <div
      className={`border rounded-[2px] p-5 relative shadow-lg transition-colors duration-300 ${
        hasAlert
          ? "border-alert-crimson/50 bg-alert-crimson/5 animate-threat-pulse"
          : "border-border-deep bg-panel-bg"
      }`}
    >
      <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-border-deep text-[8px] font-mono text-foreground/40 border-l border-b border-border-deep rounded-bl-[2px]">
        ALERT CONTROL
      </div>

      {/* Header alert status */}
      <div className="flex items-center gap-2 mb-4">
        {hasAlert ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-alert-crimson/15 border border-alert-crimson text-alert-crimson font-mono text-[9px] font-bold tracking-wide rounded-[2px] animate-pulse">
            <ShieldAlert className="h-4 w-4 text-alert-crimson" /> PHÁT HIỆN MỐI ĐE DỌA XÂM HẠI CAO
          </div>
        ) : prediction ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 text-primary font-mono text-[9px] font-bold tracking-wide rounded-[2px]">
            <CheckCircle className="h-4 w-4 text-primary" /> HỆ SINH THÁI KHÔNG CÓ BẤT THƯỜNG
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-border-deep border border-border-light text-foreground/45 font-mono text-[9px] tracking-wide rounded-[2px]">
            <Activity className="h-4 w-4 text-foreground/30" /> ĐANG ĐỢI TÍN HIỆU ÂM THANH
          </div>
        )}
      </div>

      {prediction ? (
        <div className="flex flex-col gap-4">
          {/* Emergency Threat Dispatch Ticket */}
          {hasAlert && (
            <div className="border border-dashed border-alert-crimson/40 bg-background p-4 rounded-[2px] font-mono text-xs flex flex-col gap-3 relative overflow-hidden shadow-md animate-threat-pulse">
              {/* Decorative ticket notch */}
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-panel-bg border-r border-alert-crimson/20" />
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-panel-bg border-l border-alert-crimson/20" />

              <div className="text-center font-bold text-alert-crimson uppercase tracking-widest border-b border-border-deep pb-2">
                PHẦN MỀM KIỂM LÂM - PHIẾU PHÁI CỬ TUẦN TRA
              </div>

              <div className="grid grid-cols-2 gap-y-2.5 text-[10px] text-foreground/75 font-mono border-b border-border-deep pb-3">
                <div className="font-semibold text-foreground/50">Mã phiếu:</div>
                <div className="text-right font-bold text-alert-crimson">
                  {prediction.request_id.slice(0, 8).toUpperCase()}
                </div>

                <div className="font-semibold text-foreground/50">Trạm kiểm âm gốc:</div>
                <div className="text-right font-bold text-foreground">{sensorObj?.name}</div>

                <div className="font-semibold text-foreground/50">Vị trí địa lý trạm:</div>
                <div className="text-right font-bold text-foreground font-mono">{sensorObj?.lat}</div>

                <div className="font-semibold text-foreground/50">Thời điểm kích hoạt:</div>
                <div className="text-right text-foreground/80">
                  {new Date().toLocaleTimeString("vi-VN")}
                </div>

                <div className="font-semibold text-foreground/50">Phân loại tiếng động:</div>
                <div className="text-right uppercase text-alert-crimson font-extrabold flex items-center gap-1 justify-end">
                  <AlertTriangle className="h-3.5 w-3.5 text-alert-crimson animate-pulse" />
                  {prediction.threat_detections
                    .map((td) => (td.threat_type === "chainsaw" ? "TIẾNG CƯA XÍCH" : "TIẾNG SÚNG"))
                    .join(", ")}
                </div>

                <div className="font-semibold text-foreground/50">Mức tin cậy mô hình:</div>
                <div className="text-right text-alert-crimson font-bold">
                  {(prediction.threat_detections[0].confidence * 100).toFixed(0)}% (Sai số ±
                  {(prediction.threat_detections[0].uncertainty * 100).toFixed(0)}%)
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleDispatchPatrol}
                  className="w-full bg-alert-crimson hover:bg-alert-crimson/90 text-white font-bold py-2.5 px-4 rounded-[2px] tracking-wide uppercase text-[10px] flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-md active:scale-[0.98]"
                >
                  <ShieldAlert className="h-4 w-4" /> BẮT ĐẦU PHÁI CỬ LỰC LƯỢNG TUẦN TRA
                </button>
              </div>
            </div>
          )}

          {/* Species detected details */}
          <div className="flex flex-col gap-3">
            <div className="text-[9px] font-mono text-foreground/40 font-bold uppercase tracking-wider">
              Danh sách loài chỉ thị nhận dạng (PyTorch Species Head)
            </div>
            {prediction.species_detections.length > 0 ? (
              <div className="flex flex-col gap-2">
                {prediction.species_detections.map((sp, idx) => (
                  <div
                    key={idx}
                    className="p-3 border border-border-deep bg-background text-xs rounded-[2px]"
                  >
                    <div className="flex justify-between font-mono mb-1">
                      <span className="text-foreground font-bold">{sp.common_name}</span>
                      <span
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded-[2px] border ${
                          sp.is_confident
                            ? "bg-primary/10 border-primary/20 text-primary"
                            : "bg-warning-amber/10 border-warning-amber/25 text-warning-amber"
                        }`}
                      >
                        {sp.is_confident ? "TIN CẬY CAO" : "CẦN XÁC MINH"}
                      </span>
                    </div>
                    <div className="flex justify-between text-[9px] text-foreground/50 font-mono">
                      <span>
                        Độ tin cậy: {(sp.confidence * 100).toFixed(0)}% (Bất định:{" "}
                        {(sp.uncertainty * 100).toFixed(0)}%)
                      </span>
                      <span className="font-mono">
                        Dải âm: {sp.time_window.start_sec}s - {sp.time_window.end_sec}s
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[10px] text-foreground/45 bg-background p-3 border border-border-deep rounded-[2px] font-mono">
                Không phát hiện tín hiệu loài cụ thể trong dải ghi âm.
              </div>
            )}
          </div>

          {/* Ecosystem health values simplified */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs p-3.5 border border-border-deep bg-background rounded-[2px]">
            <div>
              <div className="text-foreground/40 text-[8px] uppercase tracking-wider mb-1">
                Chỉ số Shannon (H&apos;)
              </div>
              <div className="text-lg font-bold text-primary">
                {prediction.ecosystem_health.shannon_index.toFixed(2)}
              </div>
              <div className="text-[8px] text-foreground/50 mt-1 uppercase font-semibold">
                {prediction.ecosystem_health.shannon_index >= 1.5 ? (
                  <span className="text-primary font-bold">Đa dạng: Cao (Tốt)</span>
                ) : prediction.ecosystem_health.shannon_index >= 1.0 ? (
                  <span className="text-warning-amber font-semibold">Đa dạng: Trung bình</span>
                ) : (
                  <span className="text-alert-crimson font-bold">Đa dạng: Cực thấp</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-foreground/40 text-[8px] uppercase tracking-wider mb-1">
                Độ trù phú sinh học
              </div>
              <div className="text-lg font-bold text-primary">
                {prediction.ecosystem_health.species_richness} Loài chim/ếch
              </div>
              <div className="text-[8px] text-foreground/50 mt-1 uppercase font-semibold">
                {hasAlert ? (
                  <span className="text-alert-crimson font-bold">Rừng bị đe dọa</span>
                ) : (
                  <span className="text-primary font-bold">Hệ sinh cảnh ổn định</span>
                )}
              </div>
            </div>
          </div>

          {/* Groq Llama 3.1 emergency bulletin report */}
          <div className="border border-border-deep bg-background p-3.5 rounded-[2px]">
            <div className="text-[9px] text-foreground/60 font-bold mb-2 flex items-center gap-1.5 uppercase tracking-wider border-b border-border-deep pb-1.5 font-mono">
              <FileText className="h-3.5 w-3.5 text-primary" /> BÁO CÁO NGHIỆP VỤ LÂM NGHIỆP
            </div>
            <p className="text-[11px] text-foreground/75 leading-relaxed text-justify whitespace-pre-wrap font-sans">
              {prediction.llm_report}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-14 text-foreground/40 text-[10px] flex flex-col items-center justify-center gap-3 font-mono">
          <Database className="h-7 w-7 text-foreground/20 animate-pulse" />
          <div>Sẵn sàng tiếp nhận dữ liệu từ trạm kiểm lâm.</div>
          <div className="text-foreground/30">
            Vui lòng bấm chọn kịch bản giả lập ở chân trang hoặc ghi âm trực tiếp.
          </div>
        </div>
      )}
    </div>
  );
}
export default AlertControl;
