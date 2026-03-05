import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../lib/firebase.config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";

/**
 * AuthContext - Firebase authentication and user profile management
 * Provides user authentication state and Firestore profile data
 */
const AuthContext = createContext(undefined);

/**
 * AuthProvider - Authentication state provider component
 * Manages Firebase auth state, user profile fetching, and loading screen
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Firestore
  const fetchUserData = useCallback(async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "Users", userId));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, []);

  // Update user profile in Firestore
  const updateUserProfile = async (updates) => {
    if (!user) return { success: false, error: "User not logged in" };

    try {
      const userRef = doc(db, "Users", user.uid);
      await setDoc(userRef, { ...userData, ...updates }, { merge: true });

      // Update local state
      setUserData((prev) => ({ ...prev, ...updates }));

      return { success: true };
    } catch (error) {
      console.error("Error updating user profile:", error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Fetch additional profile data from Firestore (username, role, etc.)
        try {
          const userDoc = await getDoc(doc(db, "Users", currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, userData, loading, updateUserProfile }}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          /* App Loading Screen */
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 bg-orange-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(234,88,12,0.3)] mb-6"
            >
              <UtensilsCrossed
                className="text-black h-10 w-10"
                strokeWidth={3}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white font-black tracking-[0.5em] uppercase text-xs"
            >
              Preparing <span className="text-orange-500">GrubGo</span>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </AuthContext.Provider>
  );
}

// Custom hook for accessing authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};