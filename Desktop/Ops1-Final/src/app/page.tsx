'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthState } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const { isAuthenticated } = getAuthState();
    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );
}
