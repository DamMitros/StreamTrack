'use client';

import { useKeycloak } from '@react-keycloak/web';
import { useRouter } from 'next/navigation';

export default function AccountDeactivatedPage() {
  const { keycloak } = useKeycloak();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await keycloak.logout({ 
        redirectUri: window.location.origin 
      });
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = '/';
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-slate-900 dark:to-red-950 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-2">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-red-200 dark:border-red-800">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Konto zostało dezaktywowane</h1>

          <div className="space-y-4 mb-8">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Twoje konto zostało tymczasowo dezaktywowane przez administratora.</p>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">Aby reaktywować konto, skontaktuj się z obsługą techniczną.</p>
            </div>
          </div>

          <div className="space-y-3">
            <button onClick={handleLogout} className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300">Wyloguj się</button>
            <button onClick={handleGoHome} className="w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600">Przejdź na stronę główną</button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Jeśli uważasz, że to błąd, skontaktuj się z administratorem</p>
          </div>
        </div>
      </div>
    </div>
  );
}
