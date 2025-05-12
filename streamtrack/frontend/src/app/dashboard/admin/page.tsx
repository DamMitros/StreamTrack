'use client'; 

import React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useRouter } from 'next/navigation'; 

const AdminDashboardPage = () => {
  const { keycloak, initialized } = useKeycloak();
  const router = useRouter();

  if (!initialized) {
    return <div>Ładowanie informacji o użytkowniku...</div>;
  }

  const isAdmin = keycloak.authenticated && keycloak.hasRealmRole('admin');

  if (!isAdmin) {
    // if (typeof window !== "undefined") { router.push('/') }
    return <div>Brak dostępu. Ta strona jest tylko dla administratorów.</div>; 
  }

  return (
    <div>
      <h1>Panel Administratora</h1>
      <p>Witaj w panelu administratora.</p>
      {/* Tutaj w przyszłości znajdzie się cokolwiek związane z byciem adminem */}
    </div>
  );
};

export default AdminDashboardPage;