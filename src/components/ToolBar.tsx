/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from "react";
import {
  FolderOpen,
  Save,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
  RefreshCw,
  Search,
  X,
  FileCheck
} from "lucide-react";

interface ToolBarProps {
  onOpenClick: () => void;
  onSaveClick: () => void;
  onSaveAsClick: () => void;
  onAddClick: () => void;
  onDeleteClick: () => void;
  onMoveUpClick: () => void;
  onMoveDownClick: () => void;
  onMergeClick: () => void;
  onDeduplicateClick: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  isUpDisabled: boolean;
  isDownDisabled: boolean;
  isDeleteDisabled: boolean;
}

export default function ToolBar({
  onOpenClick,
  onSaveClick,
  onSaveAsClick,
  onAddClick,
  onDeleteClick,
  onMoveUpClick,
  onMoveDownClick,
  onMergeClick,
  onDeduplicateClick,
  searchTerm,
  onSearchChange,
  isUpDisabled,
  isDownDisabled,
  isDeleteDisabled,
}: ToolBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileOpen = () => {
    onOpenClick();
  };

  return (
    <div className="bg-[#202026] border-b border-[#2d2d34] p-2 flex flex-wrap items-center justify-between gap-y-2 select-none z-10">
      {/* Action Buttons Group */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* File actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={triggerFileOpen}
            className="flex items-center gap-1.5 bg-[#2b2b35] hover:bg-[#383845] active:bg-[#007acc] text-gray-200 hover:text-white px-2.5 py-1.5 rounded border border-[#3e3e4a] text-xs font-medium cursor-default transition-all duration-100"
            title="Bilgisayarınızdan bir M3U / M3U8 listesi seçip açın (Ctrl+O)"
          >
            <FolderOpen size={14} className="text-blue-400" />
            <span className="hidden sm:inline">Dosya Aç</span>
          </button>

          <button
            onClick={onSaveClick}
            className="flex items-center gap-1.5 bg-[#2b2b35] hover:bg-[#383845] active:bg-[#007acc] text-gray-200 hover:text-white px-2.5 py-1.5 rounded border border-[#3e3e4a] text-xs font-medium cursor-default transition-all duration-100"
            title="Değişiklikleri mevcut dosyaya kaydet (Ctrl+S)"
          >
            <Save size={14} className="text-green-400" />
            <span className="hidden sm:inline">Kaydet</span>
          </button>

          <button
            onClick={onSaveAsClick}
            className="flex items-center gap-1.5 bg-[#2b2b35] hover:bg-[#383845] active:bg-[#007acc] text-gray-200 hover:text-white px-2.5 py-1.5 rounded border border-[#3e3e4a] text-xs font-medium cursor-default transition-all duration-100"
            title="Listeyi yeni bir dosya olarak indir (Ctrl+Shift+S)"
          >
            <FileCheck size={14} className="text-emerald-400" />
            <span className="hidden sm:inline">Farklı Kaydet</span>
          </button>
        </div>

        {/* Separator */}
        <div className="h-6 w-[1px] bg-[#31313c] mx-1 hidden sm:block" />

        {/* List Operations */}
        <div className="flex items-center gap-1">
          <button
            onClick={onAddClick}
            className="flex items-center gap-1.5 bg-[#2b2b35] hover:bg-[#383845] active:bg-green-700 text-gray-200 hover:text-white px-2.5 py-1.5 rounded border border-[#3e3e4a] text-xs font-medium cursor-default transition-all duration-100"
            title="Tabloya yeni boş bir kanal satırı ekle"
          >
            <Plus size={14} className="text-green-500" />
            <span>Kanal Ekle</span>
          </button>

          <button
            onClick={onDeleteClick}
            disabled={isDeleteDisabled}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs font-medium cursor-default transition-all duration-100 ${
              isDeleteDisabled
                ? "bg-[#18181e] text-gray-600 border-[#25252d] opacity-50"
                : "bg-[#2b2b35] hover:bg-red-950/40 hover:border-red-900 active:bg-red-800 text-gray-200 hover:text-red-200 border-[#3e3e4a]"
            }`}
            title="Seçili kanalları listeden sil (Delete)"
          >
            <Trash2 size={14} className={isDeleteDisabled ? "text-gray-600" : "text-red-400"} />
            <span>Seçilileri Sil</span>
          </button>
        </div>

        {/* Separator */}
        <div className="h-6 w-[1px] bg-[#31313c] mx-1 hidden sm:block" />

        {/* Reordering */}
        <div className="flex items-center gap-1">
          <button
            onClick={onMoveUpClick}
            disabled={isUpDisabled}
            className={`flex items-center gap-1 p-1.5 rounded border text-xs cursor-default transition-all duration-100 ${
              isUpDisabled
                ? "bg-[#18181e] text-gray-600 border-[#25252d] opacity-50"
                : "bg-[#2b2b35] hover:bg-[#383845] active:bg-[#007acc] text-gray-200 hover:text-white border-[#3e3e4a]"
            }`}
            title="Seçili kanalı listede yukarı taşı"
          >
            <ChevronUp size={15} />
          </button>

          <button
            onClick={onMoveDownClick}
            disabled={isDownDisabled}
            className={`flex items-center gap-1 p-1.5 rounded border text-xs cursor-default transition-all duration-100 ${
              isDownDisabled
                ? "bg-[#18181e] text-gray-600 border-[#25252d] opacity-50"
                : "bg-[#2b2b35] hover:bg-[#383845] active:bg-[#007acc] text-gray-200 hover:text-white border-[#3e3e4a]"
            }`}
            title="Seçili kanalı listede aşağı taşı"
          >
            <ChevronDown size={15} />
          </button>
        </div>

        {/* Separator */}
        <div className="h-6 w-[1px] bg-[#31313c] mx-1 hidden md:block" />

        {/* Advanced tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={onDeduplicateClick}
            className="flex items-center gap-1.5 bg-[#2b2b35] hover:bg-[#383845] active:bg-[#007acc] text-gray-200 hover:text-white px-2.5 py-1.5 rounded border border-[#3e3e4a] text-xs font-medium cursor-default transition-all duration-100"
            title="Listede aynı stream URL'sine sahip yinelenen kayıtları temizle"
          >
            <RefreshCw size={13} className="text-blue-400" />
            <span className="hidden md:inline">Yinelenenleri Temizle</span>
          </button>

          <button
            onClick={onMergeClick}
            className="flex items-center gap-1.5 bg-[#2b2b35] hover:bg-[#383845] active:bg-[#007acc] text-gray-200 hover:text-white px-2.5 py-1.5 rounded border border-[#3e3e4a] text-xs font-medium cursor-default transition-all duration-100"
            title="Mevcut listeye başka bir M3U dosyasındaki kanalları ilave et"
          >
            <Layers size={13} className="text-purple-400" />
            <span className="hidden md:inline">M3U Birleştir</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative flex items-center w-full max-w-xs md:max-w-sm shrink-0">
        <div className="absolute left-2.5 text-gray-400 pointer-events-none">
          <Search size={14} />
        </div>
        <input
          type="text"
          placeholder="Kanal adı, grup veya URL ara..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#16161a] text-gray-100 text-xs pl-8 pr-8 py-1.5 rounded border border-[#3e3e4a] focus:outline-none focus:border-[#007acc] placeholder-gray-500"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 text-gray-400 hover:text-white transition-colors"
            title="Aramayı Temizle"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
