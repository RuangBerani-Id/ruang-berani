import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ruang Berani",
  description: "Ruang Berani - Forum Osis Se-Indonesia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
