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
      <head>
        {/* Single Page Apps for GitHub Pages — restores deep-link URLs
            that 404.html encoded into the query string. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(l) {
                if (l.search[1] === '/') {
                  var decoded = l.search.slice(1).split('&').map(function(s) {
                    return s.replace(/~and~/g, '&');
                  }).join('?');
                  window.history.replaceState(null, null,
                    l.pathname.slice(0, -1) + decoded + l.hash
                  );
                }
              }(window.location));
            `,
          }}
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
