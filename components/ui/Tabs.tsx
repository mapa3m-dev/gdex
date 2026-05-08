"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  children: (activeTab: string) => ReactNode;
  className?: string;
}

export function Tabs({ tabs, defaultTab, children, className = "" }: TabsProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || "");
  const listRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  const updateIndicator = useCallback(() => {
    const list = listRef.current;
    const button = buttonsRef.current.get(activeTab);
    if (!list || !button) return;
    const listRect = list.getBoundingClientRect();
    const btnRect = button.getBoundingClientRect();
    setIndicator({ left: btnRect.left - listRect.left, width: btnRect.width });
  }, [activeTab]);

  useEffect(() => {
    updateIndicator();
    const observer = new ResizeObserver(updateIndicator);
    if (listRef.current) observer.observe(listRef.current);
    window.addEventListener("resize", updateIndicator);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [updateIndicator]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const idx = tabs.findIndex((t) => t.id === activeTab);
    const next =
      e.key === "ArrowRight"
        ? (idx + 1) % tabs.length
        : (idx - 1 + tabs.length) % tabs.length;
    const nextId = tabs[next].id;
    setActiveTab(nextId);
    buttonsRef.current.get(nextId)?.focus();
  };

  return (
    <div className={className}>
      <div
        ref={listRef}
        role="tablist"
        onKeyDown={handleKeyDown}
        className="relative flex gap-1 p-1 bg-[var(--bg-secondary)] rounded-2xl mb-5 border border-[var(--border)]"
      >
        {indicator && (
          <span
            aria-hidden
            className="absolute top-1 bottom-1 rounded-xl gd-tab-active transition-all duration-300 ease-out"
            style={{ left: indicator.left, width: indicator.width }}
          />
        )}
        {tabs.map((tab, i) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) buttonsRef.current.set(tab.id, el);
                else buttonsRef.current.delete(tab.id);
              }}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative z-10 flex-1 flex items-center justify-center gap-1.5 sm:gap-2
                px-2 sm:px-4 py-2.5 rounded-xl min-w-0
                gd-title text-xs sm:text-sm transition-colors duration-200
                animate-fadeIn stagger-${Math.min(i + 1, 5)}
                ${isActive ? "text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}
              `}
            >
              {tab.icon && <span className="w-4 h-4 inline-flex items-center justify-center flex-shrink-0">{tab.icon}</span>}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div key={activeTab} className="animate-gd-slide-up">{children(activeTab)}</div>
    </div>
  );
}
