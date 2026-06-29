/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { FolderOpen, Save, FilePlus, LogOut, HelpCircle, AlertCircle, Trash2, Plus, RefreshCw, Layers } from "lucide-react";

interface MenuBarProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onAddChannel: () => void;
  onDeduplicate: () => void;
  onMerge: () => void;
  onDeleteSelected: () => void;
  onAbout: () => void;
}

export default function MenuBar({
  onNew,
  onOpen,
  onSave,
  onSaveAs,
  onAddChannel,
  onDeduplicate,
  onMerge,
  onDeleteSelected,
  onAbout,
}: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (menuName: string) => {
    if (activeMenu === menuName) {
      setActiveMenu(null);
    } else {
      setActiveMenu(menuName);
    }
  };

  const handleMouseEnter = (menuName: string) => {
    if (activeMenu !== null) {
      setActiveMenu(menuName);
    }
  };

  const handleAction = (action: () => void) => {
    setActiveMenu(null);
    action();
  };

  return (
    <div
      ref={containerRef}
      className="h-6 bg-[#1e1e24] border-b border-[#2d2d34] flex items-center px-2 select-none text-xs text-gray-300 font-sans z-30 relative"
    >
      {/* File Menu */}
      <div className="relative">
        <button
          onClick={() => toggleMenu("Dosya")}
          onMouseEnter={() => handleMouseEnter("Dosya")}
          className={`px-3 py-0.5 rounded cursor-default hover:bg-[#2d2d38] hover:text-white transition-colors ${
            activeMenu === "Dosya" ? "bg-[#007acc] text-white hover:bg-[#007acc]" : ""
          }`}
        >
          Dosya
        </button>
        {activeMenu === "Dosya" && (
          <div className="absolute left-0 mt-1 w-64 bg-[#1b1b20] border border-[#3c3c46] rounded shadow-2xl py-1 z-50 text-gray-200">
            <button
              onClick={() => handleAction(onNew)}
              className="w-full text-left px-3 py-1.5 hover:bg-[#007acc] hover:text-white flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <FilePlus size={13} className="text-gray-400 group-hover:text-white" />
                <span>Yeni Liste Oluştur</span>
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Ctrl+N</span>
            </button>
            <button
              onClick={() => handleAction(onOpen)}
              className="w-full text-left px-3 py-1.5 hover:bg-[#007acc] hover:text-white flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <FolderOpen size={13} className="text-gray-400" />
                <span>M3U Dosyası Aç...</span>
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Ctrl+O</span>
            </button>
            <div className="h-[1px] bg-[#2d2d34] my-1" />
            <button
              onClick={() => handleAction(onSave)}
              className="w-full text-left px-3 py-1.5 hover:bg-[#007acc] hover:text-white flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Save size={13} className="text-gray-400" />
                <span>Değişiklikleri Kaydet</span>
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Ctrl+S</span>
            </button>
            <button
              onClick={() => handleAction(onSaveAs)}
              className="w-full text-left px-3 py-1.5 hover:bg-[#007acc] hover:text-white flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Save size={13} className="text-gray-400" />
                <span>Farklı Kaydet...</span>
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Ctrl+Shift+S</span>
            </button>
            <div className="h-[1px] bg-[#2d2d34] my-1" />
            <button
              onClick={() => handleAction(() => {
                if (confirm("Uygulamadan çıkmak istiyor musunuz? Kaydedilmemiş değişiklikler kaybolabilir.")) {
                  window.close();
                  alert("Çıkış yapıldı! Tarayıcı sekmesini kapatabilirsiniz.");
                }
              })}
              className="w-full text-left px-3 py-1.5 hover:bg-[#e81123] hover:text-white flex items-center gap-2"
            >
              <LogOut size={13} className="text-red-400" />
              <span>Çıkış (Kapat)</span>
            </button>
          </div>
        )}
      </div>

      {/* Operations Menu */}
      <div className="relative">
        <button
          onClick={() => toggleMenu("İşlemler")}
          onMouseEnter={() => handleMouseEnter("İşlemler")}
          className={`px-3 py-0.5 rounded cursor-default hover:bg-[#2d2d38] hover:text-white transition-colors ${
            activeMenu === "İşlemler" ? "bg-[#007acc] text-white hover:bg-[#007acc]" : ""
          }`}
        >
          İşlemler
        </button>
        {activeMenu === "İşlemler" && (
          <div className="absolute left-0 mt-1 w-64 bg-[#1b1b20] border border-[#3c3c46] rounded shadow-2xl py-1 z-50 text-gray-200">
            <button
              onClick={() => handleAction(onAddChannel)}
              className="w-full text-left px-3 py-1.5 hover:bg-[#007acc] hover:text-white flex items-center gap-2"
            >
              <Plus size={13} className="text-green-500" />
              <span>Yeni Kanal Ekle</span>
            </button>
            <button
              onClick={() => handleAction(onDeduplicate)}
              className="w-full text-left px-3 py-1.5 hover:bg-[#007acc] hover:text-white flex items-center gap-2"
            >
              <RefreshCw size={13} className="text-blue-400" />
              <span>Yinelenen Linkleri Kaldır</span>
            </button>
            <button
              onClick={() => handleAction(onMerge)}
              className="w-full text-left px-3 py-1.5 hover:bg-[#007acc] hover:text-white flex items-center gap-2"
            >
              <Layers size={13} className="text-purple-400" />
              <span>Başka Liste Birleştir...</span>
            </button>
            <div className="h-[1px] bg-[#2d2d34] my-1" />
            <button
              onClick={() => handleAction(onDeleteSelected)}
              className="w-full text-left px-3 py-1.5 hover:bg-[#e81123] hover:text-white flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Trash2 size={13} className="text-red-500" />
                <span>Seçili Kanalları Sil</span>
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Help Menu */}
      <div className="relative">
        <button
          onClick={() => toggleMenu("Yardım")}
          onMouseEnter={() => handleMouseEnter("Yardım")}
          className={`px-3 py-0.5 rounded cursor-default hover:bg-[#2d2d38] hover:text-white transition-colors ${
            activeMenu === "Yardım" ? "bg-[#007acc] text-white hover:bg-[#007acc]" : ""
          }`}
        >
          Yardım
        </button>
        {activeMenu === "Yardım" && (
          <div className="absolute left-0 mt-1 w-56 bg-[#1b1b20] border border-[#3c3c46] rounded shadow-2xl py-1 z-50 text-gray-200">
            <button
              onClick={() => handleAction(onAbout)}
              className="w-full text-left px-3 py-1.5 hover:bg-[#007acc] hover:text-white flex items-center gap-2"
            >
              <HelpCircle size={13} className="text-yellow-400" />
              <span>Hakkında</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
