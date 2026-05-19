import { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import authService from '../service/authService';
import { useTheme } from '../../../shared/context/ThemeContext';
import { scheduleSilentRefresh } from '../../../shared/services/tokenRefresh';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { setThemePreference, resetThemeToGuestPreference } = useTheme();
    const cancelSilentRefreshRef = useRef(null);

    const stopSilentRefresh = useCallback(() => {
        if (cancelSilentRefreshRef.current) {
            cancelSilentRefreshRef.current();
            cancelSilentRefreshRef.current = null;
        }
    }, []);

    const startSilentRefresh = useCallback(() => {
        stopSilentRefresh();
        if (!authService.isAuthenticated()) return;

        cancelSilentRefreshRef.current = scheduleSilentRefresh(
            () => {},
            () => stopSilentRefresh(),
        );
    }, [stopSilentRefresh]);

    useEffect(() => {
        const initAuth = async () => {
            if (authService.isAuthenticated()) {
                try {
                    const hasValidToken = await authService.ensureValidAccessToken();
                    if (!hasValidToken) {
                        localStorage.removeItem('user');
                        setLoading(false);
                        return;
                    }

                    const userData = await authService.getCurrentUser();
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                    if (userData?.theme) {
                        await setThemePreference(userData.theme, { syncBackend: false });
                    }
                    startSilentRefresh();
                } catch (error) {
                    console.error('Failed to fetch user profile', error);
                    if (error.response?.status === 401) {
                        await logout();
                    }
                }
            } else {
                localStorage.removeItem('user');
            }
            setLoading(false);
        };

        initAuth();

        return () => stopSilentRefresh();
    }, [startSilentRefresh, stopSilentRefresh]);

    const register = async (payload) => {
        try {
            return await authService.register(payload);
        } catch (error) {
            throw error;
        }
    };

    const login = async (email, password) => {
        try {
            const loginData = await authService.login(email, password);
            const loginTheme = loginData?.data?.user?.theme;
            if (loginTheme) {
                await setThemePreference(loginTheme, { syncBackend: false });
            }

            const userData = await authService.getCurrentUser();

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            startSilentRefresh();

            return userData;
        } catch (error) {
            console.log('Login failed:', error.response?.status);
            throw error;
        }
    };

    const googleLogin = async (token, tokenType = 'access_token') => {
        try {
            const googleData = await authService.googleLogin(token, tokenType);
            if (!authService.isAuthenticated()) {
                throw new Error('Login failed: No token received');
            }
            const loginTheme = googleData?.user?.theme;
            if (loginTheme) {
                await setThemePreference(loginTheme, { syncBackend: false });
            }
            const fullUserData = await authService.getCurrentUser();
            setUser(fullUserData);
            localStorage.setItem('user', JSON.stringify(fullUserData));
            startSilentRefresh();
            return fullUserData;
        } catch (error) {
            console.error('Google Login failed in Context', error);
            await logout();
            throw error;
        }
    };

    const logout = async () => {
        stopSilentRefresh();
        await authService.logout();
        setUser(null);
        localStorage.removeItem('user');
        resetThemeToGuestPreference();
    };

    const refreshUser = async () => {
        try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            if (userData?.theme) {
                await setThemePreference(userData.theme, { syncBackend: false });
            }
            return userData;
        } catch (error) {
            console.error('Failed to refresh user', error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            register,
            login,
            logout,
            googleLogin,
            refreshUser,
            isAuthenticated: !!user,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
