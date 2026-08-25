import Container from "@/components/container";
import type React from "react";

export default function BlogPostLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <div className="mb-16">
      <Container className="mt-8">{children}</Container>
    </div>
  );
}
