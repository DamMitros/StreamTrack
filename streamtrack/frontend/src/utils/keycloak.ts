import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'streamtrack',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'frontend',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;