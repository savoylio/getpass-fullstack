import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext'; // 必须有这行引用

const inter = Inter({ subsets: ['latin'] });

export const metadata = { title: 'GetPass', description: 'Exam Prep' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* ToastProvider 必须在这里！就像给家里通电一样 */}
        <ToastProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}