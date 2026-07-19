"use client";

import React, { useState } from "react";
import { Compass, Wifi, Battery, Thermometer, Radio } from "lucide-react";
import { SENSORS } from "@/hooks/useDashboardState";

interface GeoMapProps {
  activeSensor: string;
  setActiveSensor: (sensorId: string) => void;
  hasAlert: boolean;
}

const STATION_DIAGNOSTICS: Record<
  string,
  {
    name: string;
    lat: string;
    lng: string;
    battery: number;
    solarStatus: string;
    signalStrength: string;
    micHealth: string;
    temp: number;
    humidity: number;
  }
> = {
  "demo-sensor-1": {
    name: "Trạm A - Suối Lớn",
    lat: "20°14'14.3\"N",
    lng: "105°36'56.5\"E",
    battery: 84,
    solarStatus: "Đang sạc (Pin Mặt Trời 15W)",
    signalStrength: "-72 dBm (Tốt)",
    micHealth: "Hoạt động tốt (100%)",
    temp: 28.4,
    humidity: 82,
  },
  "demo-sensor-2": {
    name: "Trạm B - Đỉnh Mây",
    lat: "20°14'27.6\"N",
    lng: "105°37'12.0\"E",
    battery: 91,
    solarStatus: "Đang sạc (Pin Mặt Trời 15W)",
    signalStrength: "-68 dBm (Rất tốt)",
    micHealth: "Hoạt động tốt (100%)",
    temp: 24.1,
    humidity: 78,
  },
  "demo-sensor-3": {
    name: "Trạm C - Rừng Già",
    lat: "20°14'06.0\"N",
    lng: "105°36'36.0\"E",
    battery: 12,
    solarStatus: "Lỗi Mạch Sạc (Cưa Máy Gây Hại?)",
    signalStrength: "-94 dBm (Yếu)",
    micHealth: "Độ nhạy suy giảm (50%)",
    temp: 31.8,
    humidity: 85,
  },
};

