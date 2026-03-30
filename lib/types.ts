import { ExportFormat } from "./constants";

export type LevelCheckStatus = "pending" | "checking" | "found" | "not_found" | "error";

export type QueueItemStatus = "pending" | "downloading" | "complete" | "error";

export type ServerStatus = "unknown" | "checking" | "online" | "offline";

export interface ServerInfo {
  id: string;
  name: string;
  status: ServerStatus;
  latency?: number;
  lastChecked?: Date;
}

export interface LevelInfo {
  id: string;
  name: string;
  author: string;
  playerID?: string;
  accountID?: string;
  difficulty: string;
  stars: number;
  downloads: number;
  likes: number;
  length: string;
  song?: string;
  songID?: string;
  customSongID?: string;
  songLink?: string;
  customSong?: string | number;
  officialSong?: number;
  coins: number;
  verifiedCoins: boolean;
  featured: boolean;
  epic: boolean;
  gameVersion: string;
  objects?: number;
  description?: string;
  uploadDate?: string;
  updateDate?: string;
  copiedID?: string;
  twoPlayer?: boolean;
  ldm?: boolean;
}

export interface QueueItem {
  id: string;
  levelId: string;
  status: QueueItemStatus;
  checkStatus: LevelCheckStatus;
  levelInfo?: LevelInfo;
  progress: number;
  error?: string;
  addedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  exportFormats: ExportFormat[];
  files?: DownloadedFile[];
}

export interface DownloadedFile {
  format: ExportFormat;
  filename: string;
  size: number;
  blob?: Blob;
  url?: string;
}

export interface GDObject {
  [key: string]: string | number | undefined;
  obj_id?: number;
  x?: number;
  y?: number;
  rotation?: number;
  scale?: number;
  groups?: string;
}

export interface GDHeader {
  [key: string]: string | undefined;
}

export interface ParsedLevel {
  header: GDHeader;
  objects: GDObject[];
  object_count: number;
}

export interface LevelStats {
  total: number;
  unique_types: number;
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
  width: number;
  height: number;
  top_objects: [number, number][];
  with_rotation: number;
  with_scale: number;
  with_groups: number;
}

export interface DownloadResult {
  levelId: string;
  server: string;
  info: LevelInfo;
  parsed: ParsedLevel;
  rawData: string;
  stats: LevelStats;
  files: DownloadedFile[];
}

export interface AppSettings {
  exportFormats: ExportFormat[];
  preferredServer: string;
  autoCheckLevels: boolean;
  downloadDelay: number;
}

export interface HistoryEntry {
  levelId: string;
  levelName: string;
  author: string;
  downloadedAt: Date;
  formats: ExportFormat[];
}
