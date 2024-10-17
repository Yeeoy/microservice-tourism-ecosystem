import React, { createContext, useState, useEffect } from "react";
import { post, get } from "../utils/api";
import { useTranslation } from 'react-i18next';
import { showToast } from "../utils/toast"; // 添加这行

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleError = (response) => {
        let errorMessage;
        if (response.code === 401 && response.msg && response.msg.detail) {
            errorMessage = response.msg.detail;
        } else if (response.msg && typeof response.msg === 'object') {
            errorMessage = Object.values(response.msg).join(', ');
        } else if (response.msg) {
            errorMessage = response.msg;
        } else {
            errorMessage = t("unknownError");
        }
        return { code: response.code, error: errorMessage };
    };

    const login = async (email, password) => {
        try {
            const response = await post("/api/customUser/token/", { email, password });
            if (response.code === 200 && response.data) {
                const { access, refresh, user_id } = response.data;
                localStorage.setItem("access_token", access);
                localStorage.setItem("refresh_token", refresh);
                localStorage.setItem("user_id", user_id);
                

                const userResponse = await get("/api/customUser/me/");
                if (userResponse.code === 200 && userResponse.data) {
                    const { is_staff } = userResponse.data;
                    localStorage.setItem("is_staff", is_staff); 
                    const userData = userResponse.data;
                    setUser(userData);
                    return { code: 200, data: userData };
                }
            }
            return handleError(response);
        } catch (err) {
            console.error(t("loginError"), err);
            return handleError(err.response ? err.response.data : { code: 500, msg: t("unknownError") });
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await post("/api/customUser/create/", {
                email,
                password,
                name,
            });
            if (response.code === 201 && response.data) {
                return await login(email, password);
            }
            return handleError(response);
        } catch (err) {
            console.error(t("registrationError"), err);
            return handleError(err.response ? err.response.data : { code: 500, msg: t("unknownError") });
        }
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_id");
        setUser(null);
        showToast.info(t("logoutSuccess"));
    };

    const getCurrentUser = () => {
        return user;
    };

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("access_token");
            if (token) {
                try {
                    const userResponse = await get("/api/customUser/me/");
                    if (userResponse.code === 200 && userResponse.data) {
                        setUser(userResponse.data);
                    } else {
                        logout();
                    }
                } catch (err) {
                    console.error(t("authCheckError"), err);
                    logout();
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const value = {
        user,
        setUser,
        loading,
        error,
        login,
        register,
        logout,
        getCurrentUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
