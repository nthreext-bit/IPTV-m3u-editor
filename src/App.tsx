/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import TitleBar from "./components/TitleBar";
import MenuBar from "./components/MenuBar";
import ToolBar from "./components/ToolBar";
import DataGrid from "./components/DataGrid";
import StatusBar from "./components/StatusBar";
import { AboutModal, SaveAsModal, MergeModal } from "./components/Modals";
import { ChannelEntry, M3UPlaylist } from "./types";
import { parseM3U, serializeM3U, generateId } from "./utils/m3uParser";
import { SAMPLE_M3U } from "./utils/sampleData";
import { Tv, Upload, FileCheck, RefreshCw, Layers, Check, Trash2, X, Sparkles } from "lucide-react";

interface ToastNotification {
  id: string;
  message: string;
  type: "success" | "warning" | "info";
}

export default function App() {
  // Playlist states
  const [channels, setChannels] = useState<ChannelEntry[]>([]);
  const [fileName, setFileName] = useState("yeni_liste.m3u");
  const [headerAttributes, setHeaderAttributes] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Interaction states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal open states
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSaveAsOpen, setIsSaveAsOpen] = useState(false);
  const [isMergeOpen, setIsMergeOpen] = useState(false);

  // Toast notifications list
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Drag and drop file onto window state
  const [isDraggingFileOverWindow, setIsDraggingFileOverWindow] = useState(false);

  // Hidden file input ref for loading list
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load sample M3U data on mount
  useEffect(() => {
    const parsed = parseM3U(SAMPLE_M3U, "ornek_iptv_listesi.m3u");
    setChannels(parsed.channels);
    setFileName(parsed.fileName);
    setHeaderAttributes(parsed.headerAttributes);
    setHasUnsavedChanges(false);
    
    addToast("Örnek IPTV listesi otomatik yüklendi. Hemen düzenlemeye başlayabilirsiniz!", "info", 5000);
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    function handleGlobalShortcuts(e: KeyboardEvent) {
      // Don't trigger shortcuts if editing cell text in grid
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key.toLowerCase() === "o") {
        e.preventDefault();
        handleOpenFileRequest();
      } else if (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setIsSaveAsOpen(true);
      } else if (cmdOrCtrl && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      } else if (cmdOrCtrl && e.key.toLowerCase() === "n") {
        e.preventDefault();
        handleNewList();
      }
    }

    window.addEventListener("keydown", handleGlobalShortcuts);
    return () => window.removeEventListener("keydown", handleGlobalShortcuts);
  }, [channels, fileName, headerAttributes, hasUnsavedChanges]);

  // Window close confirmation (for browser context)
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "Kaydedilmemiş değişiklikleriniz var. Çıkmak istediğinize emin misiniz?";
        return e.returnValue;
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Global Drag-and-Drop file listeners (for loading list directly by dragging onto browser window)
  const handleDragOverWindow = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer && e.dataTransfer.types.includes("Files")) {
      setIsDraggingFileOverWindow(true);
    }
  };

  const handleDragLeaveWindow = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only turn off if leaving window bounds or element dragging
    if (e.clientX <= 0 || e.clientY <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
      setIsDraggingFileOverWindow(false);
    }
  };

  const handleDropWindow = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFileOverWindow(false);

    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".m3u") || file.name.endsWith(".m3u8") || file.type === "text/plain") {
        loadM3UFile(file);
      } else {
        addToast("Desteklenmeyen dosya biçimi! Lütfen geçerli bir .m3u veya .m3u8 dosyası sürükleyin.", "warning");
      }
    }
  };

  useEffect(() => {
    window.addEventListener("dragover", handleDragOverWindow);
    window.addEventListener("dragleave", handleDragLeaveWindow);
    window.addEventListener("drop", handleDropWindow);

    return () => {
      window.removeEventListener("dragover", handleDragOverWindow);
      window.removeEventListener("dragleave", handleDragLeaveWindow);
      window.removeEventListener("drop", handleDropWindow);
    };
  }, [hasUnsavedChanges]);

  // Toast notifier helper
  const addToast = (message: string, type: "success" | "warning" | "info" = "success", duration = 4000) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  // Safe checks before discarding unsaved state
  const confirmActionIfUnsaved = (actionDescription: string): boolean => {
    if (hasUnsavedChanges) {
      return confirm(
        `Kaydedilmemiş değişiklikleriniz var. ${actionDescription} işlemine devam ederseniz bu değişiklikler kaybolacaktır.\n\nDevam etmek istiyor musunuz?`
      );
    }
    return true;
  };

  // Starts a fresh blank list
  const handleNewList = () => {
    if (!confirmActionIfUnsaved("Yeni Liste Oluşturma")) return;
    setChannels([]);
    setFileName("yeni_liste.m3u");
    setHeaderAttributes("");
    setHasUnsavedChanges(false);
    setSelectedIds(new Set());
    addToast("Yeni boş kanal listesi oluşturuldu.", "info");
  };

  // Triggers native file selection dialog
  const handleOpenFileRequest = () => {
    if (!confirmActionIfUnsaved("Dosya Açma")) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadM3UFile(e.target.files[0]);
    }
    // reset input so the same file can be opened again
    e.target.value = "";
  };

  // Parses and loads a file into the grid
  const loadM3UFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseM3U(text || "", file.name);
        setChannels(parsed.channels);
        setFileName(parsed.fileName);
        setHeaderAttributes(parsed.headerAttributes);
        setHasUnsavedChanges(false);
        setSelectedIds(new Set());
        addToast(`"${file.name}" dosyası açıldı. Toplam ${parsed.channels.length} kanal yüklendi.`, "success");
      } catch (err) {
        addToast("Dosya ayrıştırılırken bir hata oluştu. Lütfen geçerli bir M3U dosyası yükleyin.", "warning");
      }
    };
    reader.readAsText(file);
  };

  // Re-sequences all channels sequentially starting from index 1
  const resequenceChannels = (list: ChannelEntry[]): ChannelEntry[] => {
    return list.map((ch, idx) => ({
      ...ch,
      sequence: idx + 1,
    }));
  };

  // Saves (downloads) current data under the loaded file name
  const handleSave = () => {
    const playlist: M3UPlaylist = {
      fileName,
      headerAttributes,
      channels,
      hasUnsavedChanges: false,
    };
    const serialized = serializeM3U(playlist);
    
    // Create download link
    const blob = new Blob([serialized], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setHasUnsavedChanges(false);
    addToast(`"${fileName}" dosyası başarıyla kaydedildi ve indirildi.`, "success");
  };

  // Saves (downloads) current data under a customized file name
  const handleSaveAsConfirm = (newFileName: string) => {
    setFileName(newFileName);
    const playlist: M3UPlaylist = {
      fileName: newFileName,
      headerAttributes,
      channels,
      hasUnsavedChanges: false,
    };
    const serialized = serializeM3U(playlist);

    const blob = new Blob([serialized], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = newFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setHasUnsavedChanges(false);
    addToast(`Liste "${newFileName}" olarak başarıyla kaydedildi.`, "success");
  };

  // Adds a blank new row to the end of the channel list
  const handleAddChannel = () => {
    const newEntry: ChannelEntry = {
      id: generateId(),
      sequence: channels.length + 1,
      tvgId: "",
      tvgName: "",
      tvgLogo: "",
      groupTitle: "Grup Belirtilmedi",
      name: `Kanal ${channels.length + 1}`,
      url: "",
    };

    setChannels((prev) => [...prev, newEntry]);
    setHasUnsavedChanges(true);
    setSelectedIds(new Set([newEntry.id])); // Auto select newly added channel
    addToast("Listeye yeni bir kanal eklendi. Düzenlemek için çift tıklayabilirsiniz.", "info");
  };

  // Deletes all currently selected channel rows
  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    
    const count = selectedIds.size;
    if (confirm(`Seçili ${count} adet kanalı listeden silmek istiyor musunuz?`)) {
      const remaining = channels.filter((ch) => !selectedIds.has(ch.id));
      const updated = resequenceChannels(remaining);
      setChannels(updated);
      setSelectedIds(new Set());
      setHasUnsavedChanges(true);
      addToast(`${count} adet kanal başarıyla silindi.`, "success");
    }
  };

  // Moves a channel row one step upwards
  const handleMoveUp = () => {
    if (selectedIds.size !== 1) return;
    const selectedId = Array.from(selectedIds)[0];
    const index = channels.findIndex((ch) => ch.id === selectedId);
    if (index <= 0) return; // Already at top or not found

    const newList = [...channels];
    // Swap
    const temp = newList[index];
    newList[index] = newList[index - 1];
    newList[index - 1] = temp;

    const updated = resequenceChannels(newList);
    setChannels(updated);
    setHasUnsavedChanges(true);

    // Keep active selection on the moved element
    setSelectedIds(new Set([selectedId]));
  };

  // Moves a channel row one step downwards
  const handleMoveDown = () => {
    if (selectedIds.size !== 1) return;
    const selectedId = Array.from(selectedIds)[0];
    const index = channels.findIndex((ch) => ch.id === selectedId);
    if (index === -1 || index >= channels.length - 1) return; // Not found or already at bottom

    const newList = [...channels];
    // Swap
    const temp = newList[index];
    newList[index] = newList[index + 1];
    newList[index + 1] = temp;

    const updated = resequenceChannels(newList);
    setChannels(updated);
    setHasUnsavedChanges(true);

    // Keep active selection on the moved element
    setSelectedIds(new Set([selectedId]));
  };

  // Handle Drag-and-Drop row sorting from the DataGrid
  const handleReorderChannels = (draggedIndex: number, targetIndex: number) => {
    const list = [...channels];
    const item = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(targetIndex, 0, item);

    const updated = resequenceChannels(list);
    setChannels(updated);
    setHasUnsavedChanges(true);
  };

  // Inline grid cell update
  const handleUpdateChannel = (id: string, updatedFields: Partial<ChannelEntry>) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, ...updatedFields } : ch))
    );
    setHasUnsavedChanges(true);
  };

  // Removes duplicate stream links/URLs, keeping the first unique entry
  const handleDeduplicate = () => {
    const seenUrls = new Set<string>();
    const uniques: ChannelEntry[] = [];
    let duplicatesRemovedCount = 0;

    channels.forEach((ch) => {
      const urlKey = ch.url.trim().toLowerCase();
      if (!urlKey) {
        uniques.push(ch); // keep empty urls
      } else if (seenUrls.has(urlKey)) {
        duplicatesRemovedCount++;
      } else {
        seenUrls.add(urlKey);
        uniques.push(ch);
      }
    });

    if (duplicatesRemovedCount === 0) {
      addToast("Harika! Listede yinelenen (kopya) yayın adresi bulunamadı.", "info");
      return;
    }

    if (confirm(`Listede aynı yayın adresine sahip ${duplicatesRemovedCount} adet kopya kanal bulundu. Bunlar temizlensin mi?`)) {
      const updated = resequenceChannels(uniques);
      setChannels(updated);
      setSelectedIds(new Set());
      setHasUnsavedChanges(true);
      addToast(`Yinelenen ${duplicatesRemovedCount} kanal listeden temizlendi.`, "success");
    }
  };

  // Merges channels from a second M3U file
  const handleMergeConfirm = (incomingChannels: ChannelEntry[], removeDuplicates: boolean) => {
    let addedCount = 0;
    const currentUrls = new Set(channels.map((ch) => ch.url.trim().toLowerCase()).filter(Boolean));
    const mergedList = [...channels];

    incomingChannels.forEach((newCh) => {
      const cleanUrl = newCh.url.trim().toLowerCase();
      if (removeDuplicates && cleanUrl && currentUrls.has(cleanUrl)) {
        // Skip duplicate URL
        return;
      }
      
      // Add as new channel (assigning fresh ID and sequence number)
      mergedList.push({
        ...newCh,
        id: generateId(),
      });
      addedCount++;
    });

    const updated = resequenceChannels(mergedList);
    setChannels(updated);
    setHasUnsavedChanges(true);
    setSelectedIds(new Set());
    
    addToast(
      `${addedCount} yeni kanal başarıyla listenizin sonuna ilave edildi! (Toplam: ${updated.length})`,
      "success",
      5000
    );
  };

  // Filter channels based on Search box query
  const filteredChannels = channels.filter((ch) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    return (
      ch.name.toLowerCase().includes(query) ||
      ch.groupTitle.toLowerCase().includes(query) ||
      ch.tvgName.toLowerCase().includes(query) ||
      ch.url.toLowerCase().includes(query)
    );
  });

  return (
    <div className="h-screen w-screen flex flex-col bg-[#141419] text-gray-200 overflow-hidden font-sans relative">
      {/* Invisible HTML file upload trigger */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".m3u,.m3u8,text/plain"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Global Windows Drag-over Overlay */}
      {isDraggingFileOverWindow && (
        <div className="absolute inset-0 bg-[#007acc]/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-50 pointer-events-none border-8 border-dashed border-white m-3 rounded-lg animate-in fade-in duration-150">
          <Upload size={64} className="text-white animate-bounce mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">M3U Listesini Buraya Bırakın</h2>
          <p className="text-lg text-blue-100 max-w-md">
            M3U playlist dosyanızı hemen yüklemek ve tablo görünümünde açmak için farenizi serbest bırakın.
          </p>
        </div>
      )}

      {/* 1. Windows WPF Application Frame Top TitleBar */}
      <TitleBar fileName={fileName} hasUnsavedChanges={hasUnsavedChanges} />

      {/* 2. MenuBar dropdown selectors */}
      <MenuBar
        onNew={handleNewList}
        onOpen={handleOpenFileRequest}
        onSave={handleSave}
        onSaveAs={() => setIsSaveAsOpen(true)}
        onAddChannel={handleAddChannel}
        onDeduplicate={handleDeduplicate}
        onMerge={() => setIsMergeOpen(true)}
        onDeleteSelected={handleDeleteSelected}
        onAbout={() => setIsAboutOpen(true)}
      />

      {/* 3. ToolBar icon action groups & search bar */}
      <ToolBar
        onOpenClick={handleOpenFileRequest}
        onSaveClick={handleSave}
        onSaveAsClick={() => setIsSaveAsOpen(true)}
        onAddClick={handleAddChannel}
        onDeleteClick={handleDeleteSelected}
        onMoveUpClick={handleMoveUp}
        onMoveDownClick={handleMoveDown}
        onMergeClick={() => setIsMergeOpen(true)}
        onDeduplicateClick={handleDeduplicate}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isUpDisabled={selectedIds.size !== 1 || channels.findIndex((ch) => ch.id === Array.from(selectedIds)[0]) === 0}
        isDownDisabled={
          selectedIds.size !== 1 ||
          channels.findIndex((ch) => ch.id === Array.from(selectedIds)[0]) === channels.length - 1
        }
        isDeleteDisabled={selectedIds.size === 0}
      />

      {/* Quick notice block for Sample Data */}
      {fileName === "ornek_iptv_listesi.m3u" && !hasUnsavedChanges && (
        <div className="bg-[#1b2530] text-blue-200 px-3 py-1.5 border-b border-[#2d3a4b] text-[11px] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-blue-400 animate-pulse" />
            <span>Şu an <strong>ornek_iptv_listesi.m3u</strong> dosyasını görüntülüyorsunuz. Kendi listenizi açmak için <strong>Dosya Aç</strong> butonunu kullanabilirsiniz.</span>
          </span>
          <button
            onClick={() => {
              setChannels([]);
              setFileName("yeni_liste.m3u");
            }}
            className="text-gray-400 hover:text-white transition-colors underline"
          >
            Temizle
          </button>
        </div>
      )}

      {/* 4. Core spreadsheet DataGrid representation */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <DataGrid
          channels={filteredChannels}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onUpdateChannel={handleUpdateChannel}
          onReorderChannels={handleReorderChannels}
          onDeleteSelected={handleDeleteSelected}
        />
      </div>

      {/* 5. Desktop-like StatusBar indicator panel */}
      <StatusBar
        totalCount={channels.length}
        filteredCount={filteredChannels.length}
        fileName={fileName}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* 6. Modal Dialogs system */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      <SaveAsModal
        isOpen={isSaveAsOpen}
        onClose={() => setIsSaveAsOpen(false)}
        currentFileName={fileName}
        onConfirm={handleSaveAsConfirm}
      />

      <MergeModal
        isOpen={isMergeOpen}
        onClose={() => setIsMergeOpen(false)}
        onConfirmMerge={handleMergeConfirm}
      />

      {/* 7. Action Toast Notifications overlay list */}
      <div className="absolute bottom-10 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-lg shadow-2xl flex items-start gap-2.5 text-xs text-white border animate-in slide-in-from-right-4 duration-200 ${
              toast.type === "success"
                ? "bg-green-950/90 border-green-800 text-green-100"
                : toast.type === "warning"
                ? "bg-red-950/90 border-red-900 text-red-100"
                : "bg-blue-950/90 border-blue-900 text-blue-100"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === "success" && <Check size={14} className="text-green-400" />}
              {toast.type === "warning" && <X size={14} className="text-red-400" />}
              {toast.type === "info" && <Tv size={14} className="text-blue-400" />}
            </div>
            <div className="flex-1">{toast.message}</div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-gray-400 hover:text-white transition-colors ml-1 shrink-0"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
