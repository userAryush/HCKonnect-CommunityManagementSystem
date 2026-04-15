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
                    localStorage.setItem('user', JSON.stringify(userData));
                } catch (error) {
                    console.error("Failed to fetch user profile", error);
                    if (error.response && error.response.status === 401) {
                        logout();
                    }
                }
            } else {
                localStorage.removeItem('user');
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const register = async (payload) => {
        try {
            return await authService.register(payload);
        } catch (error) {
            throw error;
        }
    };

    // const login = async (email, password) => {
    //     try {
    //         await authService.login(email, password);
    //         if (!authService.isAuthenticated()) {
    //             throw new Error("Login failed: No token received");
    //         }
    //         const userData = await authService.getCurrentUser();
    //         setUser(userData);
    //         localStorage.setItem('user', JSON.stringify(userData));
    //         return userData;
    //     } catch (error) {
    //         console.error("Login failed in Context", error);
    //         logout();
    //         throw error;
    //     }
    // };

    const login = async (email, password) => {
        try {
            await authService.login(email, password);

            const userData = await authService.getCurrentUser();

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            return userData;

        } catch (error) {
            console.log("Login failed:", error.response?.status);
            throw error;
        }
    };
    const googleLogin = async (token, tokenType = 'access_token') => {
        try {
            await authService.googleLogin(token, tokenType);
            if (!authService.isAuthenticated()) {
                throw new Error("Login failed: No token received");
            }
            const fullUserData = await authService.getCurrentUser();
            setUser(fullUserData);
            localStorage.setItem('user', JSON.stringify(fullUserData));
            return fullUserData;
        } catch (error) {
            console.error("Google Login failed in Context", error);
            logout();
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        localStorage.removeItem('user');
    };

    const refreshUser = async () => {
        try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
        } catch (error) {
            console.error("Failed to refresh user", error);
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
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
