"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";
import { ServerIcon, RefreshIcon, WifiIcon, WifiOffIcon, CheckCircleIcon } from "@/components/icons";

interface ServerStatus {
  id: string;
  name: string;
  status: "online" | "offline";
  latency: number;
}

interface ServersStatusProps {
  onServerSelect?: (serverId: string) => void;
  selectedServer?: string;
}

let cachedServers: ServerStatus[] | null = null;
let lastCheckedTime: Date | null = null;

export function ServersStatus({ onServerSelect, selectedServer }: ServersStatusProps) {
  const [servers, setServers] = useState<ServerStatus[]>(cachedServers || []);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(lastCheckedTime);
  const initialLoad = useRef(true);

  const checkServers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/servers");
      const data = await response.json();
      if (data.success) {
        setServers(data.servers);
        cachedServers = data.servers;
        const checked = new Date(data.checkedAt);
        setLastChecked(checked);
        lastCheckedTime = checked;
      }
    } catch (error) {
      console.error("Failed to check servers:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialLoad.current && !cachedServers) {
      initialLoad.current = false;
      checkServers();
    }
  }, [checkServers]);

  return (
    <Card className="animate-fadeIn">
      <CardHeader icon={<ServerIcon className="w-5 h-5" />}>
        <div className="flex items-center justify-between">
          <CardTitle>Servers</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkServers}
            disabled={loading}
            icon={<RefreshIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />}
          >
            {loading ? "..." : "Check"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {servers.length === 0 && !loading && (
            <div className="text-center py-6 text-[var(--text-muted)]">
              <ServerIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Click Check to test servers</p>
            </div>
          )}

          {loading && servers.length === 0 && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-[var(--bg-input)] rounded-xl animate-shimmer" />
              ))}
            </div>
          )}

          {servers.map((server, i) => (
            <button
              key={server.id}
              onClick={() => onServerSelect?.(server.id)}
              disabled={server.status === "offline"}
              className={`
                w-full flex items-center gap-3 p-3 rounded-xl
                transition-all duration-200 animate-fadeIn stagger-${i + 1}
                ${
                  selectedServer === server.id
                    ? "bg-[var(--accent)]/10 ring-2 ring-[var(--accent)]/50"
                    : server.status === "online"
                    ? "bg-[var(--bg-input)] hover:bg-[var(--bg-hover)]"
                    : "bg-[var(--bg-input)] opacity-50 cursor-not-allowed"
                }
              `}
            >
              <div
                className={`
                  w-8 h-8 rounded-lg flex items-center justify-center
                  ${server.status === "online" ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--error)]/10 text-[var(--error)]"}
                `}
              >
                {server.status === "online" ? <WifiIcon className="w-4 h-4" /> : <WifiOffIcon className="w-4 h-4" />}
              </div>

              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--text-primary)]">{server.name}</span>
                  {selectedServer === server.id && <CheckCircleIcon className="w-3.5 h-3.5 text-[var(--accent)]" />}
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  {server.status === "online" ? `${server.latency}ms` : "Offline"}
                </div>
              </div>

              <div
                className={`
                  px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide
                  ${server.status === "online" ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--error)]/10 text-[var(--error)]"}
                `}
              >
                {server.status}
              </div>
            </button>
          ))}
        </div>

        {lastChecked && (
          <div className="mt-3 pt-3 border-t border-[var(--border)] text-center">
            <p className="text-[10px] text-[var(--text-muted)]">
              Checked: {lastChecked.toLocaleTimeString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
