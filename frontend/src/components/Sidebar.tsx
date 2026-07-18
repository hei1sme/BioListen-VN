"use client";

import React from "react";
import { Activity, History, BarChart3, Compass, MapPin, Database, Cpu } from "lucide-react";
import { SENSORS } from "@/hooks/useDashboardState";

interface SidebarProps {
  activeTab: "monitor" | "history" | "analytics" | "catalog" | "devices";
  setActiveTab: (tab: "monitor" | "history" | "analytics" | "catalog" | "devices") => void;
  activeSensor: string;
  setActiveSensor: (sensorId: string) => void;
  historyLength: number;
  catalogLength: number;
  hasAlert: boolean;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  activeSensor,
  setActiveSensor,
  historyLength,
  catalogLength,
  hasAlert,
}: SidebarProps) {
  return (
    <aside className="w-full md:w-64 border-r border-border-deep bg-panel-bg flex flex-col font-mono shrink-0">
      <div className="p-4 border-b border-border-deep">
        <div className="text-[9px] text-foreground/40 font-bold mb-3 tracking-wider uppercase">
          Surveillance System
        </div>
        <nav className="flex flex-col gap-1">
          <button
            onClick={() => setActiveTab("monitor")}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-[2px] transition-all duration-200 cursor-pointer active:scale-[0.98] ${
              activeTab === "monitor"
                ? "bg-primary/10 text-primary border-l-2 border-primary font-bold"
                : "border-l-2 border-transparent text-foreground/60 hover:text-foreground hover:bg-surface-hover"
            }`}
          >
            <span className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-primary" /> TRUNG TÂM CHỈ HUY
            </span>
            <span className="text-[8px] bg-primary/20 px-1.5 py-0.5 rounded-[2px] border border-primary/30 text-primary font-bold">
              01
            </span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-[2px] transition-all duration-200 cursor-pointer active:scale-[0.98] ${
              activeTab === "history"
                ? "bg-primary/10 text-primary border-l-2 border-primary font-bold"
                : "border-l-2 border-transparent text-foreground/60 hover:text-foreground hover:bg-surface-hover"
            }`}
          >
            <span className="flex items-center gap-2">
              <History className="h-3.5 w-3.5 text-primary" /> NHẬT KÝ LỊCH SỬ
            </span>
            <span className="text-[8px] bg-border-deep px-1.5 py-0.5 rounded-[2px] text-foreground/80 font-bold border border-border-light">
              {historyLength}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-[2px] transition-all duration-200 cursor-pointer active:scale-[0.98] ${
              activeTab === "analytics"
                ? "bg-primary/10 text-primary border-l-2 border-primary font-bold"
                : "border-l-2 border-transparent text-foreground/60 hover:text-foreground hover:bg-surface-hover"
            }`}
          >
            <span className="flex items-center gap-2">
              <BarChart3 className="h-3.5 w-3.5 text-primary" /> XU HƯỚNG ĐA DẠNG
            </span>
            <span className="text-[8px] bg-border-deep px-1.5 py-0.5 rounded-[2px] text-foreground/40 font-bold border border-border-light">
              ANL
            </span>
          </button>

          <button
            onClick={() => setActiveTab("catalog")}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-[2px] transition-all duration-200 cursor-pointer active:scale-[0.98] ${
              activeTab === "catalog"
                ? "bg-primary/10 text-primary border-l-2 border-primary font-bold"
                : "border-l-2 border-transparent text-foreground/60 hover:text-foreground hover:bg-surface-hover"
            }`}
          >
            <span className="flex items-center gap-2">
              <Compass className="h-3.5 w-3.5 text-primary" /> THƯ VIỆN LOÀI RỪNG
            </span>
            <span className="text-[8px] bg-border-deep px-1.5 py-0.5 rounded-[2px] text-foreground/40 font-bold border border-border-light">
              {catalogLength}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("devices")}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-[2px] transition-all duration-200 cursor-pointer active:scale-[0.98] ${
              activeTab === "devices"
                ? "bg-primary/10 text-primary border-l-2 border-primary font-bold"
                : "border-l-2 border-transparent text-foreground/60 hover:text-foreground hover:bg-surface-hover"
            }`}
          >
            <span className="flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 text-primary" /> THIẾT BỊ BIÊN
            </span>
            <span className="text-[8px] bg-border-deep px-1.5 py-0.5 rounded-[2px] text-primary/80 font-bold border border-primary/20">
              DEV
            </span>
          </button>
        </nav>
      </div>

      {/* Simulated Stations coordinates log */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[9px] text-foreground/40 font-bold mb-3 tracking-wider uppercase">
            Edge Sensors
          </div>
          <div className="flex flex-col gap-2.5">
            {SENSORS.map((s) => {
              const isSensorAlert = s.id === "demo-sensor-3" && hasAlert;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSensor(s.id)}
                  className={`p-3 text-[10px] text-left border rounded-[2px] flex flex-col gap-1.5 transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                    activeSensor === s.id
                      ? "bg-primary/5 border-primary/45 shadow-md shadow-primary/5"
                      : "bg-[#090d0b] border-border-deep hover:border-border-light"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-foreground flex items-center gap-1.5 font-mono">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {s.name}
                    </span>
                    <span
                      className={`text-[8px] font-bold px-1.5 py-0.5 rounded-[2px] border ${
                        isSensorAlert
                          ? "bg-alert-crimson/10 border-alert-crimson text-alert-crimson animate-pulse"
                          : "bg-primary/10 border-primary/20 text-primary"
                      }`}
                    >
                      {isSensorAlert ? "🚨 ALARM" : "ACTIVE"}
                    </span>
                  </div>
                  <div className="text-[9px] text-foreground/40 flex flex-col gap-0.5 font-mono">
                    <div>Lat: {s.lat}</div>
                    <div>Lng: {s.lng}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hardware spec info strip */}
        <div className="pt-4 border-t border-border-deep text-[9px] text-foreground/50 flex flex-col gap-2 font-mono">
          <div className="flex items-center gap-1.5 text-foreground/75">
            <Database className="h-3.5 w-3.5 text-primary" /> PyTorch ONNX Runtime (CPU)
          </div>
          <div className="flex justify-between">
            <span>Đo trễ xử lý biên:</span>
            <span className="text-foreground font-bold">&lt;150ms</span>
          </div>
          <div className="flex justify-between">
            <span>Nguồn năng lượng:</span>
            <span className="text-primary font-bold">84% (Mặt Trời)</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
export default Sidebar;
