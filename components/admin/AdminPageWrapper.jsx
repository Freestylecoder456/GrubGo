/**
 * AdminPageWrapper - Admin dashboard layout wrapper
 * Provides consistent header, styling, and access control for admin pages
 */
import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ProtectedView from '../common/ProtectedView';
import PageBackground from '../common/PageBackground';

export default function AdminPageWrapper({
    children,
    title,
    subtitle,
    icon: Icon,
    onRefresh,
    isRefreshing,
    color = "orange"
}) {
    const { user, userData, loading: authLoading } = useAuth();
    const isAdmin = userData?.role === "admin";

    const colorStyles = {
        red: {
            gradient: "bg-linear-to-br from-red-500 to-red-600",
            shadow: "shadow-lg shadow-red-500/20",
            iconBorder: "border-2 border-red-500/20",
            buttonHover: "hover:border-red-500/30 hover:text-red-500",
        },
        orange: {
            gradient: "bg-linear-to-br from-orange-500 to-orange-600",
            shadow: "shadow-lg shadow-orange-500/20",
            iconBorder: "border-2 border-orange-500/20",
            buttonHover: "hover:border-orange-500/30 hover:text-orange-500",
        }
    };

    const themeClass = colorStyles[color] || colorStyles.orange;

    if (!user || !isAdmin) {
        return (
            <ProtectedView
                user={user && isAdmin}
                message="Admin Access Required"
                subMessage="You do not have permission to view this page."
                icon="🛡️"
            />
        );
    }

    return (
        <div className="min-h-screen bg-transparent transition-colors duration-300">
            <PageBackground color={color} />

            <div className="relative z-10 flex flex-col min-h-screen">
                <header className="relative bg-transparent">
                    <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 z-0" />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 border-b border-gray-200 dark:border-white/10 z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                {Icon && (
                                    <div className={`${themeClass.gradient} p-3 rounded-2xl ${themeClass.shadow}`}>
                                        <Icon className="text-white" size={24} />
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                        {title}
                                    </h1>
                                    {subtitle && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {onRefresh && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onRefresh}
                                        className={`p-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl transition-all text-gray-600 dark:text-gray-300 ${themeClass.buttonHover}`}
                                    >
                                        <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
                                    </motion.button>
                                )}

                                <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-white/10" />

                                <div className="flex items-center gap-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 py-1.5 px-2 rounded-full">
                                    {user?.photoURL ? (
                                        <img src={user.photoURL} alt="Admin" className={`w-8 h-8 rounded-full object-cover ${themeClass.iconBorder}`} />
                                    ) : (
                                        <div className={`${themeClass.gradient} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                                            {user?.displayName ? user.displayName[0].toUpperCase() : "A"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
