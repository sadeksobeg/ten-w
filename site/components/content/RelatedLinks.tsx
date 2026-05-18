import { Link } from "@/i18n/navigation";

type LinkItem = {
  href: string;
  label: string;
};

type Props = {
  title: string;
  links: LinkItem[];
};

export function RelatedLinks({ title, links }: Props) {
  if (links.length === 0) return null;
  return (
    <div>
      <h2 className="font-[family-name:var(--font-cairo)] text-lg font-bold">{title}</h2>
      <ul className="mt-3 flex flex-col gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm font-medium text-gold hover:underline">
              {l.label} →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
