"use client";

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { GrowthNotificationRow } from "@/lib/growth/notification-types";

export function useNotificationRead(
  items: GrowthNotificationRow[],
  setItems: Dispatch<SetStateAction<GrowthNotificationRow[]>>,
  setUnread: Dispatch<SetStateAction<number>>,
) {
  const markRead = useCallback(
    async (id: string) => {
      const item = items.find((x) => x.id === id);
      if (!item || item.isRead) return;

      const prevItems = items;
      const prevUnread = items.filter((x) => !x.isRead).length;
      setItems((list) =>
        list.map((x) => (x.id === id ? { ...x, isRead: true } : x)),
      );
      setUnread((c) => Math.max(0, c - 1));

      try {
        const res = await fetch(`/api/growth/notifications/${id}/read`, {
          method: "POST",
        });
        if (!res.ok) throw new Error("read failed");
      } catch {
        setItems(prevItems);
        setUnread(prevUnread);
      }
    },
    [items, setItems, setUnread],
  );

  const markAll = useCallback(async () => {
    const prevItems = items;
    const prevUnread = items.filter((x) => !x.isRead).length;
    setItems((list) => list.map((x) => ({ ...x, isRead: true })));
    setUnread(0);
    try {
      const res = await fetch("/api/growth/notifications/read-all", {
        method: "POST",
      });
      if (!res.ok) throw new Error("read-all failed");
    } catch {
      setItems(prevItems);
      setUnread(prevUnread);
    }
  }, [items, setItems, setUnread]);

  return { markRead, markAll };
}
