/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Tv, Move, CheckSquare, Square, Trash2, Edit3, ImageOff } from "lucide-react";
import { ChannelEntry } from "../types";

interface DataGridProps {
  channels: ChannelEntry[];
  selectedIds: Set<string>;
  onSelectChange: (selectedIds: Set<string>) => void;
  onUpdateChannel: (id: string, updatedFields: Partial<ChannelEntry>) => void;
  onReorderChannels: (draggedIndex: number, targetIndex: number) => void;
  onDeleteSelected: () => void;
}

interface ColumnWidths {
  sequence: number;
  logo: number;
  tvgId: number;
  tvgName: number;
  groupTitle: number;
  name: number;
  url: number;
}

export default function DataGrid({
  channels,
  selectedIds,
  onSelectChange,
  onUpdateChannel,
  onReorderChannels,
  onDeleteSelected,
}: DataGridProps) {
  // Column Width States
  const [widths, setWidths] = useState<ColumnWidths>({
    sequence: 70,
    logo: 60,
    tvgId: 100,
    tvgName: 130,
    groupTitle: 140,
    name: 200,
    url: 350,
  });

  // Track cell editing state
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof ChannelEntry } | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Drag and Drop rows tracking
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Range selection helper (tracks the last clicked row index to enable Shift+Click range selection)
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);

  // Column resizing state variables
  const resizingCol = useRef<keyof ColumnWidths | null>(null);
  const startX = useRef<number>(0);
  const startWidth = useRef<number>(0);

  // Listen to Delete key globally on window when this grid has active focus
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Delete" && selectedIds.size > 0) {
        // Prevent action if user is currently editing an input element
        if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
          return;
        }
        onDeleteSelected();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIds, onDeleteSelected]);

  // Focus inline input on double click
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  // Start Column resizing handle
  const handleResizeStart = (e: React.MouseEvent, column: keyof ColumnWidths) => {
    e.preventDefault();
    e.stopPropagation();
    resizingCol.current = column;
    startX.current = e.clientX;
    startWidth.current = widths[column];

    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeStop);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizingCol.current) return;
    const diff = e.clientX - startX.current;
    const newWidth = Math.max(40, startWidth.current + diff);
    setWidths((prev) => ({
      ...prev,
      [resizingCol.current!]: newWidth,
    }));
  };

  const handleResizeStop = () => {
    resizingCol.current = null;
    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeStop);
  };

  // Row selection handler supporting: Single Click, Ctrl+Click, and Shift+Click range
  const handleRowClick = (e: React.MouseEvent, id: string, index: number) => {
    // If double click was triggered, let it handle editing
    if (e.detail === 2) return;

    // Check if clicking the checkbox directly (handled separately)
    const target = e.target as HTMLElement;
    if (target.closest(".checkbox-click-zone")) return;

    const newSelected = new Set(selectedIds);

    if (e.ctrlKey || e.metaKey) {
      // Toggle single item selection
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      setLastClickedIndex(index);
    } else if (e.shiftKey && lastClickedIndex !== null) {
      // Range selection
      const start = Math.min(lastClickedIndex, index);
      const end = Math.max(lastClickedIndex, index);
      
      // If Ctrl wasn't pressed, we clear previous selection
      const rangeSelected = new Set<string>();
      for (let k = start; k <= end; k++) {
        rangeSelected.add(channels[k].id);
      }
      onSelectChange(rangeSelected);
      return;
    } else {
      // Standard single selection
      newSelected.clear();
      newSelected.add(id);
      setLastClickedIndex(index);
    }

    onSelectChange(newSelected);
  };

  // Toggle selection for individual checkbox click
  const handleCheckboxClick = (e: React.MouseEvent, id: string, index: number) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setLastClickedIndex(index);
    onSelectChange(newSelected);
  };

  // Toggle all checkboxes on/off
  const handleSelectAllToggle = () => {
    if (selectedIds.size === channels.length) {
      onSelectChange(new Set());
    } else {
      onSelectChange(new Set(channels.map((c) => c.id)));
    }
  };

  // Inline edit cells activation
  const handleCellDoubleClick = (id: string, field: keyof ChannelEntry, currentVal: string) => {
    setEditingCell({ id, field });
    setEditValue(currentVal);
  };

  // Save cell edit
  const saveCellEdit = () => {
    if (editingCell) {
      onUpdateChannel(editingCell.id, { [editingCell.field]: editValue });
      setEditingCell(null);
    }
  };

  const handleKeyDownInEdit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveCellEdit();
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  // HTML5 Drag and drop handlers for rows reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Setup a transparent or styled drag preview image if needed
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorderChannels(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="flex-1 overflow-auto bg-[#18181c] relative select-none">
      <table className="w-full border-collapse table-fixed text-gray-300 font-sans text-xs">
        {/* Table Header */}
        <thead className="bg-[#24242b] sticky top-0 z-20 shadow-md">
          <tr className="border-b border-[#2d2d34] h-8 text-left text-gray-400">
            {/* Sequence & Select All */}
            <th style={{ width: widths.sequence }} className="relative px-2 font-semibold">
              <div className="flex items-center gap-1">
                <button
                  onClick={handleSelectAllToggle}
                  className="mr-1 text-gray-400 hover:text-white transition-colors"
                  title="Tümünü Seç / Temizle"
                >
                  {selectedIds.size === channels.length && channels.length > 0 ? (
                    <CheckSquare size={14} className="text-[#007acc]" />
                  ) : (
                    <Square size={14} />
                  )}
                </button>
                <span>Sıra No</span>
              </div>
              <div
                onMouseDown={(e) => handleResizeStart(e, "sequence")}
                className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-[#007acc] transition-colors"
              />
            </th>

            {/* Logo URL */}
            <th style={{ width: widths.logo }} className="relative px-2 font-semibold">
              <span>Logo</span>
              <div
                onMouseDown={(e) => handleResizeStart(e, "logo")}
                className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-[#007acc] transition-colors"
              />
            </th>

            {/* tvg-id */}
            <th style={{ width: widths.tvgId }} className="relative px-2 font-semibold">
              <span>tvg-id</span>
              <div
                onMouseDown={(e) => handleResizeStart(e, "tvgId")}
                className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-[#007acc] transition-colors"
              />
            </th>

            {/* tvg-name */}
            <th style={{ width: widths.tvgName }} className="relative px-2 font-semibold">
              <span>tvg-name</span>
              <div
                onMouseDown={(e) => handleResizeStart(e, "tvgName")}
                className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-[#007acc] transition-colors"
              />
            </th>

            {/* group-title */}
            <th style={{ width: widths.groupTitle }} className="relative px-2 font-semibold">
              <span>Grup (group-title)</span>
              <div
                onMouseDown={(e) => handleResizeStart(e, "groupTitle")}
                className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-[#007acc] transition-colors"
              />
            </th>

            {/* Channel Name */}
            <th style={{ width: widths.name }} className="relative px-2 font-semibold text-gray-200">
              <span>Kanal Adı</span>
              <div
                onMouseDown={(e) => handleResizeStart(e, "name")}
                className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-[#007acc] transition-colors"
              />
            </th>

            {/* Stream URL */}
            <th style={{ width: widths.url }} className="relative px-2 font-semibold">
              <span>Yayın Adresi (URL)</span>
              <div
                onMouseDown={(e) => handleResizeStart(e, "url")}
                className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-[#007acc] transition-colors"
              />
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-[#23232b]">
          {channels.length === 0 ? (
            <tr>
              <td colSpan={7} className="h-48 text-center text-gray-500 py-12">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Tv size={28} className="text-gray-600 animate-pulse" />
                  <p className="font-medium text-sm text-gray-400">Yüklü kanal bulunmuyor.</p>
                  <p className="text-[11px] text-gray-500 max-w-xs">
                    Yukarıdaki "Dosya Aç" butonunu kullanarak M3U dosyanızı yükleyin veya "Kanal Ekle" ile yeni bir tane oluşturun.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            channels.map((channel, index) => {
              const isSelected = selectedIds.has(channel.id);
              const isDragging = draggedIndex === index;
              const isDragOver = dragOverIndex === index;

              return (
                <tr
                  key={channel.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={(e) => handleRowClick(e, channel.id, index)}
                  className={`h-9 border-b border-[#23232b] select-none transition-all duration-75 cursor-default ${
                    isSelected
                      ? "bg-[#1b2b3a] hover:bg-[#203447] text-white"
                      : "hover:bg-[#202026] text-gray-300"
                  } ${isDragging ? "opacity-30" : ""} ${
                    isDragOver ? "border-t-2 border-t-[#007acc] bg-[#22222b]" : ""
                  }`}
                >
                  {/* Sequence (Index) & drag handle & Checkbox */}
                  <td className="px-2 truncate flex items-center h-9 gap-1 font-mono text-[11px]">
                    <div
                      className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 p-0.5 shrink-0"
                      title="Sıralamayı değiştirmek için sürükleyin"
                    >
                      <Move size={11} />
                    </div>
                    
                    <button
                      onClick={(e) => handleCheckboxClick(e, channel.id, index)}
                      className="checkbox-click-zone text-gray-500 hover:text-[#007acc] shrink-0 mr-1"
                      title="Seç"
                    >
                      {isSelected ? (
                        <CheckSquare size={13} className="text-[#007acc]" />
                      ) : (
                        <Square size={13} />
                      )}
                    </button>
                    
                    <span className="text-gray-500">{channel.sequence}</span>
                  </td>

                  {/* Logo Preview */}
                  <td className="px-2">
                    <div className="w-6 h-6 rounded bg-[#2a2a32] flex items-center justify-center overflow-hidden border border-[#3c3c46] shadow-sm">
                      {channel.tvgLogo ? (
                        <img
                          src={channel.tvgLogo}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            // Replace broken images with a fallback icon
                            (e.target as HTMLElement).style.display = "none";
                            const fallback = (e.target as HTMLElement).nextSibling as HTMLElement;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        style={{ display: channel.tvgLogo ? "none" : "flex" }}
                        className="w-full h-full flex items-center justify-center text-gray-500 text-[9px]"
                        title="Logo Yok"
                      >
                        <Tv size={11} />
                      </div>
                    </div>
                  </td>

                  {/* tvg-id Cell */}
                  <td
                    onDoubleClick={() => handleCellDoubleClick(channel.id, "tvgId", channel.tvgId)}
                    className="px-2 truncate grid-cell-focus cursor-text"
                    title="Düzenlemek için çift tıklayın"
                  >
                    {editingCell?.id === channel.id && editingCell?.field === "tvgId" ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveCellEdit}
                        onKeyDown={handleKeyDownInEdit}
                        className="w-full h-7 bg-[#16161a] text-white border border-[#007acc] rounded px-1 py-0.5 text-xs focus:outline-none"
                      />
                    ) : (
                      <span className={channel.tvgId ? "" : "text-gray-600 italic"}>
                        {channel.tvgId || "boş"}
                      </span>
                    )}
                  </td>

                  {/* tvg-name Cell */}
                  <td
                    onDoubleClick={() => handleCellDoubleClick(channel.id, "tvgName", channel.tvgName)}
                    className="px-2 truncate grid-cell-focus cursor-text"
                    title="Düzenlemek için çift tıklayın"
                  >
                    {editingCell?.id === channel.id && editingCell?.field === "tvgName" ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveCellEdit}
                        onKeyDown={handleKeyDownInEdit}
                        className="w-full h-7 bg-[#16161a] text-white border border-[#007acc] rounded px-1 py-0.5 text-xs focus:outline-none"
                      />
                    ) : (
                      <span className={channel.tvgName ? "" : "text-gray-600 italic"}>
                        {channel.tvgName || "boş"}
                      </span>
                    )}
                  </td>

                  {/* group-title Cell */}
                  <td
                    onDoubleClick={() => handleCellDoubleClick(channel.id, "groupTitle", channel.groupTitle)}
                    className="px-2 truncate grid-cell-focus cursor-text"
                    title="Düzenlemek için çift tıklayın"
                  >
                    {editingCell?.id === channel.id && editingCell?.field === "groupTitle" ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveCellEdit}
                        onKeyDown={handleKeyDownInEdit}
                        className="w-full h-7 bg-[#16161a] text-white border border-[#007acc] rounded px-1 py-0.5 text-xs focus:outline-none"
                      />
                    ) : (
                      <span className={channel.groupTitle ? "text-purple-300" : "text-gray-600 italic"}>
                        {channel.groupTitle || "Grup Yok"}
                      </span>
                    )}
                  </td>

                  {/* Channel Name Cell */}
                  <td
                    onDoubleClick={() => handleCellDoubleClick(channel.id, "name", channel.name)}
                    className="px-2 truncate grid-cell-focus cursor-text font-medium text-gray-100"
                    title="Düzenlemek için çift tıklayın"
                  >
                    {editingCell?.id === channel.id && editingCell?.field === "name" ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveCellEdit}
                        onKeyDown={handleKeyDownInEdit}
                        className="w-full h-7 bg-[#16161a] text-white border border-[#007acc] rounded px-1 py-0.5 text-xs focus:outline-none"
                      />
                    ) : (
                      <span>{channel.name}</span>
                    )}
                  </td>

                  {/* Stream URL Cell */}
                  <td
                    onDoubleClick={() => handleCellDoubleClick(channel.id, "url", channel.url)}
                    className="px-2 truncate grid-cell-focus cursor-text font-mono text-[11px]"
                    title="Düzenlemek için çift tıklayın"
                  >
                    {editingCell?.id === channel.id && editingCell?.field === "url" ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveCellEdit}
                        onKeyDown={handleKeyDownInEdit}
                        className="w-full h-7 bg-[#16161a] text-white border border-[#007acc] rounded px-1 py-0.5 text-xs focus:outline-none"
                      />
                    ) : (
                      <span className={channel.url ? "text-blue-300 hover:underline" : "text-red-500 italic"}>
                        {channel.url || "adres yok"}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
