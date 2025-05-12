"use client";

import { useKeycloak } from '@react-keycloak/web';
import { useRouter } from 'next/navigation';

export const Navigation = () => {
  const { keycloak, initialized } = useKeycloak();
  const router = useRouter(); 

  const handleLogout = () => {
    if (keycloak.authenticated) {
      keycloak.logout({ redirectUri: window.location.origin });
    }
  };

  const isAdmin = initialized && keycloak.authenticated && keycloak.hasRealmRole('admin');

  return (
    <header style={{ padding: '1rem', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <button onClick={()=> router.push("/")}> Streamtrack </button>
      </div>
      <nav>
        <button onClick={()=> router.push("/")}> Strona Główna</button>
        {isAdmin && (
          <button onClick={()=> router.push("/dashboard/admin")}> Panel Admina</button>
        )}

        {initialized && !keycloak.authenticated ? (
          <button onClick={()=> router.push("/login")}> Zaloguj się</button>
        ) : (
          <p> Heeej, {keycloak.tokenParsed?.name|| "Użytkowniku"} </p>
        )}

        {initialized && keycloak.authenticated && (
          <button onClick={handleLogout}>Wyloguj</button>
        )}

        {!initialized && (
          <span style={{ marginRight: '15px' }}>Ładowanie...</span>
        )}
      </nav>
    </header>
  );
};