import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'EsenceLab - AI Resume Screening & Job Matching',
  description: 'AI-powered resume screening and job matching platform for campus recruitment',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FFFBF5]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
