/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Tv, Minus, Square, X, AlertCircle } from "lucide-react";

interface TitleBarProps {
  fileName: string;
  hasUnsavedChanges: boolean;
}

export default function TitleBar({ fileName, hasUnsavedChanges }: TitleBarProps) {
  const [notification, setNotification] = useState<string | null>(null);

  const showTooltip = (action: string) => {
    setNotification(
      `Masaüstü Modu: Bu işlem web tarayıcı çerçevesinde simüle edilmektedir. (${action})`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="relative">
      <div className="h-10 bg-[#18181c] border-b border-[#2d2d34] flex items-center justify-between px-3 select-none text-gray-300 text-xs font-sans">
        {/* Left: App Logo & Name */}
        <div className="flex items-center gap-2">
          <div className="bg-[#007acc] p-1 rounded text-white shadow-md">
            <Tv size={14} className="animate-pulse" />
          </div>
          <span className="font-semibold text-gray-100">IPTV M3U Liste Düzenleyici</span>
          <span className="text-gray-500 font-mono text-[10px] bg-[#23232b] px-1.5 py-0.5 rounded border border-[#31313a]">
            WPF MVVM v1.0.0
          </span>
          <span className="text-gray-400 font-mono flex items-center gap-1.5 ml-2">
            <span>|</span>
            <span className="text-blue-400 font-medium">{fileName}</span>
            {hasUnsavedChanges && (
              <span className="text-amber-500 font-bold text-sm leading-none" title="Kaydedilmemiş Değişiklikler Var">*</span>
            )}
          </span>
        </div>

        {/* Center: Draggable region mock */}
        <div className="flex-1 h-full cursor-move" title="Pencereyi Taşımak için Sürükleyin (Web Simülasyonu)" />

        {/* Right: Window control buttons (WPF mimic) */}
        <div className="flex items-center h-full -mr-3">
          <button
            onClick={() => showTooltip("Minimize")}
            className="h-10 px-4 flex items-center justify-center hover:bg-[#2e2e38] active:bg-[#3d3d4a] text-gray-400 hover:text-white transition-colors"
            title="Simge Durumuna Küçült"
          >
            <Minus size={12} />
          </button>
          <button
            onClick={() => showTooltip("Maximize")}
            className="h-10 px-4 flex items-center justify-center hover:bg-[#2e2e38] active:bg-[#3d3d4a] text-gray-400 hover:text-white transition-colors"
            title="Ekranı Kapla"
          >
            <Square size={10} />
          </button>
          <button
            onClick={() => showTooltip("Kapat")}
            className="h-10 px-4 flex items-center justify-center hover:bg-[#e81123] active:bg-[#f1707a] text-gray-400 hover:text-white transition-colors"
            title="Pencereyi Kapat"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Floating System Notification overlay */}
      {notification && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-[#1e1e24] border border-[#3e3e4a] text-gray-200 text-xs px-3 py-2 rounded shadow-2xl flex items-center gap-2 max-w-md animate-in fade-in slide-in-from-top-2 duration-200">
          <AlertCircle size={14} className="text-[#007acc] shrink-0" />
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
}
