"use client";

import React from "react";
import { Cpu, Battery, Wifi, HardDrive, Thermometer, AlertTriangle, CheckCircle, Droplets, Sun } from "lucide-react";

interface DeviceDiagnostic {
  id: string;
  name: string;
  lat: string;
  lng: string;
  status: "active" | "alert" | "warning";
  battery: number;
  solarStatus: string;
  signalStrength: string;
  signalPercent: number;
  micHealth: string;
  temp: number;
  humidity: number;
  storageUsed: number; // GB
  storageTotal: number; // GB
  cpuLoad: number; // %
  ramUsed: number; // MB
  ramTotal: number; // MB
}

const DEVICES_DATA: DeviceDiagnostic[] = [
  {
    id: "demo-sensor-1",
    name: "Trạm A - Suối Lớn (Edge-Node A)",
    lat: "20°14'14.3\"N",
    lng: "105°36'56.5\"E",
    status: "active",
    battery: 84,
    solarStatus: "Đang sạc (Pin Mặt Trời 15W)",
    signalStrength: "-72 dBm",
    signalPercent: 82,
    micHealth: "Ổn định (100%)",
    temp: 28.4,
    humidity: 82,
    storageUsed: 4.2,
    storageTotal: 32,
    cpuLoad: 12,
    ramUsed: 512,
    ramTotal: 2048,
  },
  {
    id: "demo-sensor-2",
    name: "Trạm B - Đỉnh Mây (Edge-Node B)",
    lat: "20°14'27.6\"N",
    lng: "105°37'12.0\"E",
    status: "active",
    battery: 91,
    solarStatus: "Đang sạc (Pin Mặt Trời 15W)",
    signalStrength: "-68 dBm",
    signalPercent: 88,
    micHealth: "Ổn định (100%)",
    temp: 24.1,
    humidity: 78,
    storageUsed: 5.8,
    storageTotal: 32,
    cpuLoad: 15,
    ramUsed: 580,
    ramTotal: 2048,
  },
  {
    id: "demo-sensor-3",
    name: "Trạm C - Rừng Già (Edge-Node C)",
    lat: "20°14'06.0\"N",
    lng: "105°36'36.0\"E",
    status: "alert",
    battery: 12,
    solarStatus: "Lỗi dòng sạc (Khả năng bị phá hoại hoặc bão che phủ)",
    signalStrength: "-94 dBm",
    signalPercent: 32,
    micHealth: "Nhạy cảm suy giảm (50% - Màng ẩm)",
    temp: 31.8,
    humidity: 85,
    storageUsed: 8.1,
    storageTotal: 32,
    cpuLoad: 68,
    ramUsed: 1240,
    ramTotal: 2048,
  },
];

