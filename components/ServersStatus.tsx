"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";
import { ServerIcon, RefreshIcon, CheckCircleIcon } from "@/components/icons";
import type { ServerStatus, ServersResponse } from "@/lib/types";

interface ServersStatusProps {
  onServerSelect?: (serverId: string) => void;
  selectedServer?: string;
}

function latencyColor(latency: number): string {
  if (latency < 100) return "text-[var(--success)]";
  if (latency < 300) return "text-yellow-400";
  if (latency < 600) return "text-orange-400";
  return "text-[var(--error)]";
}

export function ServersStatus({ onServerSelect, selectedServer }: ServersStatusProps): React.ReactElement {
  const [servers, setServers] = useState<ServerStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const initialLoad = useRef(true);

  const checkServers = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch("/api/servers");
      if (!response.ok) return;
      const data: ServersResponse = await response.json();
      if (data.success) {
        setServers(data.servers);
        setLastChecked(new Date(data.checkedAt));
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      void checkServers();
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
            ariaLabel="Refresh server status"
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

          {servers.map((server, i) => {
            const isSelected = selectedServer === server.id;
            const isOnline = server.status === "online";
            return (
              <button
                key={server.id}
                onClick={() => onServerSelect?.(server.id)}
                disabled={!isOnline}
                aria-label={`Select ${server.name} (${server.status}, ${server.latency}ms)`}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-xl border-2
                  transition-all duration-200 animate-fadeIn stagger-${Math.min(i + 1, 5)}
                  ${
                    isSelected
                      ? "bg-[var(--accent)]/10 border-[var(--accent)] animate-gd-pulse-glow"
                      : isOnline
                      ? "bg-[var(--bg-input)] border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--bg-hover)]"
                      : "bg-[var(--bg-input)] border-[var(--border)] opacity-50 cursor-not-allowed"
                  }
                `}
              >
                <span
                  aria-hidden
                  className={`gd-status-dot ${isOnline ? "gd-status-dot-online" : "gd-status-dot-offline"}`}
                />

                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--text-primary)] truncate">{server.name}</span>
                    {isSelected && <CheckCircleIcon className="w-3.5 h-3.5 text-[var(--accent)] flex-shrink-0" />}
                  </div>
                  <div className="text-xs">
                    {isOnline ? (
                      <span className={latencyColor(server.latency)}>{server.latency}ms</span>
                    ) : (
                      <span className="text-[var(--text-muted)]">Offline</span>
                    )}
                  </div>
                </div>

                <div
                  className={`
                    px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider gd-title
                    ${isOnline ? "bg-[var(--success)]/15 text-[var(--success)]" : "bg-[var(--error)]/15 text-[var(--error)]"}
                  `}
                >
                  {server.status}
                </div>
              </button>
            );
          })}
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
