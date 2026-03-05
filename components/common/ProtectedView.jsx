import React from "react";
import { motion } from "framer-motion";

/**
 * ProtectedView - Access control wrapper component
 * Displays loading state or access denied message based on user authentication
 * @param {object} user - Current user object from auth
 * @param {boolean} loading - Loading state flag
 * @param {React.ReactNode} children - Content to render when authorized
 * @param {string} message - Access denied title message
 * @param {string} subMessage - Access denied description
 * @param {string} icon - Emoji icon to display
 */
export default function ProtectedView({
    user,
    loading = false,
    children,
    message = "Please login to view this page",
    subMessage = "Sign in to access this feature.",
    icon = "🔒"
}) {
    if (loading) {
        return (
            <div className="min-h-screen dark:bg-[#0a0a0a] bg-white flex items-center justify-center transition-colors duration-300">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen dark:bg-[#0a0a0a] bg-white dark:text-white flex items-center justify-center transition-colors duration-300">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center p-10 max-w-md mx-auto relative z-10"
                >
                    <div className="text-6xl mb-6 opacity-80">{icon}</div>
                    <h2 className="text-2xl font-bold mb-4 dark:text-white text-gray-900">{message}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">{subMessage}</p>
                </motion.div>
            </div>
        );
    }

    return <>{children}</>;
}
