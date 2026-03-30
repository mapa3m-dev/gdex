"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, ProgressBar, Input, Tabs } from "@/components/ui";
import {
  DownloadIcon, SearchIcon, BookIcon, QueueIcon,
  GDStarIcon, GDLikeIcon, MusicIcon, FileIcon,
  JsonIcon, TableIcon, ExcelIcon, CheckCircleIcon, AlertCircleIcon,
  SunIcon, MoonIcon, UserIcon, BarChartIcon, GamepadIcon
} from "@/components/icons";
import { Footer } from "@/components/Footer";
import { ServersStatus } from "@/components/ServersStatus";
import { DownloadQueue } from "@/components/DownloadQueue";
import { useTheme } from "@/components/ThemeProvider";
import { DifficultyIcon } from "@/components/DifficultyIcon";
import { QueueItem, LevelInfo, DownloadedFile } from "@/lib/types";
import { ExportFormat, EXPORT_FORMATS, OFFICIAL_SONGS, APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  
  const [levelId, setLevelId] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedFiles, setDownloadedFiles] = useState<DownloadedFile[]>([]);

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const queueRef = useRef<QueueItem[]>([]);
  const processingRef = useRef(false);

  const [selectedServer, setSelectedServer] = useState<string>("boomlings");
  const [exportFormats, setExportFormats] = useState<ExportFormat[]>(["gmd", "json"]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    processingRef.current = isProcessingQueue;
  }, [isProcessingQueue]);

  const checkLevel = useCallback(async () => {
    if (!levelId.trim()) return;

    setChecking(true);
    setError("");
    setLevelInfo(null);
    setDownloadedFiles([]);

    try {
      const response = await fetch(`/api/check?id=${encodeURIComponent(levelId.trim())}`);
      const data = await response.json();

      if (data.found) {
        setLevelInfo(data.info);
      } else {
        setError(data.error || "Level not found");
      }
    } catch {
      setError("Failed to check level");
    } finally {
      setChecking(false);
    }
  }, [levelId]);

  const downloadLevel = useCallback(async () => {
    if (!levelId.trim() || exportFormats.length === 0) return;

    setLoading(true);
    setError("");
    setDownloadProgress(0);
    setDownloadedFiles([]);

    try {
      setDownloadProgress(20);

      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          levelId: levelId.trim(),
          serverId: selectedServer,
        }),
      });

      setDownloadProgress(60);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Download failed");
      }

      setDownloadProgress(80);

      const files: DownloadedFile[] = [];
      const safeName = (data.info?.name || `level_${levelId}`).replace(/[^\w\s-]/g, "").replace(/\s+/g, "_");

      for (const format of exportFormats) {
        const file = await generateFile(format, data, safeName);
        if (file) {
          files.push(file);
        }
      }

      setDownloadedFiles(files);
      setDownloadProgress(100);

      if (!levelInfo && data.info) {
        setLevelInfo(data.info);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [levelId, selectedServer, exportFormats, levelInfo]);

  async function generateFile(
    format: ExportFormat,
    data: {
      levelId: string;
      info?: LevelInfo;
      levelData?: string;
      parsed?: { header: Record<string, string>; object_count: number; objects_preview: Record<string, string | number>[] };
      stats?: Record<string, unknown>;
      songInfo?: { url?: string | null; name?: string };
    },
    safeName: string
  ): Promise<DownloadedFile | null> {
    let content: string | Blob;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case "json":
        content = JSON.stringify(
          {
            level_id: parseInt(data.levelId, 10),
            metadata: data.info,
            header: data.parsed?.header,
            object_count: data.parsed?.object_count,
            objects_preview: data.parsed?.objects_preview,
            stats: data.stats,
          },
          null,
          2
        );
        filename = `${safeName}.json`;
        mimeType = "application/json";
        break;

      case "gmd":
        content = makeGmd(data.levelData || "", data.levelId, data.info?.name || `Level_${data.levelId}`);
        filename = `${safeName}.gmd`;
        mimeType = "application/xml";
        break;

      case "csv":
        content = objectsToCsv(data.parsed?.objects_preview || []);
        filename = `${safeName}_objects.csv`;
        mimeType = "text/csv";
        break;

      case "xls":
        content = objectsToTsv(data.parsed?.objects_preview || []);
        filename = `${safeName}_objects.xls`;
        mimeType = "application/vnd.ms-excel";
        break;

      case "meta":
        content = JSON.stringify(data.info, null, 2);
        filename = `${safeName}_meta.json`;
        mimeType = "application/json";
        break;

      case "mp3":
        if (data.songInfo?.url) {
          return {
            format: "mp3",
            filename: `${safeName}_song.mp3`,
            size: 0,
            url: data.songInfo.url,
          };
        }
        return null;

      default:
        return null;
    }

    const blob = typeof content === "string" ? new Blob([content], { type: mimeType }) : content;

    return {
      format,
      filename,
      size: blob.size,
      blob,
    };
  }

  const downloadFile = (file: DownloadedFile) => {
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
  };

  const addToQueue = useCallback(
    (levelIds: string[], formats: ExportFormat[]) => {
      const newItems: QueueItem[] = levelIds.map((id) => ({
        id: `${id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        levelId: id,
        status: "pending",
        checkStatus: "pending",
        progress: 0,
        addedAt: new Date(),
        exportFormats: formats,
      }));

      setQueue((prev) => [...prev, ...newItems]);
      newItems.forEach((item) => checkQueueItem(item.id));
    },
    []
  );

  const checkQueueItem = async (itemId: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, checkStatus: "checking" } : item
      )
    );

    const item = queueRef.current.find((i) => i.id === itemId);
    if (!item) return;

    try {
      const response = await fetch(`/api/check?id=${encodeURIComponent(item.levelId)}`);
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
  };

  const removeFromQueue = useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setIsProcessingQueue(false);
  }, []);

  const startQueue = useCallback(async () => {
    setIsProcessingQueue(true);

    while (processingRef.current) {
      const currentQueue = queueRef.current;
      const pendingItem = currentQueue.find((item) => item.status === "pending");

      if (!pendingItem) {
        setIsProcessingQueue(false);
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
            serverId: selectedServer,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Download failed");
        }

        const files: DownloadedFile[] = [];
        const safeName = (data.info?.name || `level_${pendingItem.levelId}`)
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "_");

        for (const format of pendingItem.exportFormats) {
          const file = await generateFile(format, data, safeName);
          if (file) {
            files.push(file);
          }
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

      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }, [selectedServer]);

  const pauseQueue = useCallback(() => {
    setIsProcessingQueue(false);
  }, []);

  const downloadQueueFile = (item: QueueItem, format: ExportFormat) => {
    const file = item.files?.find((f) => f.format === format);
    if (file) {
      downloadFile(file);
    }
  };

  const toggleFormat = (format: ExportFormat) => {
    setExportFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
    );
  };

  const formatIcons = {
    gmd: <FileIcon className="w-4 h-4" />,
    json: <JsonIcon className="w-4 h-4" />,
    csv: <TableIcon className="w-4 h-4" />,
    xls: <ExcelIcon className="w-4 h-4" />,
    meta: <FileIcon className="w-4 h-4" />,
    mp3: <MusicIcon className="w-4 h-4" />,
  };

  const tabs = [
    { id: "single", label: "Download", icon: <DownloadIcon className="w-4 h-4" /> },
    { id: "batch", label: "Batch", icon: <QueueIcon className="w-4 h-4" /> },
    { id: "guide", label: "Guide", icon: <BookIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col transition-theme">
      <header className="border-b border-[var(--border)] bg-[var(--bg-secondary)]/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="GDEX Logo" className="w-20 h-20" />
          </div>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <SunIcon className="w-5 h-5 text-[var(--text-primary)]" />
              ) : (
                <MoonIcon className="w-5 h-5 text-[var(--text-primary)]" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        <Tabs tabs={tabs} defaultTab="single">
          {(activeTab) => (
            <div className="animate-fadeIn">
              {activeTab === "single" && (
                <div className="grid lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 space-y-5">
                    <Card className="animate-fadeInUp">
                      <CardHeader icon={<SearchIcon className="w-5 h-5" />}>
                        <CardTitle>Find Level</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-3">
                          <Input
                            placeholder="Enter level ID (e.g., 128)"
                            value={levelId}
                            onChange={(e) => setLevelId(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && checkLevel()}
                            className="flex-1"
                          />
                          <Button
                            onClick={checkLevel}
                            loading={checking}
                            disabled={!levelId.trim()}
                            variant="secondary"
                            icon={<SearchIcon className="w-4 h-4" />}
                          >
                            Check
                          </Button>
                        </div>

                        {error && (
                          <div className="mt-3 p-3 bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-xl flex items-center gap-2 text-[var(--error)] text-sm animate-fadeIn">
                            <AlertCircleIcon className="w-4 h-4 flex-shrink-0" />
                            {error}
                          </div>
                        )}

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
                                    exportFormats.includes(format)
                                      ? "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30"
                                      : "bg-[var(--bg-input)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-muted)]"
                                  }
                                `}
                              >
                                {formatIcons[format]}
                                {EXPORT_FORMATS[format].label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {levelInfo && (
                      <Card className="animate-fadeInUp stagger-2">
                        <CardHeader icon={<GamepadIcon className="w-5 h-5" />}>
                          <div className="flex items-center justify-between">
                            <CardTitle subtitle={`by ${levelInfo.author}`}>
                              {levelInfo.name}
                            </CardTitle>
                            <span className="px-2 py-1 bg-[var(--success)]/10 text-[var(--success)] text-xs rounded-md font-medium">
                              Found
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
                            <div className="p-2 bg-[var(--bg-input)] rounded-xl text-center animate-fadeIn stagger-1 min-w-0">
                              <div className="flex items-center justify-center gap-1 text-base sm:text-lg font-bold text-yellow-400">
                                <GDStarIcon className="w-4 h-4 fill-current flex-shrink-0" />
                                <span className="truncate">{levelInfo.stars}</span>
                              </div>
                              <div className="text-[10px] text-[var(--text-muted)] mt-0.5 whitespace-nowrap">Stars</div>
                            </div>
                            <div className="p-2 bg-[var(--bg-input)] rounded-xl text-center animate-fadeIn stagger-2 min-w-0">
                              <div className="flex items-center justify-center gap-1 text-base sm:text-lg font-bold text-red-400">
                                <GDLikeIcon className="w-4 h-4 fill-current flex-shrink-0" />
                                <span className="truncate">{levelInfo.likes?.toLocaleString()}</span>
                              </div>
                              <div className="text-[10px] text-[var(--text-muted)] mt-0.5 whitespace-nowrap">Likes</div>
                            </div>
                            <div className="p-2 bg-[var(--bg-input)] rounded-xl text-center animate-fadeIn stagger-3 min-w-0">
                              <div className="text-base sm:text-lg font-bold text-[var(--accent)] break-words">
                                {levelInfo.downloads?.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-[var(--text-muted)] mt-0.5 whitespace-nowrap">Downloads</div>
                            </div>
                            <div className="p-2 bg-[var(--bg-input)] rounded-xl text-center animate-fadeIn stagger-4 min-w-0">
                              <DifficultyIcon difficulty={levelInfo.difficulty} className="w-6 h-6 sm:w-8 h-8 mx-auto" />
                              <div className="text-[10px] text-[var(--text-muted)] mt-0.5 whitespace-nowrap">{levelInfo.difficulty}</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs mb-4 animate-fadeIn stagger-5">
                            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                              <UserIcon className="w-3.5 h-3.5" />
                              {levelInfo.author}
                            </div>
                            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                              <BarChartIcon className="w-3.5 h-3.5" />
                              {levelInfo.length}
                            </div>
                            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                              <MusicIcon className="w-3.5 h-3.5" />
                              {levelInfo.song || (levelInfo.officialSong !== undefined ? OFFICIAL_SONGS[levelInfo.officialSong] : "N/A")}
                            </div>
                            {levelInfo.objects && (
                              <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                                <FileIcon className="w-3.5 h-3.5" />
                                {levelInfo.objects.toLocaleString()} obj
                              </div>
                            )}
                          </div>

                          {loading && <ProgressBar progress={downloadProgress} showPercent className="mb-4" />}

                          <Button
                            onClick={downloadLevel}
                            loading={loading}
                            disabled={exportFormats.length === 0}
                            size="lg"
                            className="w-full"
                            icon={<DownloadIcon className="w-5 h-5" />}
                          >
                            Download ({exportFormats.length} {exportFormats.length === 1 ? "format" : "formats"})
                          </Button>

                          {downloadedFiles.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-[var(--border)] animate-fadeIn">
                              <div className="flex items-center gap-2 text-[var(--success)] text-sm mb-2">
                                <CheckCircleIcon className="w-4 h-4" />
                                Ready to download
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {downloadedFiles.map((file) => (
                                  <Button
                                    key={file.format}
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => downloadFile(file)}
                                  >
                                    {file.filename}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <div>
                    <ServersStatus
                      selectedServer={selectedServer}
                      onServerSelect={setSelectedServer}
                    />
                  </div>
                </div>
              )}

              {activeTab === "batch" && (
                <div className="grid lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2">
                    <DownloadQueue
                      queue={queue}
                      isProcessing={isProcessingQueue}
                      onAddToQueue={addToQueue}
                      onRemoveFromQueue={removeFromQueue}
                      onClearQueue={clearQueue}
                      onStartQueue={startQueue}
                      onPauseQueue={pauseQueue}
                      onDownloadFile={downloadQueueFile}
                    />
                  </div>

                  <div>
                    <ServersStatus
                      selectedServer={selectedServer}
                      onServerSelect={setSelectedServer}
                    />
                  </div>
                </div>
              )}

              {activeTab === "guide" && (
                <div className="max-w-3xl mx-auto">
                  <Card className="animate-fadeInUp">
                    <CardHeader icon={<BookIcon className="w-5 h-5" />}>
                      <CardTitle>GDEX Guide</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <section>
                        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">What is GDEX?</h3>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                          GDEX (Geometry Dash Level Extractor) is a powerful tool for downloading and exporting Geometry Dash levels 
                          in multiple formats. Perfect for level creators, researchers, and neural network training.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-3">Export Formats</h3>
                        <div className="space-y-3">
                          <div className="p-3 bg-[var(--bg-input)] rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                              <FileIcon className="w-4 h-4 text-[var(--accent)]" />
                              <span className="text-sm font-medium text-[var(--text-primary)]">.gmd — Import to Geometry Dash</span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] ml-6">
                              Import levels directly back into Geometry Dash. Compatible with the game's native format.
                            </p>
                          </div>

                          <div className="p-3 bg-[var(--bg-input)] rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                              <JsonIcon className="w-4 h-4 text-[var(--accent)]" />
                              <span className="text-sm font-medium text-[var(--text-primary)]">.json — Neural Networks</span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] ml-6">
                              Structured data format with objects sorted by X position. Ideal for sequence models, CNNs, and transformers.
                            </p>
                          </div>

                          <div className="p-3 bg-[var(--bg-input)] rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                              <TableIcon className="w-4 h-4 text-[var(--accent)]" />
                              <span className="text-sm font-medium text-[var(--text-primary)]">.csv — Object Analysis</span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] ml-6">
                              Spreadsheet format with all object properties. Great for statistical analysis and data visualization.
                            </p>
                          </div>

                          <div className="p-3 bg-[var(--bg-input)] rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                              <ExcelIcon className="w-4 h-4 text-[var(--accent)]" />
                              <span className="text-sm font-medium text-[var(--text-primary)]">.xls — Excel Format</span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] ml-6">
                              Microsoft Excel compatible format. Opens directly in spreadsheet applications.
                            </p>
                          </div>

                          <div className="p-3 bg-[var(--bg-input)] rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                              <FileIcon className="w-4 h-4 text-[var(--accent)]" />
                              <span className="text-sm font-medium text-[var(--text-primary)]">Meta — Metadata</span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] ml-6">
                              Complete level information including author, difficulty, statistics, and upload details.
                            </p>
                          </div>

                          <div className="p-3 bg-[var(--bg-input)] rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                              <MusicIcon className="w-4 h-4 text-[var(--accent)]" />
                              <span className="text-sm font-medium text-[var(--text-primary)]">.mp3 — Background Music</span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] ml-6">
                              Downloads the custom song used in the level (if available and accessible).
                            </p>
                          </div>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">How to Use</h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-[var(--text-muted)]">
                          <li>Enter a Geometry Dash level ID (found in-game or on Geometry Dash servers)</li>
                          <li>Select your desired export formats</li>
                          <li>Click "Check" to verify the level exists</li>
                          <li>Review level information and statistics</li>
                          <li>Click "Download" to export the level</li>
                          <li>For batch downloads, use the Batch tab to add multiple levels to a queue</li>
                        </ol>
                      </section>

                      <section>
                        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">Tips</h3>
                        <ul className="list-disc list-inside space-y-1.5 text-sm text-[var(--text-muted)]">
                          <li>Use batch mode to download multiple levels at once</li>
                          <li>Check server status before downloading to ensure availability</li>
                          <li>JSON format is recommended for machine learning applications</li>
                          <li>GMD format allows you to import levels back into the game</li>
                          <li>Custom songs may not always be available due to hosting restrictions</li>
                        </ul>
                      </section>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}

function makeGmd(xmlData: string, lid: string, name: string): string {
  const escapedName = name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return `<?xml version="1.0"?>
<plist version="1.0" gjver="2.0">
<dict>
<key>LLM_01</key>
<dict>
<key>k_${lid}</key>
<dict>
<key>k2</key>
<string>${escapedName}</string>
<key>k4</key>
<string>${xmlData}</string>
</dict>
</dict>
<key>LLM_02</key>
<integer>26</integer>
</dict>
</plist>`;
}

function objectsToCsv(objects: Record<string, string | number>[]): string {
  if (!objects.length) return "";

  const allKeys = new Set<string>();
  for (const obj of objects) {
    Object.keys(obj).forEach((k) => allKeys.add(k));
  }
  const keys = Array.from(allKeys);

  let csv = keys.join(",") + "\n";

  for (const obj of objects) {
    const row = keys.map((k) => {
      const val = obj[k];
      if (val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
    csv += row.join(",") + "\n";
  }

  return csv;
}

function objectsToTsv(objects: Record<string, string | number>[]): string {
  if (!objects.length) return "";

  const allKeys = new Set<string>();
  for (const obj of objects) {
    Object.keys(obj).forEach((k) => allKeys.add(k));
  }
  const keys = Array.from(allKeys);

  let tsv = keys.join("\t") + "\n";

  for (const obj of objects) {
    const row = keys.map((k) => {
      const val = obj[k];
      if (val === undefined) return "";
      return String(val).replace(/\t/g, " ");
    });
    tsv += row.join("\t") + "\n";
  }

  return tsv;
}
