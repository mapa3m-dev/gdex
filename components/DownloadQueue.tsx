"use client";

import { useCallback, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, ProgressBar } from "@/components/ui";
import {
  AlertCircleIcon, CheckCircleIcon, ClockIcon, DownloadIcon, ExcelIcon,
  FileIcon, GDStarIcon, JsonIcon, MusicIcon, PauseIcon, PlayIcon, QueueIcon,
  RefreshIcon, SearchIcon, TableIcon, TrashIcon, XIcon
} from "@/components/icons";
import type { QueueItem } from "@/lib/types";
import { EXPORT_FORMATS, type ExportFormat } from "@/lib/constants";

const FORMAT_ICONS: Record<ExportFormat, React.ReactElement> = {
  gmd: <FileIcon className="w-4 h-4" />,
  json: <JsonIcon className="w-4 h-4" />,
  csv: <TableIcon className="w-4 h-4" />,
  xls: <ExcelIcon className="w-4 h-4" />,
  meta: <FileIcon className="w-4 h-4" />,
  mp3: <MusicIcon className="w-4 h-4" />,
};

interface DownloadQueueProps {
  queue: QueueItem[];
  isProcessing: boolean;
  onAddToQueue: (levelIds: string[], formats: ExportFormat[]) => void;
  onRemoveFromQueue: (id: string) => void;
  onRetry: (id: string) => void;
  onClearQueue: () => void;
  onStartQueue: () => void;
  onPauseQueue: () => void;
  onDownloadFile: (item: QueueItem, format: ExportFormat) => void;
}

