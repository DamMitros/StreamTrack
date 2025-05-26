import { useEffect, useState } from 'react';
import { useKeycloak } from '@/context/keycloakProvider';
import { usePathname } from 'next/navigation';
import { userService } from '@/services/userService';

export const useUserStatusCheck = () => {
  const { keycloak, initialized } = useKeycloak();
  const pathname = usePathname();
  const [isUserActive, setIsUserActive] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (pathname === '/account-deactivated') {
        setIsUserActive(false);
        return;
      }

      if (!initialized || !keycloak.authenticated) {
        setIsUserActive(null);
        return;
      }

      setIsChecking(true);
      try {
        await userService.getProfile();
        setIsUserActive(true);
      } catch (error: any) {
        console.error('User status check failed:', error);
        
        if (error.message?.includes('dezaktywowane') || error.message?.includes('403')) {
          setIsUserActive(false);
          window.location.href = '/account-deactivated';
        } else {
          setIsUserActive(true);
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkUserStatus();
  }, [initialized, keycloak.authenticated, pathname]);

  return { isUserActive, isChecking };
};
