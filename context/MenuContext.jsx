/**
 * MenuContext - Menu items management
 * Fetches and provides menu data from Firestore
 */
import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../lib/firebase.config";
import { collection, getDocs } from "firebase/firestore";

const MenuContext = createContext(undefined);

/**
 * MenuProvider - Menu data provider
 * Fetches menu items from Firestore on mount
 */
export function MenuProvider({ children }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all menu items
  const getMenu = async () => {
    setLoading(true);

    try {
      const menuRef = collection(db, "Menu"); // Firestore "Menu" collection
      const snapshot = await getDocs(menuRef);

      const fetchedMenu = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMenuItems(fetchedMenu);
    } catch (error) {
      console.error("Error getting menu items:", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    getMenu();
  }, []);

  return (
    <MenuContext.Provider
      value={{
        menuItems,
        loading,
        getMenu,
        setMenuItems,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

// Custom hook for accessing menu context
export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
}