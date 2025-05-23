"use client";

import React, { useEffect } from 'react';
import NotesSection from '@/components/notes/NotesSection';
import { useKeycloak } from '@react-keycloak/web'; 

const UserDashboardPage = () => {
  const { keycloak, initialized } = useKeycloak(); 

  useEffect(() => {
    if (initialized && keycloak.authenticated && keycloak.profile) {
      console.log("Keycloak user profile:", keycloak.profile);
    }
  }, [initialized, keycloak.authenticated, keycloak.profile]);

  if (!initialized) {
    return <div>Ładowanie informacji o użytkowniku...</div>;
  }

  if (!keycloak.authenticated) {
    return <div>Nie jesteś zalogowany. Przejdź do strony logowania.</div>;
  }

  const userInfo = {
    name: keycloak.profile?.firstName && keycloak.profile?.lastName 
          ? `${keycloak.profile.firstName} ${keycloak.profile.lastName}` 
          : keycloak.profile?.username || "Brak danych",
    email: keycloak.profile?.email || "Brak danych",
    username: keycloak.profile?.username || "Brak danych",
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Panel Użytkownika</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Informacje o Użytkowniku</h2>
        <div className="bg-white shadow rounded-lg p-4 dark:bg-gray-800">
          <p><strong>Imię i Nazwisko:</strong> {userInfo.name}</p>
          <p><strong>Email:</strong> {userInfo.email}</p>
          <p><strong>Nazwa użytkownika:</strong> {userInfo.username}</p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Moje Notatki</h2>
        <NotesSection />
      </div>
    </div>
  );
};

export default UserDashboardPage;