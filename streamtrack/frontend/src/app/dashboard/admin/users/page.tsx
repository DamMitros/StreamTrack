'use client';

import { useState, useEffect } from 'react';
import { useKeycloak } from '@/context/keycloakProvider';
import { userService, User } from '@/services/userService';
import SimpleAlert from '@/components/common/SimpleAlert';
import { useRouter } from 'next/navigation';
import { getFullAvatarUrl, getAvatarInitial } from '@/utils/avatarUtils';

export default function AdminUsersPage() {
  const { keycloak, initialized } = useKeycloak();
  const router = useRouter();
  const isAuthenticated = initialized && keycloak.authenticated;
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    if (isAuthenticated && hasAdminRole()) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const hasAdminRole = () => {
    return keycloak?.tokenParsed?.realm_access?.roles?.includes('admin') || false;
  };

  const getUserPrimaryRole = (roles: string[]): string => {
    if (!roles || roles.length === 0) return 'użytkownik';
    return roles.includes('admin') ? 'admin' : 'użytkownik';
  };

  const getAvatarGradient = (username: string = '') => {
    const gradients = [
      'from-purple-400 to-pink-500',
      'from-blue-400 to-indigo-500',
      'from-green-400 to-emerald-500',
      'from-yellow-400 to-orange-500',
      'from-red-400 to-pink-500',
      'from-indigo-400 to-purple-500',
      'from-teal-400 to-cyan-500',
      'from-rose-400 to-red-500',
      'from-amber-400 to-yellow-500',
      'from-violet-400 to-purple-500'
    ];
    
    const hash = username.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return gradients[Math.abs(hash) % gradients.length];
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching users...');
      const fetchedUsers = await userService.getAllUsers();
      console.log('Fetched users:', fetchedUsers);
      setUsers(fetchedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Nie udało się pobrać listy użytkowników'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromoteUser = async (userId: string, currentRoles: string[]) => {
    try {
      const isAdmin = currentRoles.includes('admin');
      const newRole = isAdmin ? 'user' : 'admin';      
      const result = await userService.promoteUser({
        user_id: userId,
        role: newRole
      });

      setAlert({
        type: 'success',
        message: `Użytkownik został ${isAdmin ? 'zdegradowany z' : 'awansowany na'} administratora`
      });
      
      fetchUsers();
    } catch (error: any) {
      setAlert({
        type: 'error',
        message: error.message || 'Nie udało się zmienić uprawnień użytkownika'
      });
    }
  };

  const handleDeactivateUser = async (userId: string, username: string) => {
    try {
      const result = await userService.deactivateUser(userId);
      setAlert({
        type: 'success',
        message: `Użytkownik ${username} został dezaktywowany`
      });
      fetchUsers();
    } catch (error: any) {
      setAlert({
        type: 'error',
        message: error.message || 'Nie udało się dezaktywować użytkownika'
      });
    }
  };

  const handleActivateUser = async (userId: string, username: string) => {
    try {
      const result = await userService.activateUser(userId);
      setAlert({
        type: 'success',
        message: `Użytkownik ${username} został reaktywowany`
      });
      fetchUsers();
    } catch (error: any) {
      setAlert({
        type: 'error',
        message: error.message || 'Nie udało się reaktywować użytkownika'
      });
    }
  };

  if (!isAuthenticated) {
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

  if (!hasAdminRole()) {
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
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <button onClick={() => router.push("/dashboard/admin")} className="flex items-center text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors mr-4">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Powrót do panelu
            </button>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 dark:from-purple-300 dark:via-pink-400 dark:to-red-400 bg-clip-text text-transparent">Zarządzanie</span>
            <br />
            <span className="text-gray-800 dark:text-gray-100">Użytkownikami</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Zarządzaj kontami użytkowników i ich uprawnieniami</p>
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

        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Lista użytkowników</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Zarządzaj uprawnieniami i statusem kont</p>
                  </div>
                </div>
                <button onClick={fetchUsers} disabled={isLoading} className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg hover:shadow-xl">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isLoading ? 'Ładowanie...' : 'Odśwież'}
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-200 dark:border-purple-800 border-t-purple-500 rounded-full animate-spin"></div>
                <p className="text-lg text-gray-600 dark:text-gray-300">Ładowanie użytkowników...</p>
              </div>
            ) : (
              <div className="p-6">
                {users.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Brak użytkowników do wyświetlenia</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Użytkownik</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data utworzenia</th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Akcje</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map((user, index) => (
                          <tr key={user.id || user._id || `user-${index}-${user.username || index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12">
                                  {user.avatar_url ? (
                                    <img 
                                      src={getFullAvatarUrl(user.avatar_url) || ''} 
                                      alt={`Avatar ${user.username || 'użytkownika'}`}
                                      className="h-12 w-12 rounded-full object-cover shadow-lg ring-2 ring-purple-100 dark:ring-purple-800"
                                    />
                                  ) : (
                                    <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${getAvatarGradient(user.username)} flex items-center justify-center shadow-lg ring-2 ring-white/50 dark:ring-gray-700/50`}>
                                      <span className="text-sm font-bold text-white">
                                        {getAvatarInitial(user.first_name || user.username)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">{user.username || 'Nieznany użytkownik'}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {user.first_name && user.last_name 
                                      ? `${user.first_name} ${user.last_name}` 
                                      : 'Brak danych'
                                    }
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{user.email || 'Brak adresu email'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getUserPrimaryRole(user.roles) === 'admin' ? 'bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 border border-violet-200 dark:from-violet-900/30 dark:to-purple-900/30 dark:text-violet-300 dark:border-violet-700/50' : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300 dark:border-blue-700/50'}`} >{getUserPrimaryRole(user.roles)}</span> {/* Rola */}
                            </td> 
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${user.is_active ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200 dark:from-emerald-900/30 dark:to-green-900/30 dark:text-emerald-300 dark:border-emerald-700/50' : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-200 dark:from-orange-900/30 dark:to-red-900/30 dark:text-orange-300 dark:border-orange-700/50'}`}>{user.is_active ? 'Aktywny' : 'Nieaktywny'}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {user.created_at ? new Date(user.created_at).toLocaleDateString('pl-PL') : 'Brak danych'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex justify-end gap-2">
                                <button className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 shadow-sm border ${user.roles?.includes('admin') ? 'text-orange-700 bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 border-orange-200 dark:from-orange-900/20 dark:to-yellow-900/20 dark:text-orange-300 dark:hover:from-orange-900/30 dark:hover:to-yellow-900/30 dark:border-orange-700/50' : 'text-indigo-700 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border-indigo-200 dark:from-indigo-900/20 dark:to-purple-900/20 dark:text-indigo-300 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 dark:border-indigo-700/50'}`}
                                  onClick={() => {
                                    const id = user._id || user.id;
                                    const roles = user.roles || [];
                                    if (id) {
                                      handlePromoteUser(id, roles);
                                    }
                                }}>
                                  {user.roles?.includes('admin') ? 'Odbierz admin' : 'Nadaj admin'}
                                </button>
                                {user.is_active ? (
                                  <button className="px-3 py-2 text-xs font-medium rounded-lg text-red-700 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border border-red-200 dark:from-red-900/20 dark:to-pink-900/20 dark:text-red-300 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 dark:border-red-700/50 transition-all duration-200 shadow-sm"
                                    onClick={() => {
                                      const id = user._id || user.id;
                                      const username = user.username || 'Nieznany';
                                      if (id) {
                                        handleDeactivateUser(id, username);
                                      }
                                    }}>
                                    Dezaktywuj
                                  </button>
                                ) : (
                                  <button className="px-3 py-2 text-xs font-medium rounded-lg text-emerald-700 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border border-emerald-200 dark:from-emerald-900/20 dark:to-green-900/20 dark:text-emerald-300 dark:hover:from-emerald-900/30 dark:hover:to-green-900/30 dark:border-emerald-700/50 transition-all duration-200 shadow-sm"
                                    onClick={() => {
                                      const id = user._id || user.id;
                                      const username = user.username || 'Nieznany';
                                      if (id) {
                                        handleActivateUser(id, username);
                                      }
                                    }}>
                                    Aktywuj
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
