import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (authService.isAuthenticated()) {
                try {
                    const userData = await authService.getCurrentUser();
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData)); // Sync to local storage
                } catch (error) {
                    console.error("Failed to fetch user profile", error);
                    if (error.response && error.response.status === 401) {
                        logout();
                    }
                }
            } else {
                // Determine if we should clear user if token is missing
                localStorage.removeItem('user');
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const loginResp = await authService.login(email, password);
            // Verify token was set before fetching profile
            if (!authService.isAuthenticated()) {
                throw new Error("Login failed: No token received");
            }

            const userData = await authService.getCurrentUser();
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData)); // Sync to local storage
            return userData;
        } catch (error) {
            console.error("Login failed in Context", error);
            logout();
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        localStorage.removeItem('user'); // Clear from local storage
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
