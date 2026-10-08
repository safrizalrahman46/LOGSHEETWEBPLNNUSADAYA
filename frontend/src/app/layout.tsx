import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/common/Providers";

export const metadata: Metadata = {
  title: "PLN Nusa Daya - WACB PLTD Logsheet & HAR Portal",
  description: "Aplikasi Web Enterprise Pelaporan Operasional PLTD & Pemeliharaan Mesin Kalimantan 3",
  icons: {
    icon: "/images/logo/LOGO-PLN.png",
    shortcut: "/images/logo/LOGO-PLN.png",
    apple: "/images/logo/LOGO-PLN.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('pln_theme');
                if (t === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}

              // Auto-recover from chunk load errors when bundles are updated
              window.addEventListener('error', function(e) {
                var msg = (e && e.message) || '';
                if (msg.indexOf('Loading chunk') !== -1 || msg.indexOf('ChunkLoadError') !== -1) {
                  var lastKey = 'pln_last_chunk_reload';
                  var last = parseInt(sessionStorage.getItem(lastKey) || '0', 10);
                  if (Date.now() - last > 3000) {
                    sessionStorage.setItem(lastKey, String(Date.now()));
                    window.location.reload();
                  }
                }
              });
            `,
          }}
        />
      </head>
        <body className="bg-white text-gray-900 antialiased min-h-screen dark:bg-gray-950 dark:text-gray-100">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
