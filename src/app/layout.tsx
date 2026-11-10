import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Run Winfy · winegui_2_ubuntu-22-amd64 · OpenCode Workspace',
  description:
    'Winfy RunWine Ubuntu 22.04 WineGUI web desktop integrated inside Next.js with OpenCode CLI v2.2.5, Vercel Functions, and Supabase Auth/Postgres.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
