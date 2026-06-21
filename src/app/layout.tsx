import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gomoku Trainer",
  description: "Train and improve your Gomoku game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ background: '#0f0f1a' }}>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
