'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Entry() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/home');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 text-indigo-600">
      <Loader2 className="animate-spin h-10 w-10 mb-4" />
      <h1 className="text-xl font-semibold text-gray-700">Loading GetPass...</h1>
    </div>
  );
}