export function DashboardDevices() {
  return (
    <div className="border border-border-deep bg-panel-bg p-5 rounded-[2px] font-mono shadow-lg flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-border-deep pb-3">
        <h2 className="text-xs font-bold tracking-widest text-foreground/80 flex items-center gap-2 uppercase">
          <Cpu className="h-4 w-4 text-primary animate-pulse" /> Giám sát chẩn đoán thiết bị biên (Edge Hardware)
        </h2>
        <span className="text-[8px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-[2px] font-bold">
          LoraWAN Gateway Online
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {DEVICES_DATA.map((dev) => {
          const isAlert = dev.status === "alert";
          return (
            <div
              key={dev.id}
              className={`border p-5 rounded-[2px] flex flex-col gap-4 bg-[#090d0b] transition-all relative ${
                isAlert ? "border-alert-crimson/40 shadow-md shadow-alert-crimson/5" : "border-border-deep"
              }`}
            >
              {/* Top Station identity */}
              <div className="flex justify-between items-start border-b border-border-deep pb-3">
                <div>
                  <h3 className="text-xs font-bold text-foreground">{dev.name}</h3>
                  <div className="text-[7.5px] text-foreground/45 mt-0.5">
                    GPS: {dev.lat} • {dev.lng}
                  </div>
                </div>
                <span
                  className={`text-[8px] font-bold px-1.5 py-0.5 rounded-[2px] border ${
                    isAlert
                      ? "bg-alert-crimson/15 border-alert-crimson text-alert-crimson animate-pulse"
                      : "bg-primary/10 border-primary/20 text-primary"
                  }`}
                >
                  {isAlert ? "🚨 WARN" : "ONLINE"}
                </span>
              </div>

              {/* Gauges area */}
              <div className="flex flex-col gap-3.5 text-[9px] text-foreground/80">
                {/* Battery Gauge */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between font-bold">
                    <span className="flex items-center gap-1">
                      <Battery className="h-3.5 w-3.5 text-primary" /> Pin Lithium-ion:
                    </span>
                    <span className={dev.battery < 20 ? "text-alert-crimson font-extrabold animate-pulse" : "text-primary"}>
                      {dev.battery}%
                    </span>
                  </div>
                  <div className="w-full bg-border-deep h-1.5 rounded-[1px] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        dev.battery < 20 ? "bg-alert-crimson" : "bg-primary"
                      }`}
                      style={{ width: `${dev.battery}%` }}
                    />
                  </div>
                  <div className="text-[7px] text-foreground/40 font-sans flex items-center gap-1 pl-1">
                    {dev.battery >= 20 ? <Sun className="h-2.5 w-2.5 text-primary" /> : <AlertTriangle className="h-2.5 w-2.5 text-alert-crimson" />}
                    {dev.solarStatus}
                  </div>
                </div>

                {/* Signal Strength (Lora) */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between font-bold">
                    <span className="flex items-center gap-1">
                      <Wifi className="h-3.5 w-3.5 text-primary" /> Tín hiệu LoraWAN:
                    </span>
                    <span className="text-foreground">{dev.signalStrength}</span>
                  </div>
                  <div className="w-full bg-border-deep h-1.5 rounded-[1px] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        dev.signalPercent < 40 ? "bg-alert-crimson" : "bg-primary"
                      }`}
                      style={{ width: `${dev.signalPercent}%` }}
                    />
                  </div>
                </div>

                {/* MicroSD Storage */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between font-bold">
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3.5 w-3.5 text-primary" /> Cache Bộ nhớ đệm:
                    </span>
                    <span className="text-foreground">
                      {dev.storageUsed} GB / {dev.storageTotal} GB
                    </span>
                  </div>
                  <div className="w-full bg-border-deep h-1.5 rounded-[1px] overflow-hidden">
                    <div
                      className="h-full bg-primary/80"
                      style={{ width: `${(dev.storageUsed / dev.storageTotal) * 100}%` }}
                    />
                  </div>
                  <div className="text-[7px] text-foreground/40 font-sans pl-1">
                    microSD Class 10 • Auto-pruning active (prunes archives after 7 days)
                  </div>
                </div>

                {/* CPU & RAM */}
                <div className="border-t border-border-deep/50 pt-3 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-foreground/45 flex items-center gap-1 mb-1 font-bold">
                      <Cpu className="h-3 w-3 text-primary" /> Tải CPU (Model):
                    </div>
                    <div className="text-[11px] font-bold text-foreground font-mono">
                      {dev.cpuLoad}%
                    </div>
                    <div className="text-[7px] text-foreground/40 font-sans leading-none mt-1">
                      {dev.cpuLoad > 50 ? "ONNX Inference active" : "Power saving idle"}
                    </div>
                  </div>
                  <div>
                    <div className="text-foreground/45 flex items-center gap-1 mb-1 font-bold">
                      <Cpu className="h-3 w-3 text-primary" /> Bộ nhớ RAM:
                    </div>
                    <div className="text-[11px] font-bold text-foreground font-mono">
                      {dev.ramUsed} MB / {dev.ramTotal} MB
                    </div>
                  </div>
                </div>

                {/* Environment Temp/Humidity sensors inside case */}
                <div className="border-t border-border-deep/50 pt-3 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-1.5">
                    <Thermometer className="h-3.5 w-3.5 text-primary" />
                    <div>
                      <div className="text-[7px] text-foreground/40 uppercase">Nhiệt độ Case</div>
                      <div className={`font-bold text-[10px] ${dev.temp > 30 ? "text-warning-amber" : "text-foreground"}`}>
                        {dev.temp}°C
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Droplets className="h-3.5 w-3.5 text-primary" />
                    <div>
                      <div className="text-[7px] text-foreground/40 uppercase">Độ ẩm vỏ</div>
                      <div className="font-bold text-[10px] text-foreground">
                        {dev.humidity}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Diagnostic log footer */}
              <div className="border-t border-border-deep pt-3 mt-1 text-[8px] text-foreground/40 flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${isAlert ? "bg-alert-crimson animate-ping" : "bg-primary"}`} />
                  <span>Mic Health: {dev.micHealth}</span>
                </div>
                <div>OS: Alpine Linux 3.19 • kernel 6.1-rt</div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer warning alert info strip */}
      <div className="p-4 border border-border-deep bg-background text-[10px] text-foreground/50 rounded-[2px] leading-relaxed flex items-start gap-2.5">
        <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="font-sans">
          <span className="text-primary font-bold font-mono uppercase">[CHẨN ĐOÁN HỆ THỐNG]:</span> Tất cả trạm cảm biến được triển khai với tính năng watchdog sạc tự động. Trạm C (Rừng Già) đang ở trạng thái báo động do dòng điện sạc đầu vào bất thường (không sinh dòng từ Solar Panel) kết hợp với các cảnh báo âm thanh của cưa xích. Lực lượng kiểm lâm cần mang theo pin dự phòng thay thế khi tiến hành phái tuần tra.
        </div>
      </div>
    </div>
  );
}
export default DashboardDevices;
