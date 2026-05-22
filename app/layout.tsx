import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SponsorCaseRadar — Sponsoring Best Cases',
  description:
    'Sponsoring Best Cases entdecken, bewerten und archivieren. KI-gestützte Analyse nach dem S20 Benchmark-Raster.',
  keywords: 'Sponsoring, Best Cases, S20, Benchmark, Marketing, Sport, Musik, Kultur',
  openGraph: {
    title: 'SponsorCaseRadar — Sponsoring Best Cases',
    description: 'Sponsoring Best Cases entdecken, bewerten und archivieren.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="bg-background text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
