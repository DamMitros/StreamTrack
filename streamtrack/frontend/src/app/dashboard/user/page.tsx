"use client";

import React, { useState, useEffect } from 'react';
import NotesSection from '@/components/notes/NotesSection';
import { useKeycloak } from '@/context/keycloakProvider';
import { userService, User, UserUpdate } from '@/services/userService';
import SimpleAlert from '@/components/common/SimpleAlert';
import { getFullAvatarUrl, getAvatarInitial } from '@/utils/avatarUtils'; 

const UserDashboardPage = () => {
  const { keycloak, initialized } = useKeycloak();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserUpdate>({
    email: '',
    first_name: '',
    last_name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    if (initialized && keycloak.authenticated) {
      fetchUserProfile();
    }
  }, [initialized, keycloak.authenticated]);

  const fetchUserProfile = async () => {
    try {
      const profile = await userService.getProfile();
      setUser(profile);
      setFormData({
        email: profile.email,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
      });
    } catch (error: any) {
      setAlert({
        type: 'error',
        message: error.message || 'Nie udało się pobrać profilu użytkownika'
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert(null);

    try {
      if (avatarFile) {
        const avatarResponse = await userService.uploadAvatar(avatarFile);
        formData.avatar_url = avatarResponse.avatar_url;
      }

      const updatedUser = await userService.updateProfile(formData);
      setUser(updatedUser);
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      setAlert({
        type: 'success',
        message: 'Profil został zaktualizowany pomyślnie!'
      });
    } catch (error: any) {
      setAlert({
        type: 'error',
        message: error.message || 'Nie udało się zaktualizować profilu'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        email: user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
    }
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
  }; 

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
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 dark:from-purple-300 dark:via-pink-400 dark:to-red-400 bg-clip-text text-transparent">Panel</span>
            <br />
            <span className="text-gray-800 dark:text-gray-100">Użytkownika</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Zarządzaj swoim profilem i notatkami w jednym miejscu</p>
        </div>

        {alert && (
          <div className="mb-6 max-w-6xl mx-auto">
            <SimpleAlert 
              type={alert.type} 
              message={alert.message} 
              onClose={() => setAlert(null)}
            />
          </div>
        )}

        {isEditing && (
          <div className="mb-8 max-w-6xl mx-auto">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Edytuj Profil</h3>
                <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Zdjęcie profilowe</label>
                    <div className="flex items-center space-x-6">
                      <div className="shrink-0">
                        {avatarPreview ? (
                          <img className="h-16 w-16 object-cover rounded-full ring-4 ring-purple-100" src={avatarPreview} alt="Podgląd awatara" />
                        ) : user?.avatar_url ? (
                          <img className="h-16 w-16 object-cover rounded-full ring-4 ring-purple-100" src={getFullAvatarUrl(user.avatar_url) || ''} alt="Obecny awatar" />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg ring-4 ring-purple-100">
                            {getAvatarInitial(user?.first_name || user?.username)}
                          </div>
                        )}
                      </div>
                      <label className="block">
                        <span className="sr-only">Wybierz zdjęcie profilowe</span>
                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"/>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Imię</label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nazwisko</label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <button type="button" onClick={handleCancel} className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500">Anuluj</button>
                  <button type="submit" disabled={isLoading} className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="mr-4">
                {user?.avatar_url ? (
                  <img className="w-16 h-16 object-cover rounded-full ring-4 ring-purple-100" src={getFullAvatarUrl(user.avatar_url) || ''} alt="Awatar użytkownika" />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">{getAvatarInitial(user?.first_name || user?.username)}</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Informacje o Użytkowniku</h2>
                <button onClick={() => setIsEditing(true)} className="mt-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors duration-200">Edytuj profil</button>
              </div>
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
                <button onClick={() => setIsEditing(true)} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2">
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