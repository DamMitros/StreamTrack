"use client";

import React from 'react';
import NotesSection from '@/components/notes/NotesSection';
import { useKeycloak } from '@react-keycloak/web'; 

const UserDashboardPage = () => {
  const { keycloak, initialized } = useKeycloak(); 

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

  if (!keycloak.authenticated) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950"></div>
        <div className="relative z-10 text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Wymagane logowanie</h2>
          <p className="text-gray-600 dark:text-gray-400">Nie jesteś zalogowany. Przejdź do strony logowania.</p>
        </div>
      </div>
    );
  }

  const userInfo = {
    fullname: keycloak.tokenParsed?.name || "Brak danych",
    firstname: keycloak.tokenParsed?.given_name || "Brak danych",
    lastname: keycloak.tokenParsed?.family_name || "Brak danych",
    email: keycloak.tokenParsed?.email || "Brak danych",
    username: keycloak.tokenParsed?.preferred_username || "Brak danych",
    emailVerified: keycloak.tokenParsed?.email_verified || false,
    roles: keycloak.tokenParsed?.realm_access?.roles || [],
    sessionId: keycloak.tokenParsed?.sid || "Brak danych",
    issuer: keycloak.tokenParsed?.iss || "Brak danych",
    authTime: keycloak.tokenParsed?.auth_time ? new Date(keycloak.tokenParsed.auth_time * 1000).toLocaleString('pl-PL') : "Brak danych",
    tokenExpiry: keycloak.tokenParsed?.exp ? new Date(keycloak.tokenParsed.exp * 1000).toLocaleString('pl-PL') : "Brak danych",
    profilePicture: keycloak.tokenParsed?.picture || "Brak danych",
  };

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
            <span className="text-gray-800 dark:text-gray-100">Użytkownika</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Zarządzaj swoim profilem i notatkami w jednym miejscu</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mr-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Informacje o Użytkowniku</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Imię i Nazwisko</label>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{userInfo.fullname}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Imię</label>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">{userInfo.firstname}</p>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Nazwisko</label>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">{userInfo.lastname}</p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">{userInfo.email}</p>
                  {userInfo.emailVerified ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Zweryfikowany
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Niezweryfikowany
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Nazwa użytkownika</label>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{userInfo.username}</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Role w systemie</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {userInfo.roles.length > 0 ? (
                    userInfo.roles.map((role, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">Brak przypisanych ról</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Czas logowania</label>
                  <p className="text-sm text-gray-800 dark:text-white">{userInfo.authTime}</p>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Wygaśnięcie tokenu</label>
                  <p className="text-sm text-gray-800 dark:text-white">{userInfo.tokenExpiry}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edytuj profil
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Moje Notatki</h2>
            </div>
            <NotesSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;