/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { X, Tv, HelpCircle, Layers, FileUp, Download, Check, AlertCircle } from "lucide-react";
import { parseM3U } from "../utils/m3uParser";
import { ChannelEntry } from "../types";

// Common Modal Backdrop
interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function ModalWrapper({ isOpen, onClose, title, children }: ModalWrapperProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#1e1e24] border border-[#3e3e4a] rounded-lg shadow-2xl w-full max-w-md overflow-hidden text-gray-200 flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#18181c] px-4 py-3 border-b border-[#2d2d34] flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-100 flex items-center gap-2">{title}</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-[#2d2d38] p-1 rounded transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[80vh] text-xs leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

// 1. About Modal Component
interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="IPTV M3U Liste Düzenleyici Hakkında">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="bg-[#007acc] p-3 rounded-full text-white shadow-lg shadow-[#007acc]/20">
          <Tv size={36} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">IPTV M3U Liste Düzenleyici v1.0.0</h3>
          <p className="text-[10px] text-gray-500 font-mono mt-0.5">WPF MVVM Tasarım Kalıbı Simülasyonu</p>
        </div>

        <div className="h-[1px] w-full bg-[#2d2d34] my-1" />

        <p className="text-gray-300">
          Bu uygulama, C# (.NET 8) ve WPF (Windows Presentation Foundation) kullanılarak geliştirilmiş bir masaüstü uygulamasının modern web simülasyonudur. MVVM tasarım kalıbı (Model-View-ViewModel) esas alınarak kodlanmıştır.
        </p>

        <div className="grid grid-cols-2 gap-2 w-full text-left mt-2">
          <div className="bg-[#16161a] p-2 rounded border border-[#2d2d34]">
            <span className="text-[10px] text-gray-500 block uppercase font-mono">Altyapı</span>
            <span className="font-semibold text-gray-200">.NET 8.0 & WPF</span>
          </div>
          <div className="bg-[#16161a] p-2 rounded border border-[#2d2d34]">
            <span className="text-[10px] text-gray-500 block uppercase font-mono">Desen / Pattern</span>
            <span className="font-semibold text-gray-200">MVVM Architecture</span>
          </div>
          <div className="bg-[#16161a] p-2 rounded border border-[#2d2d34]">
            <span className="text-[10px] text-gray-500 block uppercase font-mono">Sürüm</span>
            <span className="font-semibold text-[#007acc]">Single EXE (Self-Contained)</span>
          </div>
          <div className="bg-[#16161a] p-2 rounded border border-[#2d2d34]">
            <span className="text-[10px] text-gray-500 block uppercase font-mono">Lisans</span>
            <span className="font-semibold text-gray-200">Apache-2.0</span>
          </div>
        </div>

        <p className="text-[10px] text-gray-500 mt-3 italic">
          Geliştirici: Google AI Studio Build - 2026
        </p>

        <button
          onClick={onClose}
          className="mt-2 w-full bg-[#007acc] hover:bg-[#0062a3] text-white py-2 rounded font-medium transition-colors"
        >
          Kapat
        </button>
      </div>
    </ModalWrapper>
  );
}

// 2. Save As Modal Component
interface SaveAsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFileName: string;
  onConfirm: (newFileName: string) => void;
}

