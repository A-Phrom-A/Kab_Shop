import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import JadeBackground from '@/components/layout/JadeBackground';
import { UserChatWidget } from '@/components/chat/UserChatWidget';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'kabshop | Premium Stationery Store',
  description: 'Luxury Glassmorphism Stationery Store',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-transparent text-white relative`}>
        
        {/* Animated Mesh Gradient Jade Background with Noise */}
        <JadeBackground />

        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative z-10 pointer-events-auto">
          {children}
        </main>
        
        <UserChatWidget />
      </body>
    </html>
  );
}
