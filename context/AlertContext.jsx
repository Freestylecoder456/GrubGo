import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  // Function to remove alert by ID
  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  // Main trigger function
  const showAlert = useCallback(
    (message, type = "success", duration = 4000) => {
      const id = Math.random().toString(36).substr(2, 9);
      setAlerts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => removeAlert(id), duration);
    },
    [removeAlert]
  );

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-md pointer-events-none">
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="pointer-events-auto"
            >
              <div
                className={`
                flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl
                ${
                  alert.type === "success"
                    ? "bg-green-500/10 border-green-500/20 text-green-500"
                    : alert.type === "error"
                    ? "bg-red-500/10 border-red-500/20 text-red-500"
                    : "bg-blue-500/10 border-blue-500/20 text-blue-500"
                }
              `}
              >
                <div className="flex-shrink-0">
                  {alert.type === "success" && <CheckCircle size={24} />}
                  {alert.type === "error" && <XCircle size={24} />}
                  {alert.type === "info" && <Info size={24} />}
                </div>

                <p className="flex-grow font-medium text-sm text-gray-800 dark:text-white">
                  {alert.message}
                </p>

                <button
                  onClick={() => removeAlert(alert.id)}
                  className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AlertContext.Provider>
  );
};

// Custom hook for easy access
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context)
    throw new Error("useAlert must be used within an AlertProvider");
  return context;
};