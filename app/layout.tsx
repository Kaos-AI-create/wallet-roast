import './globals.css';
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning={true} style={{ margin: 0, padding: 0 }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}