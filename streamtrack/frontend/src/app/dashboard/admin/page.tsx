'use client'; 

import React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useRouter } from 'next/navigation'; 

const AdminDashboardPage = () => {
  const { keycloak, initialized } = useKeycloak();
  const router = useRouter();

  if (!initialized) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950"></div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-200 dark:border-purple-800 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Ładowanie informacji o użytkowniku...</p>
        </div>
      </div>
    );
  }

  const isAdmin = keycloak.authenticated && keycloak.hasRealmRole('admin');

  if (!isAdmin) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950"></div>
        <div className="relative z-10 text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Brak dostępu</h2>
          <p className="text-gray-600 dark:text-gray-400">Ta strona jest tylko dla administratorów.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 transition-all duration-500"></div>
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-sky-300/30 to-purple-400/30 dark:from-sky-400/10 dark:to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-300/30 to-indigo-400/30 dark:from-pink-400/10 dark:to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 dark:from-purple-300 dark:via-pink-400 dark:to-red-400 bg-clip-text text-transparent">Panel</span>
            <br />
            <span className="text-gray-800 dark:text-gray-100">Administratora</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Zarządzaj aplikacją i użytkownikami</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center mr-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Witaj, Administratorze!</h2>
                <p className="text-gray-600 dark:text-gray-400">Masz pełny dostęp do funkcji administracyjnych</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Zarządzanie użytkownikami</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Funkcje zarządzania użytkownikami będą dostępne wkrótce</p>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Statystyki systemu</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Przegląd statystyk i analityki będzie dostępny wkrótce</p>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Konfiguracja systemu</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Ustawienia systemowe i konfiguracja będą dostępne wkrótce</p>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Logi systemowe</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Przegląd logów i aktywności systemu będzie dostępny wkrótce</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;