import "@coinbase/onchainkit/styles.css"; // Styles first
import "./globals.css";                   // Then your custom CSS
import { Providers } from "./providers";   // Then your provider wrapper

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}""