function parseInput(raw: string): string[] {
  const ids: string[] = [];
  for (const line of raw.split(/[\n,;]+/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const range = trimmed.match(/^(\d+)\s*[-–—]\s*(\d+)$/);
    if (range) {
      const start = parseInt(range[1], 10);
      const end = parseInt(range[2], 10);
      const lo = Math.min(start, end);
      const hi = Math.max(start, end);
      for (let i = lo; i <= hi; i++) ids.push(String(i));
    } else {
      for (const id of trimmed.split(/\s+/)) {
        if (/^\d+$/.test(id) && id.length <= 12) ids.push(id);
      }
    }
  }
  return ids;
}

export function DownloadQueue({
  queue,
  isProcessing,
  onAddToQueue,
  onRemoveFromQueue,
  onRetry,
  onClearQueue,
  onStartQueue,
  onPauseQueue,
  onDownloadFile,
}: DownloadQueueProps): React.ReactElement {
  const [inputValue, setInputValue] = useState("");
  const [selectedFormats, setSelectedFormats] = useState<ExportFormat[]>(["gmd", "json"]);

  const handleAddToQueue = useCallback((): void => {
    if (!inputValue.trim()) return;
    const ids = parseInput(inputValue);
    if (ids.length > 0) {
      onAddToQueue(ids, selectedFormats);
      setInputValue("");
    }
  }, [inputValue, selectedFormats, onAddToQueue]);

  const toggleFormat = useCallback((format: ExportFormat): void => {
    setSelectedFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
    );
  }, []);

  const handleRetry = useCallback(
    (id: string): void => {
      onRetry(id);
      if (!isProcessing) onStartQueue();
    },
    [onRetry, isProcessing, onStartQueue]
  );

  const completedCount = queue.filter((item) => item.status === "complete").length;
  const errorCount = queue.filter((item) => item.status === "error").length;
  const checkingCount = queue.filter((item) => item.checkStatus === "checking").length;
  const downloadingItem = queue.find((item) => item.status === "downloading");
  const allDone = queue.length > 0 && queue.every(
    (item) => item.status === "complete" || item.status === "error"
  );

  let subtitle: string;
  if (downloadingItem) {
    subtitle = `Downloading ${downloadingItem.levelInfo?.name || `Level ${downloadingItem.levelId}`}...`;
  } else if (checkingCount > 0) {
    subtitle = `Checking ${checkingCount} ${checkingCount === 1 ? "level" : "levels"}...`;
  } else {
    subtitle = `${completedCount} of ${queue.length} done${errorCount > 0 ? `, ${errorCount} failed` : ""}`;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader icon={<QueueIcon className="w-5 h-5" />}>
          <CardTitle subtitle="Comma-separated, one per line, or range like 128-135">
            Add to Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={"128, 129, 130\nor range: 128-135\n# comments are ignored"}
            className="w-full h-32 px-4 py-3 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl
                       text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none
                       focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)]
                       font-mono text-sm transition-all duration-200"
            aria-label="Level IDs"
          />

          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="text-sm text-[var(--text-muted)] mb-2">Export Formats:</div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(EXPORT_FORMATS) as ExportFormat[]).map((format) => {
                const isSelected = selectedFormats.includes(format);
                return (
                  <button
                    key={format}
                    onClick={() => toggleFormat(format)}
                    className={`
                      flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                      transition-all duration-150 border-2 hover:scale-[1.03]
                      ${
                        isSelected
                          ? "bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/60 shadow-[inset_0_0_8px_var(--accent-glow)]"
                          : "bg-[var(--bg-input)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent)]/40"
                      }
                    `}
                  >
                    {FORMAT_ICONS[format]}
                    {EXPORT_FORMATS[format].label}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            onClick={handleAddToQueue}
            disabled={!inputValue.trim() || selectedFormats.length === 0}
            className="mt-4 w-full sm:w-auto"
            icon={<QueueIcon className="w-4 h-4" />}
          >
            Add to Queue
          </Button>
        </CardContent>
      </Card>

      {queue.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-8 text-[var(--text-muted)]">
              <QueueIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm gd-title">Queue is empty</p>
              <p className="text-xs mt-1">Paste level IDs above and hit Add to Queue</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader icon={<DownloadIcon className="w-5 h-5" />}>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle subtitle={subtitle}>
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
                    disabled={allDone}
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
                  ariaLabel="Clear queue"
                >
                  <span className="hidden sm:inline">Clear</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {queue.map((item) => (
                <QueueItemRow
                  key={item.id}
                  item={item}
                  onRemove={() => onRemoveFromQueue(item.id)}
                  onRetry={() => handleRetry(item.id)}
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
  onRetry: () => void;
  onDownloadFile: (item: QueueItem, format: ExportFormat) => void;
}

const STATUS_CONFIG = {
  pending: { icon: ClockIcon, color: "text-[var(--text-muted)]", bg: "bg-[var(--bg-input)]" },
  downloading: { icon: DownloadIcon, color: "text-[var(--accent)]", bg: "bg-[var(--accent)]/10" },
  complete: { icon: CheckCircleIcon, color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  error: { icon: AlertCircleIcon, color: "text-[var(--error)]", bg: "bg-[var(--error)]/10" },
} as const;

const CHECK_STATUS_CONFIG = {
  pending: { icon: ClockIcon, color: "text-[var(--text-muted)]" },
  checking: { icon: SearchIcon, color: "text-[var(--warning)]" },
  found: { icon: CheckCircleIcon, color: "text-[var(--success)]" },
  not_found: { icon: XIcon, color: "text-[var(--error)]" },
  error: { icon: AlertCircleIcon, color: "text-[var(--error)]" },
} as const;

function QueueItemRow({ item, onRemove, onRetry, onDownloadFile }: QueueItemRowProps): React.ReactElement {
  const StatusIcon = STATUS_CONFIG[item.status].icon;
  const CheckIcon = CHECK_STATUS_CONFIG[item.checkStatus].icon;

  return (
    <div
      className={`
        flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border border-transparent
        ${STATUS_CONFIG[item.status].bg}
        transition-all duration-200 animate-fadeIn
      `}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-black/10">
        <StatusIcon
          className={`w-4 h-4 ${STATUS_CONFIG[item.status].color} ${item.status === "downloading" ? "animate-pulse" : ""}`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-medium text-[var(--text-primary)] truncate">
            {item.levelInfo?.name || `Level ${item.levelId}`}
          </span>
          <span className="text-xs text-[var(--text-muted)] flex-shrink-0">#{item.levelId}</span>
          <CheckIcon
            className={`w-3 h-3 flex-shrink-0 ${CHECK_STATUS_CONFIG[item.checkStatus].color} ${item.checkStatus === "checking" ? "animate-spin" : ""}`}
          />
        </div>

        {item.levelInfo ? (
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] min-w-0 mt-0.5">
            <span className="truncate">by {item.levelInfo.author} · {item.levelInfo.difficulty}</span>
            <span className="inline-flex items-center gap-0.5 text-yellow-400 flex-shrink-0">
              · {item.levelInfo.stars}
              <GDStarIcon className="w-3 h-3" />
            </span>
          </div>
        ) : item.checkStatus === "checking" ? (
          <div className="text-xs text-[var(--text-muted)] mt-0.5 italic">Checking…</div>
        ) : item.checkStatus === "not_found" ? (
          <div className="text-xs text-[var(--error)] mt-0.5">Level not found</div>
        ) : null}

        {item.status === "downloading" && (
          <ProgressBar indeterminate className="mt-2" color="accent" />
        )}

        {item.status === "error" && item.error && (
          <div className="text-xs text-[var(--error)] mt-1 break-words">{item.error}</div>
        )}

        {item.status === "complete" && item.files && item.files.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.files.map((file) => (
              <button
                key={file.format}
                onClick={() => onDownloadFile(item, file.format)}
                className="px-2 py-1 text-[10px] gd-title bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] rounded border border-[var(--border)] hover:border-[var(--accent)]/50 transition-colors"
              >
                {file.format.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-0.5 flex-shrink-0">
        {item.status === "error" && (
          <button
            onClick={onRetry}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors rounded-lg hover:bg-[var(--bg-hover)]"
            aria-label="Retry"
            title="Retry"
          >
            <RefreshIcon className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onRemove}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--error)] transition-colors rounded-lg hover:bg-[var(--bg-hover)] disabled:opacity-30"
          disabled={item.status === "downloading"}
          aria-label="Remove from queue"
          title="Remove"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
