type Props = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: Props) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-surface-elevated/80 p-6 shadow-lg shadow-black/20 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}
