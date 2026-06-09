import "@/app/for-creators-globals.css";

type Props = { children: React.ReactNode };

export default function ForCreatorsLayout({ children }: Props) {
  return <div className="for-creators-root">{children}</div>;
}
