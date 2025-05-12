"use client";

import { useKeycloak } from "@react-keycloak/web";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { keycloak } = useKeycloak();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = () => {
    try {
      keycloak.login();
    } catch (err) {
      setError(`Login error: ${(err as Error).message}`);
      console.error(err);
    }
  };

  const handleLogout = () => {
    try {
      keycloak.logout();
    } catch (err) {
      setError(`Logout error: ${(err as Error).message}`);
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Autoryzacja</h1>
      {error && (
        <div>
          {error}
        </div>
      )}
      
      <div>
        {!keycloak.authenticated ? (
          <button onClick={handleLogin}>Zaloguj się</button>
        ) : (
          <div>
            <p>Zalogowano jako <span className="font-semibold">{keycloak.tokenParsed?.preferred_username || "User"}</span></p>
            <button onClick={handleLogout}>Wyloguj się</button>
            <button onClick={() => router.push('/')}>Powrót na strone główną</button>
          </div>
        )}
      </div>
    </div>
  );
}