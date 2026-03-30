"use client";

import { useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, ProgressBar } from "@/components/ui";
import {
  QueueIcon, TrashIcon, PlayIcon, PauseIcon, CheckCircleIcon,
  AlertCircleIcon, SearchIcon, DownloadIcon, XIcon, ClockIcon,
  FileIcon, JsonIcon, TableIcon, ExcelIcon, MusicIcon
} from "@/components/icons";
import { QueueItem, LevelInfo } from "@/lib/types";
import { ExportFormat, EXPORT_FORMATS } from "@/lib/constants";

interface DownloadQueueProps {
  queue: QueueItem[];
  isProcessing: boolean;
  onAddToQueue: (levelIds: string[], formats: ExportFormat[]) => void;
  onRemoveFromQueue: (id: string) => void;
  onClearQueue: () => void;
  onStartQueue: () => void;
  onPauseQueue: () => void;
  onDownloadFile: (item: QueueItem, format: ExportFormat) => void;
}

export function DownloadQueue({
  queue,
  isProcessing,
  onAddToQueue,
  onRemoveFromQueue,
  onClearQueue,
  onStartQueue,
  onPauseQueue,
  onDownloadFile,
}: DownloadQueueProps) {
  const [inputValue, setInputValue] = useState("");
  const [selectedFormats, setSelectedFormats] = useState<ExportFormat[]>(["gmd", "json"]);

  const handleAddToQueue = useCallback(() => {
    if (!inputValue.trim()) return;

    const levelIds: string[] = [];
    const lines = inputValue.split(/[\n,;]+/);

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const rangeMatch = trimmed.match(/^(\d+)\s*[-–—]\s*(\d+)$/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        for (let i = start; i <= end; i++) {
          levelIds.push(String(i));
        }
      } else {
        const ids = trimmed.split(/\s+/);
        for (const id of ids) {
          if (/^\d+$/.test(id)) {
            levelIds.push(id);
          }
        }
      }
    }

    if (levelIds.length > 0) {
      onAddToQueue(levelIds, selectedFormats);
      setInputValue("");
    }
  }, [inputValue, selectedFormats, onAddToQueue]);

  const toggleFormat = (format: ExportFormat) => {
    setSelectedFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
    );
  };

  const completedCount = queue.filter((item) => item.status === "complete").length;
  const errorCount = queue.filter((item) => item.status === "error").length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader icon={<QueueIcon className="w-5 h-5" />}>
          <CardTitle subtitle="Enter level IDs separated by comma, space, or one per line">
            Add to Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="128, 129, 130&#10;or range: 128-135&#10;# comments are ignored"
            className="w-full h-32 px-4 py-3 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl
                       text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none
                       focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)]
                       font-mono text-sm transition-all duration-200"
          />

          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="text-sm text-[var(--text-muted)] mb-2">Export Formats:</div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(EXPORT_FORMATS) as ExportFormat[]).map((format) => (
                <button
                  key={format}
                  onClick={() => toggleFormat(format)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                    transition-all duration-200 border animate-scaleIn
                    ${
                      selectedFormats.includes(format)
                        ? "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30"
                        : "bg-[var(--bg-input)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-muted)]"
                    }
                  `}
                >
                  {format === 'gmd' && <FileIcon className="w-4 h-4" />}
                  {format === 'json' && <JsonIcon className="w-4 h-4" />}
                  {format === 'csv' && <TableIcon className="w-4 h-4" />}
                  {format === 'xls' && <ExcelIcon className="w-4 h-4" />}
                  {format === 'meta' && <FileIcon className="w-4 h-4" />}
                  {format === 'mp3' && <MusicIcon className="w-4 h-4" />}
                  {EXPORT_FORMATS[format].label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleAddToQueue}
            disabled={!inputValue.trim() || selectedFormats.length === 0}
            className="mt-4"
            icon={<QueueIcon className="w-4 h-4" />}
          >
            Add to Queue
          </Button>
        </CardContent>
      </Card>

      {queue.length > 0 && (
        <Card>
          <CardHeader icon={<DownloadIcon className="w-5 h-5" />}>
            <div className="flex items-center justify-between">
              <CardTitle
                subtitle={`${completedCount} of ${queue.length} completed${errorCount > 0 ? `, ${errorCount} errors` : ""}`}
              >
                Download Queue
              </CardTitle>
              <div className="flex gap-2">
                {isProcessing ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onPauseQueue}
                    icon={<PauseIcon className="w-4 h-4" />}
                  >
                    Pause
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onStartQueue}
                    disabled={queue.every((item) => item.status === "complete" || item.status === "error")}
                    icon={<PlayIcon className="w-4 h-4" />}
                  >
                    Start
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearQueue}
                  icon={<TrashIcon className="w-4 h-4" />}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {queue.map((item) => (
                <QueueItemRow
                  key={item.id}
                  item={item}
                  onRemove={() => onRemoveFromQueue(item.id)}
                  onDownloadFile={onDownloadFile}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface QueueItemRowProps {
  item: QueueItem;
  onRemove: () => void;
  onDownloadFile: (item: QueueItem, format: ExportFormat) => void;
}

function QueueItemRow({ item, onRemove, onDownloadFile }: QueueItemRowProps) {
  const statusConfig = {
    pending: { icon: ClockIcon, color: "text-[var(--text-muted)]", bg: "bg-[var(--bg-input)]" },
    downloading: { icon: DownloadIcon, color: "text-[var(--accent)]", bg: "bg-[var(--accent)]/10" },
    complete: { icon: CheckCircleIcon, color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
    error: { icon: AlertCircleIcon, color: "text-[var(--error)]", bg: "bg-[var(--error)]/10" },
  };

  const checkStatusConfig = {
    pending: { icon: ClockIcon, color: "text-[var(--text-muted)]" },
    checking: { icon: SearchIcon, color: "text-[var(--warning)]" },
    found: { icon: CheckCircleIcon, color: "text-[var(--success)]" },
    not_found: { icon: XIcon, color: "text-[var(--error)]" },
    error: { icon: AlertCircleIcon, color: "text-[var(--error)]" },
  };

  const StatusIcon = statusConfig[item.status].icon;
  const CheckIcon = checkStatusConfig[item.checkStatus].icon;

  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-xl
        ${statusConfig[item.status].bg}
        transition-all duration-200 animate-fadeIn
      `}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${statusConfig[item.status].bg}`}>
        <StatusIcon
          className={`w-4 h-4 ${statusConfig[item.status].color} ${item.status === "downloading" ? "animate-pulse" : ""}`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[var(--text-primary)] truncate">
            {item.levelInfo?.name || `Level ${item.levelId}`}
          </span>
          <span className="text-xs text-[var(--text-muted)]">#{item.levelId}</span>
          <CheckIcon className={`w-3 h-3 ${checkStatusConfig[item.checkStatus].color}`} />
        </div>

        {item.levelInfo && (
          <div className="text-xs text-[var(--text-muted)] truncate">
            by {item.levelInfo.author} · {item.levelInfo.difficulty} · {item.levelInfo.stars}★
          </div>
        )}

        {item.status === "downloading" && (
          <ProgressBar progress={item.progress} className="mt-2" color="accent" />
        )}

        {item.status === "error" && item.error && (
          <div className="text-xs text-[var(--error)] mt-1">{item.error}</div>
        )}

        {item.status === "complete" && item.files && item.files.length > 0 && (
          <div className="flex gap-1 mt-2">
            {item.files.map((file) => (
              <button
                key={file.format}
                onClick={() => onDownloadFile(item, file.format)}
                className="px-2 py-0.5 text-xs bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] rounded transition-colors"
              >
                {file.format.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onRemove}
        className="p-2 text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
        disabled={item.status === "downloading"}
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
