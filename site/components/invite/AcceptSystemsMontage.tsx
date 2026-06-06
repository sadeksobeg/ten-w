"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/components/invite/hooks/usePrefersReducedMotion";

type Props = {
  onComplete: () => void;
};

const SCENES = [
  {
    id: "ai",
    code: "AI",
    title: "الذكاء الاصطناعي",
    sub: "نماذج · أتمتة · قصص قابلة للتوسع",
    tone: "invite-montage-scene--ai",
  },
  {
    id: "cyber",
    code: "CYBER",
    title: "الأمن السيبراني",
    sub: "هوية · ثقة · حماية مؤسسية",
    tone: "invite-montage-scene--cyber",
  },
  {
    id: "dev",
    code: "DEV",
    title: "هندسة البرمجيات",
    sub: "منتجات · جودة · لمسة عربية",
    tone: "invite-montage-scene--dev",
  },
  {
    id: "tenegta",
    code: "T",
    title: "TENEGTA",
    sub: "منظومة واحدة · ثلاثة مجالات",
    tone: "invite-montage-scene--core",
  },
] as const;

export function AcceptSystemsMontage({ onComplete }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      onComplete();
      return;
    }

    const sceneMs = 340;
    const timers: ReturnType<typeof setTimeout>[] = [];

    SCENES.forEach((_, i) => {
      timers.push(setTimeout(() => setIndex(i), i * sceneMs));
    });

    timers.push(
      setTimeout(() => setExiting(true), SCENES.length * sceneMs),
      setTimeout(() => onComplete(), SCENES.length * sceneMs + 420),
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete, reducedMotion]);

  if (reducedMotion) return null;

  const scene = SCENES[index];

  return (
    <div
      className={`invite-montage-overlay ${exiting ? "invite-montage-overlay--exit" : ""}`}
      role="presentation"
      aria-hidden
    >
      <div className="invite-montage-flash" aria-hidden />
      {SCENES.map((s, i) => (
        <div
          key={s.id}
          className={`invite-montage-scene ${s.tone} ${i === index ? "is-active" : ""}`}
        >
          <p className="invite-montage-code">{s.code}</p>
          <h2 className="invite-montage-title">{s.title}</h2>
          <p className="invite-montage-sub">{s.sub}</p>
          <div className="invite-montage-scanlines" aria-hidden />
        </div>
      ))}
      <div className="invite-montage-progress" aria-hidden>
        {SCENES.map((s, i) => (
          <span key={s.id} className={i <= index ? "is-lit" : ""} />
        ))}
      </div>
      {scene ? (
        <p className="invite-montage-caption" key={scene.id}>
          {scene.title}
        </p>
      ) : null}
    </div>
  );
}
