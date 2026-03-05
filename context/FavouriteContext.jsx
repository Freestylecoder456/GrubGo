/**
 * FavouriteContext - User favorites management
 * Manages adding/removing favorite dishes for authenticated users
 */
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../lib/firebase.config";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

const FavouriteContext = createContext(undefined);

/**
 * FavouriteProvider - Favorites state provider
 * Syncs user's favorites with Firestore
 */
export function FavouriteProvider({ children }) {
  const [favourites, setFavourites] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFavourites = async () => {
      if (!user) {
        setFavourites([]);
        return;
      }

      try {
        const q = query(
          collection(db, "Favourites"),
          where("userId", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        const userFavs = snapshot.docs.map((doc) => ({
          id: doc.id,
          dishId: doc.data().dishId,
        }));

        setFavourites(userFavs);
      } catch (error) {
        console.error("Error fetching favourites:", error);
      }
    };

    fetchFavourites();
  }, [user]);

  const toggleFavourite = async (itemId, showAlert) => {
    if (!user) {
      if (showAlert) {
        showAlert("Please login to save favourites", "error");
      } else {
        alert("Please login to save favourites");
      }
      return;
    }

    try {
      const existing = favourites.find((fav) => fav.dishId === itemId);

      if (existing) {
        // Remove favourite
        await deleteDoc(doc(db, "Favourites", existing.id));
        setFavourites((prev) => prev.filter((fav) => fav.dishId !== itemId));
      } else {
        // Add favourite
        const newFav = await addDoc(collection(db, "Favourites"), {
          userId: user.uid,
          dishId: itemId,
          createdAt: serverTimestamp(),
        });

        setFavourites((prev) => [...prev, { id: newFav.id, dishId: itemId }]);
      }
    } catch (error) {
      console.error("Error updating favourite:", error);
    }
  };

  return (
    <FavouriteContext.Provider value={{ favourites, toggleFavourite }}>
      {children}
    </FavouriteContext.Provider>
  );
}

// Custom hook for accessing favourite context
export function useFavourite() {
  const context = useContext(FavouriteContext);
  if (context === undefined) {
    throw new Error("useFavourite must be used within a FavouriteProvider");
  }
  return context;
}