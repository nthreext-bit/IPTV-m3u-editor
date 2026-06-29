/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { List, Filter, FileText, AlertTriangle } from "lucide-react";

interface StatusBarProps {
  totalCount: number;
  filteredCount: number;
  fileName: string;
  hasUnsavedChanges: boolean;
}

export default function StatusBar({
  totalCount,
  filteredCount,
  fileName,
  hasUnsavedChanges,
}: StatusBarProps) {
  return (
    <div className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 select-none text-[11px] font-sans border-t border-[#005c99]">
      {/* Left side: Counts */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5" title="Listede yüklü olan toplam kanal sayısı">
          <List size={11} />
          <span>Toplam Kanal:</span>
          <span className="font-semibold font-mono">{totalCount}</span>
        </div>

        <div className="flex items-center gap-1.5" title="Arama filtresine uyan kanal sayısı">
          <Filter size={11} />
          <span>Filtrelenen:</span>
          <span className="font-semibold font-mono">{filteredCount}</span>
        </div>
      </div>

      {/* Right side: Active File Path & Unsaved Changes Warning */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-mono" title="Mevcut çalışan dosya adı">
          <FileText size={11} />
          <span>Aktif Dosya:</span>
          <span className="bg-[#005c99] px-1.5 py-0.5 rounded text-gray-100 font-sans text-[10px]">
            {fileName}
          </span>
        </div>

        {hasUnsavedChanges ? (
          <div className="flex items-center gap-1 bg-[#d97706] text-white font-medium px-2 py-0.5 rounded animate-pulse" title="Kaydedilmemiş değişiklikler var! Çıkmadan veya yeni liste açmadan önce Kaydet butonuyla indirin.">
            <AlertTriangle size={11} />
            <span>* Değişiklikler Kaydedilmedi</span>
          </div>
        ) : (
          <div className="text-emerald-200 text-[10px] font-semibold flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            <span>Tüm Değişiklikler Kaydedildi</span>
          </div>
        )}
      </div>
    </div>
  );
}
