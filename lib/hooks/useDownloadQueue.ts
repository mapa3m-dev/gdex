"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DownloadedFile, QueueItem } from "@/lib/types";
import type { ExportFormat } from "@/lib/constants";
import { generateFile, makeSafeName, type DownloadResponse } from "@/lib/exporters";

function makeQueueId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

const QUEUE_STEP_DELAY_MS = 500;

export interface UseDownloadQueue {
  queue: QueueItem[];
  isProcessing: boolean;
  addToQueue: (levelIds: string[], formats: ExportFormat[]) => void;
  removeFromQueue: (id: string) => void;
  retryItem: (id: string) => void;
  clearQueue: () => void;
  startQueue: () => Promise<void>;
  pauseQueue: () => void;
  downloadQueueFile: (item: QueueItem, format: ExportFormat) => void;
}

export function useDownloadQueue(serverId: string): UseDownloadQueue {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const queueRef = useRef<QueueItem[]>([]);
  const processingRef = useRef(false);
  const serverIdRef = useRef(serverId);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    processingRef.current = isProcessing;
  }, [isProcessing]);

  useEffect(() => {
    serverIdRef.current = serverId;
  }, [serverId]);

  const checkItem = useCallback(async (itemId: string, levelId: string): Promise<void> => {
    setQueue((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, checkStatus: "checking" } : item))
    );

    try {
      const response = await fetch(`/api/check?id=${encodeURIComponent(levelId)}`);
      const data = await response.json();

      setQueue((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? {
                ...i,
                checkStatus: data.found ? "found" : "not_found",
                levelInfo: data.found ? data.info : undefined,
              }
            : i
        )
      );
    } catch {
      setQueue((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, checkStatus: "error" } : i))
      );
    }
  }, []);

  const addToQueue = useCallback(
    (levelIds: string[], formats: ExportFormat[]): void => {
      const newItems: QueueItem[] = levelIds.map((id) => ({
        id: makeQueueId(),
        levelId: id,
        status: "pending",
        checkStatus: "pending",
        progress: 0,
        addedAt: new Date(),
        exportFormats: formats,
      }));

      setQueue((prev) => [...prev, ...newItems]);
      newItems.forEach((item) => {
        void checkItem(item.id, item.levelId);
      });
    },
    [checkItem]
  );

  const removeFromQueue = useCallback((id: string): void => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const retryItem = useCallback((id: string): void => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: "pending", error: undefined, progress: 0 }
          : item
      )
    );
  }, []);

  const clearQueue = useCallback((): void => {
    setQueue([]);
    setIsProcessing(false);
  }, []);

  const startQueue = useCallback(async (): Promise<void> => {
    setIsProcessing(true);

    while (processingRef.current) {
      const pendingItem = queueRef.current.find((item) => item.status === "pending");

      if (!pendingItem) {
        setIsProcessing(false);
        break;
      }

      setQueue((prev) =>
        prev.map((item) =>
          item.id === pendingItem.id
            ? { ...item, status: "downloading", startedAt: new Date() }
            : item
        )
      );

      try {
        const response = await fetch("/api/download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            levelId: pendingItem.levelId,
            serverId: serverIdRef.current,
          }),
        });

        const data: DownloadResponse & { error?: string } = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Download failed");
        }

        const safeName = makeSafeName(data.info?.name, pendingItem.levelId);
        const files: DownloadedFile[] = [];
        for (const format of pendingItem.exportFormats) {
          const file = await generateFile(format, data, safeName);
          if (file) files.push(file);
        }

        setQueue((prev) =>
          prev.map((item) =>
            item.id === pendingItem.id
              ? {
                  ...item,
                  status: "complete",
                  completedAt: new Date(),
                  files,
                  levelInfo: data.info,
                  progress: 100,
                }
              : item
          )
        );
      } catch (err) {
        setQueue((prev) =>
          prev.map((item) =>
            item.id === pendingItem.id
              ? {
                  ...item,
                  status: "error",
                  error: err instanceof Error ? err.message : "Download failed",
                }
              : item
          )
        );
      }

      await new Promise((resolve) => setTimeout(resolve, QUEUE_STEP_DELAY_MS));
    }
  }, []);

  const pauseQueue = useCallback((): void => {
    setIsProcessing(false);
  }, []);

  const downloadQueueFile = useCallback(
    (item: QueueItem, format: ExportFormat): void => {
      const file = item.files?.find((f) => f.format === format);
      if (!file) return;
      if (file.url) {
        window.open(file.url, "_blank");
        return;
      }
      if (file.blob) {
        const url = URL.createObjectURL(file.blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    },
    []
  );

  return {
    queue,
    isProcessing,
    addToQueue,
    removeFromQueue,
    retryItem,
    clearQueue,
    startQueue,
    pauseQueue,
    downloadQueueFile,
  };
}
