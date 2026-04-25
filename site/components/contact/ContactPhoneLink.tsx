import { ltrIsolate } from "@/lib/ltr-isolate";

type Props = {
  tel: string;
  /** Visible label (e.g. 0953562654); must be ASCII digits for correct RTL isolation */
  display: string;
};

/**
 * Phone link with strong LTR isolation for Arabic / RTL layouts.
 */
export function ContactPhoneLink({ tel, display }: Props) {
  const label = ltrIsolate(display.replace(/\s+/g, ""));

  return (
    <a
      href={`tel:${tel}`}
      lang="en"
      translate="no"
      className="inline-block font-mono text-base font-medium text-foreground underline-offset-4 hover:underline tabular-nums [direction:ltr] [unicode-bidi:isolate]"
      style={{ direction: "ltr", unicodeBidi: "isolate" }}
    >
      {label}
    </a>
  );
}
