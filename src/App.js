import React, { Suspense, useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import { AuthProvider } from "./context/authContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toastConfig } from './utils/toast';
import './toastStyles.css';
import './styles/toast.css'; // 添加这一行
import { useTranslation } from 'react-i18next';
import EventLog from './pages/EventLog';

function App() {
    const { i18n } = useTranslation();
    const [isI18nInitialized, setIsI18nInitialized] = useState(false);

    useEffect(() => {
        i18n.on('initialized', () => {
            setIsI18nInitialized(true);
        });
    }, [i18n]);

    if (!isI18nInitialized) {
        return <div>Loading...</div>;
    }

    return (
        <AuthProvider>
            <Suspense fallback={<div>Loading...</div>}>
                <RouterProvider router={router} />
                <ToastContainer  {...toastConfig} />
            </Suspense>
        </AuthProvider>
    );
}

export default App;
