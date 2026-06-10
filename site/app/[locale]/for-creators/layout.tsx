import "@/app/for-creators-globals.css";

type Props = { children: React.ReactNode };

export default function ForCreatorsLayout({ children }: Props) {
  return (
    <div className="for-creators-root">
      <link rel="preload" as="image" href="/videos/for-creators/hero-loop-poster.jpg" />
      {children}
    </div>
  );
}
