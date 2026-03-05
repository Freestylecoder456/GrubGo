/**
 * ReviewContext - Review management
 * Handles fetching, adding, and deleting user reviews
 */
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../lib/firebase.config";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

const ReviewContext = createContext(undefined);

/**
 * ReviewProvider - Review state provider
 * Manages user reviews and review operations
 */
export function ReviewProvider({ children }) {
  const [reviews, setReviewsState] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetch reviews when user changes
  useEffect(() => {
    if (user) {
      getReviews();
    } else {
      setReviewsState([]);
    }
  }, [user]);

  // Fetch reviews for the current user
  const getReviews = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const reviewsRef = collection(db, "Reviews");
      const q = query(reviewsRef, where("userId", "==", user.uid));

      const snapshot = await getDocs(q);

      const fetchedReviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReviewsState(fetchedReviews);
    } catch (error) {
      console.error("Error getting reviews:", error);
    }

    setLoading(false);
  };

  // Delete a review
  const deleteReview = async (reviewId) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, "Reviews", reviewId));

      // Update local state
      setReviewsState((prev) => prev.filter((r) => r.id !== reviewId));

      return { success: true };
    } catch (error) {
      console.error("Error deleting review:", error);
      return { success: false, error: error.message };
    }
  };

  // Get all reviews (for home page slider)
  const getAllReviews = async () => {
    setLoading(true);

    try {
      const reviewsRef = collection(db, "Reviews");
      const snapshot = await getDocs(reviewsRef);

      const fetchedReviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by rating (highest first)
      const sortedReviews = fetchedReviews.sort(
        (a, b) => (b.rating || 0) - (a.rating || 0)
      );

      return sortedReviews;
    } catch (error) {
      console.error("Error getting all reviews:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get reviews for a specific item
  const getReviewsByItemId = async (itemId) => {
    try {
      const reviewsRef = collection(db, "Reviews");
      const q = query(reviewsRef, where("itemId", "==", itemId));
      const snapshot = await getDocs(q);

      const fetchedReviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return fetchedReviews;
    } catch (error) {
      console.error("Error getting reviews by item ID:", error);
      return [];
    }
  };

  // Add a new review
  const addReview = async (reviewData) => {
    if (!user) return { success: false, error: "User not logged in" };

    try {
      const newReview = await addDoc(collection(db, "Reviews"), {
        ...reviewData,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email?.split("@")[0] || "Anonymous",
        createdAt: serverTimestamp(),
      });

      // Refresh reviews
      await getReviews();

      return { success: true, id: newReview.id };
    } catch (error) {
      console.error("Error adding review:", error);
      return { success: false, error: error.message };
    }
  };

  // Set reviews directly
  const setReviews = (newReviews) => {
    setReviewsState(newReviews);
  };

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        loading,
        getReviews,
        getAllReviews,
        getReviewsByItemId,
        setReviews,
        deleteReview,
        addReview,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}

// Custom hook for accessing review context
export function useReviews() {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error("useReviews must be used within a ReviewProvider");
  }
  return context;
}