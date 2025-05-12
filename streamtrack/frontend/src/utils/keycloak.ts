import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'realm',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'clientid',
};

console.log('Keycloak configuration from utils/keycloak.ts:', keycloakConfig); 
const keycloak = new Keycloak(keycloakConfig);

export default keycloak;