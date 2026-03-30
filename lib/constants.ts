export const COLORS = {
  bg: "#0c0c18",
  card: "#161628",
  input: "#1e1e38",
  accent: "#6366f1",
  accent2: "#818cf8",
  green: "#22c55e",
  red: "#ef4444",
  yellow: "#f59e0b",
  text: "#f1f5f9",
  text2: "#cbd5e1",
  muted: "#94a3b8",
  dim: "#64748b",
  border: "#2d2d50",
};

export const OBJ_KEYS: Record<string, string> = {
  "1": "obj_id", "2": "x", "3": "y", "4": "h_flip", "5": "v_flip",
  "6": "rotation", "7": "red", "8": "green", "9": "blue", "10": "duration",
  "11": "touch_triggered", "13": "checked", "17": "blending",
  "20": "editor_layer", "21": "group_parent", "22": "color_1",
  "23": "color_2", "24": "target_group", "25": "z_order",
  "28": "move_x", "29": "move_y", "30": "easing", "32": "scale",
  "35": "opacity", "36": "active_trigger", "41": "hsv_adjusted",
  "43": "hsv", "44": "detail_color", "45": "fade_in", "46": "fade_out",
  "51": "target_type", "56": "activate_group", "57": "groups",
  "62": "spawn_triggered", "63": "spawn_delay", "64": "dont_fade",
  "67": "dont_enter", "69": "exclusive", "70": "multi_trigger",
  "71": "group_id", "72": "lock_rotation", "80": "item_id",
  "95": "hide_ground", "103": "high_detail", "104": "count",
  "108": "target_pos_group",
};

export const HEADER_KEYS: Record<string, string> = {
  kA2: "gamemode", kA3: "mini", kA4: "speed",
  kA6: "background", kA7: "ground", kA8: "dual",
  kA9: "start_offset", kA10: "two_player",
  kA11: "flip_gravity", kA13: "song_offset",
  kA14: "guidelines", kA15: "fade_in", kA16: "fade_out",
  kA17: "ground_line", kA18: "font",
  kS38: "colors", kS39: "colors_2",
};

export const OFFICIAL_SONGS: Record<number, string> = {
  0: "Stereo Madness", 1: "Back On Track", 2: "Polargeist",
  3: "Dry Out", 4: "Base After Base", 5: "Cant Let Go",
  6: "Jumper", 7: "Time Machine", 8: "Cycles", 9: "xStep",
  10: "Clutterfunk", 11: "Theory of Everything",
  12: "Electroman Adventures", 13: "Clubstep",
  14: "Electrodynamix", 15: "Hexagon Force",
  16: "Blast Processing", 17: "Theory of Everything 2",
  18: "Geometrical Dominator", 19: "Deadlocked",
  20: "Fingerdash", 21: "Dash",
};

export const GD_SERVERS = [
  {
    id: "gdbrowser",
    name: "GDBrowser",
    url: "https://gdbrowser.com/api/level/",
    type: "api" as const,
  },
  {
    id: "boomlings",
    name: "Boomlings (Official)",
    url: "http://www.boomlings.com/database/downloadGJLevel22.php",
    type: "official" as const,
  },
  {
    id: "gdproxy",
    name: "GD Proxy",
    url: "https://gdproxy.net/database/downloadGJLevel22.php",
    type: "proxy" as const,
  },
];

export const DIFFICULTIES: Record<string, string> = {
  "0": "N/A",
  "10": "Easy",
  "20": "Normal",
  "30": "Hard",
  "40": "Harder",
  "50": "Insane",
  "auto": "Auto",
  "easy_demon": "Easy Demon",
  "medium_demon": "Medium Demon",
  "hard_demon": "Hard Demon",
  "insane_demon": "Insane Demon",
  "extreme_demon": "Extreme Demon",
};

export const LENGTHS: Record<string, string> = {
  "0": "Tiny",
  "1": "Short",
  "2": "Medium",
  "3": "Long",
  "4": "XL",
  "5": "Platformer",
};

export type ExportFormat = "gmd" | "json" | "csv" | "xls" | "meta" | "mp3";

export const EXPORT_FORMATS: Record<ExportFormat, { label: string; ext: string; description: string }> = {
  gmd: { label: "GMD", ext: "gmd", description: "Импорт в GD" },
  json: { label: "JSON (NN)", ext: "json", description: "Для нейросетей" },
  csv: { label: "CSV", ext: "csv", description: "Таблица объектов" },
  xls: { label: "XLS", ext: "xlsx", description: "Excel таблица" },
  meta: { label: "Meta", ext: "json", description: "Метаданные" },
  mp3: { label: "MP3", ext: "mp3", description: "Музыка" },
};

export const GITHUB_URL = "https://github.com/mapa3m-dev/gdex";
export const APP_VERSION = "1.0.0";
export const APP_NAME = "GDEX";
export const APP_DESCRIPTION = "Geometry Dash Level Extractor";
