'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginPage } from '@/components/backoffice/LoginPage';
import { BackofficeDashboard } from '@/components/backoffice/BackofficeDashboard';

export default function BackofficeHome() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  if (isLoggedIn) {
    return (
      <BackofficeDashboard
        onLogout={() => {
          setIsLoggedIn(false);
          router.push('/');
        }}
      />
    );
  }

  return (
    <LoginPage
      onLoginSuccess={() => {
        setIsLoggedIn(true);
      }}
    />
  );
}
