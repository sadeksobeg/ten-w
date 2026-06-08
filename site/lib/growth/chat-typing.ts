type TypingEntry = { userId: string; name: string; at: number };

const typingByRoom = new Map<string, TypingEntry[]>();
const TTL_MS = 5000;

export function setRoomTyping(roomSlug: string, userId: string, name: string) {
  const now = Date.now();
  const list = (typingByRoom.get(roomSlug) ?? []).filter(
    (e) => e.userId !== userId && now - e.at < TTL_MS,
  );
  list.push({ userId, name, at: now });
  typingByRoom.set(roomSlug, list);
}

export function getRoomTyping(roomSlug: string, excludeUserId: string): string[] {
  const now = Date.now();
  const list = (typingByRoom.get(roomSlug) ?? []).filter(
    (e) => e.userId !== excludeUserId && now - e.at < TTL_MS,
  );
  typingByRoom.set(roomSlug, list);
  return list.map((e) => e.name);
}