export function GeoMap({ activeSensor, setActiveSensor, hasAlert }: GeoMapProps) {
  const [hoveredSensor, setHoveredSensor] = useState<string | null>(null);

  // Retrieve diagnostics only if a sensor is hovered
  const diag = hoveredSensor ? STATION_DIAGNOSTICS[hoveredSensor] : null;

  return (
    <div className="border border-border-deep bg-panel-bg p-5 rounded-[2px] relative shadow-lg">
      <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-border-deep text-[8px] font-mono text-foreground/40 border-l border-b border-border-deep rounded-bl-[2px]">
        GEO RADAR GIS
      </div>
      <h2 className="text-xs font-bold font-mono tracking-widest text-foreground/80 mb-3 flex items-center gap-2 uppercase">
        <Compass className="h-4 w-4 text-primary" /> Bản đồ định vị VQG Cúc Phương
      </h2>

      {/* Larger Map Area */}
      <div className="relative w-full h-64 bg-background border border-border-deep rounded-[2px] overflow-hidden flex items-center justify-center">
        {/* Sonar Radar Screen grids */}
        <svg className="w-full h-full opacity-80" viewBox="0 0 300 240">
          <defs>
            <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="rgba(0, 255, 143, 0.025)"
                strokeWidth="0.75"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mapGrid)" />

          {/* Concentric sonar range lines */}
          <circle
            cx="150"
            cy="120"
            r="110"
            fill="none"
            stroke="rgba(0, 255, 143, 0.04)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <circle
            cx="150"
            cy="120"
            r="70"
            fill="none"
            stroke="rgba(0, 255, 143, 0.04)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <circle
            cx="150"
            cy="120"
            r="30"
            fill="none"
            stroke="rgba(0, 255, 143, 0.04)"
            strokeWidth="1"
          />

          {/* Radar static crosshairs (completely static to avoid animation glitches) */}
          <line
            x1="150"
            y1="10"
            x2="150"
            y2="230"
            stroke="rgba(0, 255, 143, 0.05)"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />
          <line
            x1="10"
            y1="120"
            x2="290"
            y2="120"
            stroke="rgba(0, 255, 143, 0.05)"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />

          {/* Cúc Phương border mock shape */}
          <path
            d="M 25 110 Q 55 35 125 65 T 225 50 T 275 160 T 145 220 T 35 190 Z"
            fill="none"
            stroke="rgba(0, 255, 143, 0.15)"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />

          {/* Topographic Lines */}
          <path
            d="M 45 120 Q 85 80 155 110 T 245 100"
            fill="none"
            stroke="rgba(0, 255, 143, 0.05)"
            strokeWidth="0.75"
          />
          <path
            d="M 55 145 Q 105 115 175 145 T 265 135"
            fill="none"
            stroke="rgba(0, 255, 143, 0.05)"
            strokeWidth="0.75"
          />

          {/* Map Labels */}
          <text
            x="35"
            y="210"
            fill="rgba(0, 255, 143, 0.25)"
            fontSize="7"
            fontFamily="monospace"
            fontWeight="bold"
            className="pointer-events-none"
          >
            VQG CÚC PHƯƠNG - PHÂN KHU TÂY
          </text>
          <text
            x="175"
            y="35"
            fill="rgba(0, 255, 143, 0.15)"
            fontSize="6"
            fontFamily="monospace"
            className="pointer-events-none"
          >
            SECTOR BẢO VỆ I
          </text>

          {/* Connections between sensors */}
          <line
            x1="80"
            y1="90"
            x2="160"
            y2="60"
            stroke="rgba(0, 255, 143, 0.08)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <line
            x1="160"
            y1="60"
            x2="220"
            y2="140"
            stroke="rgba(0, 255, 143, 0.08)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <line
            x1="80"
            y1="90"
            x2="220"
            y2="140"
            stroke="rgba(0, 255, 143, 0.08)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Station A Node - Suối Lớn */}
          <g className="cursor-pointer">
            {/* Stable invisible target to prevent flickering */}
            <circle
              cx="80"
              cy="90"
              r="18"
              fill="transparent"
              onMouseEnter={() => setHoveredSensor("demo-sensor-1")}
              onMouseLeave={() => setHoveredSensor(null)}
              onClick={() => setActiveSensor("demo-sensor-1")}
            />
            {hasAlert && activeSensor === "demo-sensor-1" ? (
              <>
                <circle
                  cx="80"
                  cy="90"
                  r="6.5"
                  fill="#f43f5e"
                  className="pointer-events-none"
                />
                <circle
                  cx="80"
                  cy="90"
                  r="14"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="1.2"
                  className="animate-ping pointer-events-none"
                />
              </>
            ) : (
              <circle
                cx="80"
                cy="90"
                r={activeSensor === "demo-sensor-1" ? "6" : "4"}
                fill={activeSensor === "demo-sensor-1" ? "#00ff8f" : "#059669"}
                className="pointer-events-none"
              />
            )}
            {activeSensor === "demo-sensor-1" && !hasAlert && (
              <circle
                cx="80"
                cy="90"
                r="11"
                fill="none"
                stroke="#00ff8f"
                strokeWidth="0.5"
                className="animate-ping pointer-events-none"
              />
            )}
            <text
              x="60"
              y="78"
              fill={
                hasAlert && activeSensor === "demo-sensor-1"
                  ? "#f43f5e"
                  : activeSensor === "demo-sensor-1"
                  ? "#00ff8f"
                  : "rgba(226, 232, 240, 0.4)"
              }
              fontSize="6"
              fontFamily="monospace"
              fontWeight="bold"
              className="pointer-events-none"
            >
              TRẠM A {hasAlert && activeSensor === "demo-sensor-1" && "(ALARM)"}
            </text>
          </g>
 
          {/* Station B Node - Đỉnh Mây */}
          <g className="cursor-pointer">
            {/* Stable invisible target to prevent flickering */}
            <circle
              cx="160"
              cy="60"
              r="18"
              fill="transparent"
              onMouseEnter={() => setHoveredSensor("demo-sensor-2")}
              onMouseLeave={() => setHoveredSensor(null)}
              onClick={() => setActiveSensor("demo-sensor-2")}
            />
            {hasAlert && activeSensor === "demo-sensor-2" ? (
              <>
                <circle
                  cx="160"
                  cy="60"
                  r="6.5"
                  fill="#f43f5e"
                  className="pointer-events-none"
                />
                <circle
                  cx="160"
                  cy="60"
                  r="14"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="1.2"
                  className="animate-ping pointer-events-none"
                />
              </>
            ) : (
              <circle
                cx="160"
                cy="60"
                r={activeSensor === "demo-sensor-2" ? "6" : "4"}
                fill={activeSensor === "demo-sensor-2" ? "#00ff8f" : "#059669"}
                className="pointer-events-none"
              />
            )}
            {activeSensor === "demo-sensor-2" && !hasAlert && (
              <circle
                cx="160"
                cy="60"
                r="11"
                fill="none"
                stroke="#00ff8f"
                strokeWidth="0.5"
                className="animate-ping pointer-events-none"
              />
            )}
            <text
              x="140"
              y="48"
              fill={
                hasAlert && activeSensor === "demo-sensor-2"
                  ? "#f43f5e"
                  : activeSensor === "demo-sensor-2"
                  ? "#00ff8f"
                  : "rgba(226, 232, 240, 0.4)"
              }
              fontSize="6"
              fontFamily="monospace"
              fontWeight="bold"
              className="pointer-events-none"
            >
              TRẠM B {hasAlert && activeSensor === "demo-sensor-2" && "(ALARM)"}
            </text>
          </g>
 
          {/* Station C Node - Rừng Già */}
          <g className="cursor-pointer">
            {/* Stable invisible target to prevent flickering */}
            <circle
              cx="220"
              cy="140"
              r="18"
              fill="transparent"
              onMouseEnter={() => setHoveredSensor("demo-sensor-3")}
              onMouseLeave={() => setHoveredSensor(null)}
              onClick={() => setActiveSensor("demo-sensor-3")}
            />
            {hasAlert && activeSensor === "demo-sensor-3" ? (
              <>
                <circle
                  cx="220"
                  cy="140"
                  r="6.5"
                  fill="#f43f5e"
                  className="pointer-events-none"
                />
                <circle
                  cx="220"
                  cy="140"
                  r="14"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="1.2"
                  className="animate-ping pointer-events-none"
                />
              </>
            ) : (
              <circle
                cx="220"
                cy="140"
                r={activeSensor === "demo-sensor-3" ? "6" : "4"}
                fill={activeSensor === "demo-sensor-3" ? "#00ff8f" : "#059669"}
                className="pointer-events-none"
              />
            )}
            {activeSensor === "demo-sensor-3" && !hasAlert && (
              <circle
                cx="220"
                cy="140"
                r="11"
                fill="none"
                stroke="#00ff8f"
                strokeWidth="0.5"
                className="animate-ping pointer-events-none"
              />
            )}
            <text
              x="195"
              y="155"
              fill={
                hasAlert && activeSensor === "demo-sensor-3"
                  ? "#f43f5e"
                  : activeSensor === "demo-sensor-3"
                  ? "#00ff8f"
                  : "rgba(226, 232, 240, 0.4)"
              }
              fontSize="6"
              fontFamily="monospace"
              fontWeight="bold"
              className="pointer-events-none"
            >
              TRẠM C {hasAlert && activeSensor === "demo-sensor-3" && "(ALARM)"}
            </text>
          </g>
        </svg>

        {/* Floating Telemetry HUD Tooltip - Rendered ONLY on hover */}
        {diag && (
          <div className="absolute top-2 right-2 w-48 bg-[#090d0b]/95 border border-primary/30 p-2.5 font-mono text-[9px] rounded-[2px] shadow-lg flex flex-col gap-1.5 backdrop-blur-md z-20 animate-fade-in pointer-events-none">
            <div className="text-[10px] font-bold text-primary border-b border-border-deep pb-1 flex justify-between items-center">
              <span>{diag.name.toUpperCase()}</span>
              <span className="text-[7px] bg-primary/20 text-primary px-1.5 py-0.1 border border-primary/30 rounded-[1px] font-semibold">
                TELEMETRY
              </span>
            </div>

            <div className="flex flex-col gap-1 text-foreground/75">
              <div className="flex justify-between items-center">
                <span className="text-foreground/45 flex items-center gap-1">
                  <Battery className="h-3 w-3 text-primary" /> Năng lượng:
                </span>
                <span
                  className={`font-bold ${
                    diag.battery < 20 ? "text-alert-crimson animate-pulse" : "text-primary"
                  }`}
                >
                  {diag.battery}%
                </span>
              </div>
              <div className="text-[7px] text-foreground/45 font-sans leading-none -mt-1 ml-4 border-l border-border-deep pl-1">
                {diag.solarStatus}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-foreground/45 flex items-center gap-1">
                  <Wifi className="h-3 w-3 text-primary" /> Sóng Lora:
                </span>
                <span className="font-bold text-foreground">{diag.signalStrength}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-foreground/45 flex items-center gap-1">
                  <Radio className="h-3 w-3 text-primary" /> Mic Health:
                </span>
                <span className="font-bold text-foreground">{diag.micHealth}</span>
              </div>

              <div className="flex justify-between items-center border-t border-border-deep/50 pt-1">
                <span className="text-foreground/45 flex items-center gap-1">
                  <Thermometer className="h-3.5 w-3.5 text-primary" /> Môi trường:
                </span>
                <span className="font-bold text-foreground">
                  {diag.temp}°C / {diag.humidity}% RH
                </span>
              </div>
            </div>

            <div className="text-[7px] text-foreground/30 font-mono flex flex-col border-t border-border-deep pt-1">
              <span>LAT: {diag.lat}</span>
              <span>LNG: {diag.lng}</span>
            </div>
          </div>
        )}

        {/* Small Active Selection bottom Indicator */}
        <div className="absolute bottom-2 left-2 font-mono text-[8px] text-foreground/45 bg-[#090d0b]/90 border border-border-deep p-1 rounded-[2px] pointer-events-none">
          ACTIVE:{" "}
          <span className="text-primary font-bold">
            {SENSORS.find((s) => s.id === activeSensor)?.name}
          </span>
        </div>
      </div>
    </div>
  );
}
export default GeoMap;
