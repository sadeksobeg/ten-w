export function ChipIcon({ className = "" }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        width: 44,
        height: 34,
        borderRadius: 5,
        border: "1.5px solid rgba(201,146,42,0.7)",
        background: "linear-gradient(135deg, #1A1430 0%, #2A2040 50%, #1A1430 100%)",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
      aria-hidden
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          bottom: 0,
          width: 1,
          background: "rgba(201,146,42,0.5)",
          transform: "translateX(-50%)",
        }}
      />
      {[25, 47, 68].map((top) => (
        <div
          key={top}
          style={{
            position: "absolute",
            left: "15%",
            right: "15%",
            top: `${top}%`,
            height: 1,
            background: "rgba(201,146,42,0.6)",
          }}
        />
      ))}
    </div>
  );
}
