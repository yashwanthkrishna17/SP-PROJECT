import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VivaGuard | AI Academic Oral Defense Platform',
  description:
    'VivaGuard uses adaptive AI oral defenses to evaluate whether students can genuinely explain and defend the academic work they submit.',
  keywords: [
    'Academic Integrity',
    'AI Oral Defense',
    'Student Viva',
    'Submission Evaluation',
    'Higher Education SaaS',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
