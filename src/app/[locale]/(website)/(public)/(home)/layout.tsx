import Container from "@/components/container";

export default function HomeLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <Container className="mb-16 mt-6 flex flex-col gap-16">
      {children}
    </Container>
  );
}
