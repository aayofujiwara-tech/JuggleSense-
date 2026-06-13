import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JuggleSense — ジャグラー設定判別ツール",
  description: "ジャグラーシリーズ全機種対応の設定判別・ぶどう確率逆算ツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-[#e8e8f0]">
        <header className="border-b border-[#ffd700]/20 bg-[#0d0d18]">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
            <span className="text-2xl gogo-pulse">🎰</span>
            <a href="/" className="font-bold text-lg tracking-tight text-[#ffd700]">
              JuggleSense
            </a>
            <span className="text-xs text-[#e8e8f0]/40 ml-1">ジャグラー設定判別ツール</span>
          </div>
        </header>
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-[#ffd700]/10 text-center text-xs text-[#e8e8f0]/30 py-4">
          データはあくまで参考値です。実際の設定を保証するものではありません。
        </footer>
      </body>
    </html>
  );
}
