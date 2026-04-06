import { Container } from "./Container";

type Props = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  as?: "section" | "div";
};

export function Section({
  children,
  className = "",
  id,
  as: Tag = "section",
}: Props) {
  return (
    <Tag id={id} className={`py-16 md:py-24 ${className}`}>
      <Container>{children}</Container>
    </Tag>
  );
}
