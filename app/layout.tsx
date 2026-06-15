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
            <span className="text-xs text-[#e8e8f0]/40 ml-1 hidden sm:inline">ジャグラー設定判別ツール</span>
            <nav className="ml-auto">
              <a href="/about" className="text-xs text-[#e8e8f0]/50 hover:text-[#ffd700] transition-colors">
                計算について
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-[#ffd700]/10 text-center py-6 px-4">
          <p className="text-[10px] text-[#e8e8f0]/25 leading-relaxed max-w-2xl mx-auto">
            本ツールは過去の解析データ・実戦データに基づく統計的な参考情報を提供するものであり、実際の設定や勝敗を保証するものではありません。
            本ツールの結果を理由とした行動・判断は利用者ご自身の責任で行ってください。
            データの正確性には配慮していますが、機種仕様の変更等により実際の値と異なる場合があります。
          </p>
        </footer>
      </body>
    </html>
  );
}
