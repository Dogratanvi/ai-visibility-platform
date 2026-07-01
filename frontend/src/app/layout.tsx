import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import SupportChatWidget from '@/components/SupportChatWidget';

export const metadata: Metadata = {
  title: 'AI Visibility - Search Optimization',
  description: 'AI Visibility platform for brand visibility, AI mentions, and search intelligence',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <Providers>
          {children}
          <SupportChatWidget />
        </Providers>
      </body>
    </html>
  );
}
