import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'OpenCode Web — ephemeral agent prototype',
  description: 'Vercel-first prototype that runs the real OpenCode agent in a temporary workspace per request.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
