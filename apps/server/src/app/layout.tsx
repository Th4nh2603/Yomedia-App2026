import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Server App",
  description: "Next.js server app for SFTP APIs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

