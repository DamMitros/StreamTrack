"use client";

import { ReactKeycloakProvider } from "@react-keycloak/web";
import keycloak from "@/utils/keycloak";

const getInitOptions = () => ({
  onLoad: "check-sso",
  silentCheckSsoRedirectUri:
    (typeof window !== "undefined" ? window.location.origin : "") + "/silent-check-sso.html",
  pkceMethod: "S256",
  flow: "standard",
});

export default function KeycloakProvider({ children }) {
  return (
    <ReactKeycloakProvider authClient={keycloak} initOptions={getInitOptions()}>
      {children}
    </ReactKeycloakProvider>
  );
}