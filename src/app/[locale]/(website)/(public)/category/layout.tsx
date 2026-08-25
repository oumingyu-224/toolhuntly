import Container from "@/components/container";

export default function CategoryLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <div className="mb-16">
      <Container className="mt-8">{children}</Container>
    </div>
  );
}
