import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DX 案件化診断 MVP",
  description: "診断 → 案件定義 → 募集票までを自動生成するMVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