export function SaveAsModal({ isOpen, onClose, currentFileName, onConfirm }: SaveAsModalProps) {
  const [fileNameInput, setFileNameInput] = useState(currentFileName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalName = fileNameInput.trim();
    if (!finalName) {
      finalName = "yeni_liste.m3u";
    }
    if (!finalName.toLowerCase().endsWith(".m3u") && !finalName.toLowerCase().endsWith(".m3u8")) {
      finalName += ".m3u";
    }
    onConfirm(finalName);
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Farklı Kaydet">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-gray-400 block font-medium">Yeni Dosya Adı:</label>
          <input
            type="text"
            value={fileNameInput}
            onChange={(e) => setFileNameInput(e.target.value)}
            placeholder="örnek_liste.m3u"
            className="w-full bg-[#16161a] border border-[#3e3e4a] rounded px-3 py-2 text-white focus:outline-none focus:border-[#007acc]"
            autoFocus
          />
          <span className="text-[10px] text-gray-500 block">
            Uzantısı belirtilmezse otomatik olarak <strong>.m3u</strong> eklenecektir.
          </span>
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-[#2b2b35] hover:bg-[#383845] text-gray-300 py-2 rounded transition-colors"
          >
            Vazgeç
          </button>
          <button
            type="submit"
            className="flex-1 bg-[#007acc] hover:bg-[#0062a3] text-white py-2 rounded font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download size={14} />
            <span>Kaydet ve İndir</span>
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

// 3. Merge Modal Component
interface MergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmMerge: (newChannels: ChannelEntry[], removeDuplicates: boolean) => void;
}

export function MergeModal({ isOpen, onClose, onConfirmMerge }: MergeModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [parsedChannels, setParsedChannels] = useState<ChannelEntry[]>([]);
  const [loadedFileName, setLoadedFileName] = useState("");
  const [removeDupes, setRemoveDupes] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseM3U(text || "", file.name);
      setParsedChannels(parsed.channels);
      setLoadedFileName(file.name);
    };
    reader.readAsText(file);
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const triggerFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleConfirm = () => {
    if (parsedChannels.length > 0) {
      onConfirmMerge(parsedChannels, removeDupes);
      // reset local state
      setParsedChannels([]);
      setLoadedFileName("");
      onClose();
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Başka M3U Listesi Birleştir">
      <div className="space-y-4">
        <p className="text-gray-400">
          Mevcut kanal listenizin sonuna eklemek istediğiniz ikinci bir M3U dosyasını yükleyin.
        </p>

        {/* Drag and Drop Box */}
        {!loadedFileName ? (
          <div
            onDragEnter={onDrag}
            onDragOver={onDrag}
            onDragLeave={onDrag}
            onDrop={onDrop}
            onClick={triggerFileClick}
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-colors ${
              dragActive
                ? "border-[#007acc] bg-[#1a2d3c]/50 text-white"
                : "border-[#3e3e4a] hover:border-[#525262] bg-[#16161a] hover:bg-[#1b1b22] text-gray-400"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".m3u,.m3u8,text/plain"
              onChange={onFileSelect}
              className="hidden"
            />
            <FileUp size={24} className="text-gray-500" />
            <span className="font-semibold text-gray-300">İkinci M3U Dosyasını Sürükleyin</span>
            <span className="text-[10px]">veya seçmek için tıklayın</span>
          </div>
        ) : (
          <div className="bg-[#16161a] p-3 rounded border border-[#2d2d34] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-500 block uppercase font-mono">Seçilen Dosya</span>
              <button
                onClick={() => {
                  setLoadedFileName("");
                  setParsedChannels([]);
                }}
                className="text-red-400 hover:text-red-300 text-[10px] font-semibold underline"
              >
                Kaldır
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-100 truncate pr-2">{loadedFileName}</span>
              <span className="bg-[#007acc] text-white px-2 py-0.5 rounded text-[10px] font-mono shrink-0">
                {parsedChannels.length} Kanal Bulundu
              </span>
            </div>

            {/* Merge options */}
            <div className="pt-2 flex items-center gap-2 border-t border-[#23232a] mt-2">
              <input
                type="checkbox"
                id="remove-dupes-check"
                checked={removeDupes}
                onChange={(e) => setRemoveDupes(e.target.checked)}
                className="rounded text-[#007acc] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="remove-dupes-check" className="text-gray-300 cursor-pointer text-[11px]">
                Çakışan (yinelenen) adresleri ekleme (otomatik süz)
              </label>
            </div>
          </div>
        )}

        <div className="flex gap-2.5 pt-2">
          <button
            onClick={() => {
              setLoadedFileName("");
              setParsedChannels([]);
              onClose();
            }}
            className="flex-1 bg-[#2b2b35] hover:bg-[#383845] text-gray-300 py-2 rounded transition-colors"
          >
            Vazgeç
          </button>
          <button
            onClick={handleConfirm}
            disabled={parsedChannels.length === 0}
            className={`flex-1 py-2 rounded font-medium flex items-center justify-center gap-1.5 transition-colors ${
              parsedChannels.length === 0
                ? "bg-[#16161a] text-gray-600 border border-[#2d2d34] cursor-not-allowed"
                : "bg-green-700 hover:bg-green-600 text-white"
            }`}
          >
            <Check size={14} />
            <span>Birleştirmeyi Tamamla</span>
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
