import React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase.config";
import { useAuth } from "../../context/AuthContext";
import { useOrders } from "../../context/OrderContext";
import { Package, ChevronRight, Search, X, Star, XCircle, Clock, CheckCircle, WifiOff, RefreshCw, ShoppingCart, MapPin } from "lucide-react";
import { useAlert } from '../../context/AlertContext'
import ReviewModel from "./ReviewModel";
import Checkout from "../common/Checkout";
import PageBackground from "../common/PageBackground";
import EmptyState from "../common/EmptyState";
import { useTracker } from "../../context/TrackerContext";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load OrderMap to avoid SSR issues with Leaflet
const OrderMap = lazy(() => import("./OrderMap"));

// Error Boundary Component
class OrderErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Order component error:', error, errorInfo);
    // You could send this to an error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-8 max-w-lg text-center">
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-red-500 font-bold text-xl mb-2">Something went wrong</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We're having trouble loading your orders. Please try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-red-600 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Utility functions
const fetchWithRetry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i === maxRetries - 1) break;

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }

  throw lastError;
};

const validateOrderId = (orderId) => {
  if (!orderId || typeof orderId !== 'string') return false;
  if (orderId.length > 1500) return false;
  if (/[\/\\]/.test(orderId)) return false; // No forward/backward slashes
  return true;
};

const validateReview = (reviewData) => {
  if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
    throw new Error("Rating must be between 1 and 5 stars");
  }

  if (!reviewData.reviewText || reviewData.reviewText.trim().length === 0) {
    throw new Error("Review text cannot be empty");
  }

  if (reviewData.reviewText.length > 1000) {
    throw new Error("Review text cannot exceed 1000 characters");
  }

  return true;
};

const formatPrice = (price) => {
  if (price === undefined || price === null) return "N/A";
  const num = typeof price === "number" ? price : parseFloat(price);
  return isNaN(num) ? "N/A" : `$${num.toFixed(2)}`;
};

const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  try {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "pending": return "text-red-500 bg-red-500/10 border-red-500/30";
    case "preparing": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
    case "ready": return "text-blue-500 bg-blue-500/10 border-blue-500/30";
    case "delivered": return "text-green-500 bg-green-500/10 border-green-500/30";
    case "completed": return "text-green-500 bg-green-500/10 border-green-500/30";
    case "cancelled": return "text-red-500 bg-red-500/10 border-red-500/30";
    default: return "text-gray-500 bg-gray-500/10 border-gray-500/30";
  }
};


// Main Component
function MyOrders() {
  const { user, loading: authLoading } = useAuth();
  const { showAlert } = useAlert();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderIdInput, setOrderIdInput] = useState("");
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackingMode, setTrackingMode] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);

  const { location, joinOrderRoom } = useTracker(); // Access live data
  const [trackedOrderId, setTrackedOrderId] = useState(null);
  const [showTrackingPanel, setShowTrackingPanel] = useState(false);

  const handleTrackOrderClick = (orderId) => {
    setTrackedOrderId(orderId);
    setShowTrackingPanel(true);
    joinOrderRoom(orderId); // Tell the server we want updates for this order
  };

  const closeTrackingPanel = () => {
    setShowTrackingPanel(false);
    setTrackedOrderId(null);
  };

  // Review state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);

  // Checkout state for reordering
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const { handlePlaceOrder, isPlacingOrder } = useOrders();

  // Handle order again (reorder)
  const handleOrderAgain = (order) => {
    // Create a menu item object from the order
    const reorderItem = {
      docId: order.itemId,
      name: order.itemName,
      img: order.itemPhoto,
      price: order.itemPrice,
      desc: order.description,
    };
    setSelectedItem(reorderItem);
    setQuantity(order.quantity || 1);
  };

  const closeCheckout = () => setSelectedItem(null);

  const handleSubmitOrder = (formValues) => {
    handlePlaceOrder({
      selectedItem,
      quantity,
      checkoutName: formValues.checkoutName,
      checkoutEmail: formValues.checkoutEmail,
      checkoutPhone: formValues.checkoutPhone,
      deliveryAddress: formValues.deliveryAddress,
      paymentMethod: formValues.paymentMethod,
      closeCheckout,
    });
  };

  // Refs for cleanup
  const fetchControllerRef = useRef(null);

  // Network status monitoring


  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Retry fetching orders when coming back online
      if (user) {
        setRetryCount(prev => prev + 1);
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      setError("You're offline. Showing cached data.");
      showAlert("You're offline. Showing cached data.", "error");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  // Fetch orders for logged-in user
  useEffect(() => {
    let isMounted = true;

    // Abort previous fetch
    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }

    fetchControllerRef.current = new AbortController();

    const fetchOrders = async () => {
      if (authLoading) return;
      if (!user) {
        if (isMounted) setOrders([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const ordersRef = collection(db, "Orders");
        const q = query(ordersRef, where("userId", "==", user.uid));

        // Add timeout to fetch
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Request timeout")), 30000);
        });

        const snapshot = await Promise.race([
          fetchWithRetry(() => getDocs(q)),
          timeoutPromise
        ]);

        if (!isMounted) return;

        const ordersData = [];

        // Fetch dish details with individual error handling
        for (const orderDoc of snapshot.docs) {
          if (!isMounted) break;

          const orderData = orderDoc.data();
          let dishData = null;

          if (orderData.dishId) {
            try {
              const dishRef = doc(db, "Menu", orderData.dishId);
              const dishSnap = await fetchWithRetry(() => getDoc(dishRef));

              if (dishSnap.exists()) {
                dishData = dishSnap.data();
              } else {
                console.warn(`Dish not found for ID: ${orderData.dishId}`);
              }
            } catch (dishError) {
              console.error(`Error fetching dish ${orderData.dishId}:`, dishError);
              // Continue with null dishData
            }
          }

          ordersData.push({
            id: orderDoc.id,
            ...orderData,
            dish: dishData,
            // Ensure required fields exist
            itemName: orderData.itemName || dishData?.name || "Unknown Item",
            category: orderData.category || dishData?.category || "Uncategorized",
            price: orderData.price || dishData?.price || 0,
            description: orderData.description || dishData?.description || "",
            itemPhoto: orderData.itemPhoto || dishData?.image || ""
          });
        }

        // Sort orders
        ordersData.sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );

        if (isMounted) {
          setOrders(ordersData);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);

        if (isMounted) {
          if (err.message === "Request timeout") {
            setError("Request timed out. Please check your connection and try again.");
          } else if (!navigator.onLine) {
            setError("You're offline. Please check your internet connection.");
          } else {
            setError("Failed to load orders. Please try again.");
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
      }
    };
  }, [user, authLoading, retryCount]);

  const handleManualOrderTrack = async (e) => {
    e.preventDefault();

    const orderId = orderIdInput.trim();

    // Validate input
    if (!orderId) {
      setError("Please enter an order ID");
      return;
    }

    if (!validateOrderId(orderId)) {
      setError("Invalid order ID format");
      return;
    }

    setLoading(true);
    setError("");
    setTrackedOrder(null);

    try {
      // Add timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 15000);
      });

      const orderDoc = await Promise.race([
        fetchWithRetry(() => getDoc(doc(db, "Orders", orderId))),
        timeoutPromise
      ]);

      if (orderDoc.exists()) {
        const orderData = orderDoc.data();

        // Fetch dish details if available
        let dishData = null;
        if (orderData.dishId) {
          try {
            const dishRef = doc(db, "Menu", orderData.dishId);
            const dishSnap = await getDoc(dishRef);
            if (dishSnap.exists()) {
              dishData = dishSnap.data();
            }
          } catch (dishError) {
            console.error("Error fetching dish for tracked order:", dishError);
          }
        }

        setTrackedOrder({
          id: orderDoc.id,
          ...orderData,
          dish: dishData,
          itemName: orderData.itemName || dishData?.name || "Unknown Item",
          itemPhoto: orderData.itemPhoto || dishData?.image || ""
        });
        setTrackingMode(true);
      } else {
        setError("Order not found. Please check the ID and try again.");
      }
    } catch (err) {
      console.error("Error tracking order:", err);

      if (err.message === "Request timeout") {
        setError("Request timed out. Please try again.");
      } else if (!navigator.onLine) {
        setError("You're offline. Please check your internet connection.");
      } else {
        setError("Failed to track order. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Open cancel confirmation modal
  const handleCancelOrder = (orderId) => {
    setShowCancelModal(true);
    setOrderToCancel(orderId);
  };

  // Confirm and process order cancellation
  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    
    setCancellingOrder(orderToCancel);
    setError("");

    try {
      const orderRef = doc(db, "Orders", orderToCancel);
      await fetchWithRetry(() => updateDoc(orderRef, {
        status: "cancelled",
        cancelledAt: new Date()
      }));

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderToCancel
            ? { ...order, status: "cancelled" }
            : order
        )
      );

      if (trackedOrder && trackedOrder.id === orderToCancel) {
        setTrackedOrder(prev => ({ ...prev, status: "cancelled" }));
      }

      showAlert("Order cancelled successfully!", "success");
    } catch (err) {
      console.error("Error cancelling order:", err);

      if (!navigator.onLine) {
        showAlert("You're offline. Please check your connection and try again.", "error");
      } else {
        showAlert("Failed to cancel order. Please try again.", "error");
      }
    } finally {
      setCancellingOrder(null);
      setShowCancelModal(false);
      setOrderToCancel(null);
    }
  };

  // Close cancel modal without action
  const closeCancelModal = () => {
    setShowCancelModal(false);
    setOrderToCancel(null);
  };

  const handleReviewOrder = (order) => {
    setSelectedOrderForReview(order);
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      // Validate review data
      validateReview(reviewData);

      // Add review to Firestore
      const reviewsRef = collection(db, "Reviews");
      await fetchWithRetry(() => addDoc(reviewsRef, {
        ...reviewData,
        userId: user?.uid,
        userEmail: user?.email,
        userName: user?.displayName || user?.email?.split('@')[0] || "Anonymous",
        createdAt: new Date()
      }));

      // Update order to mark as reviewed
      const orderRef = doc(db, "Orders", reviewData.orderId);
      await fetchWithRetry(() => updateDoc(orderRef, {
        reviewed: true,
        reviewedAt: new Date()
      }));

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === reviewData.orderId
            ? { ...order, reviewed: true }
            : order
        )
      );

      if (trackedOrder && trackedOrder.id === reviewData.orderId) {
        setTrackedOrder(prev => ({ ...prev, reviewed: true }));
      }

      showAlert("Review submitted successfully! Thank you for your feedback.", "success");
    } catch (error) {
      console.error("Error submitting review:", error);

      if (error.message.includes("Rating") || error.message.includes("Review text")) {
        throw error; // Re-throw validation errors to be handled by the modal
      } else {
        showAlert("Failed to submit review. Please try again.", "error");
        throw new Error("Failed to submit review");
      }
    }
  };

  const clearTrackedOrder = () => {
    setTrackedOrder(null);
    setOrderIdInput("");
    setTrackingMode(false);
    setError("");
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError("");
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center transition-colors duration-300">
        <Loader2 size={40} className="text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <OrderErrorBoundary>
      <div className="min-h-screen relative bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
        <PageBackground color="red" />

        {/* Offline indicator */}
        {isOffline && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black py-2 px-4 text-center text-sm font-medium">
            <WifiOff size={16} className="inline mr-2" />
            You're offline. Showing cached data.
          </div>
        )}

        {/* Review Model */}
        <ReviewModel
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedOrderForReview(null);
          }}
          order={selectedOrderForReview}
          onSubmit={handleSubmitReview}
        />

        {/* Cancel Confirmation Modal */}
        <AnimatePresence>
          {showCancelModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeCancelModal}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              
              {/* Modal Content */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-zinc-800"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Cancel Order?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to cancel this order? This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={closeCancelModal}
                      className="flex-1 px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      Keep Order
                    </button>
                    <button
                      onClick={confirmCancelOrder}
                      disabled={cancellingOrder === orderToCancel}
                      className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {cancellingOrder === orderToCancel ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Yes, Cancel"
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 md:mb-12"
          >
            <div className="w-16 md:w-20 h-[2px] bg-red-500 mb-3 md:mb-4" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight">
              <span className="font-black text-gray-900 dark:text-white transition-colors duration-300">MY</span>
              <span className="text-red-500 font-black ml-2 md:ml-4">ORDERS</span>
            </h1>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-600 font-medium mt-3 md:mt-4">
              {user ? "Your order history" : "Track your order"}
            </p>
          </motion.div>

          {/* Error display */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
              <p className="text-red-500 text-sm flex items-center justify-between">
                <span>{error}</span>
                <button
                  onClick={handleRetry}
                  className="text-red-500 hover:text-red-400 font-medium underline ml-4"
                >
                  Retry
                </button>
              </p>
            </div>
          )}

          {/* Live Tracking Panel */}
          <AnimatePresence>
            {showTrackingPanel && trackedOrderId && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </div>
                    <h3 className="text-xl font-bold dark:text-white">Live Delivery Tracking</h3>
                  </div>
                  <button
                    onClick={closeTrackingPanel}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                {/* The Map Component */}
                <Suspense fallback={<div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-3xl"><Loader2 className="animate-spin text-gray-500" /></div>}>
                  <OrderMap location={location} />
                </Suspense>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <p className="flex items-center gap-2">
                    <Package size={14} /> ID: #{trackedOrderId.slice(-6)}
                  </p>
                  <p className="flex items-center gap-2 italic">
                    <RefreshCw size={14} className="animate-spin-slow" /> Updating live...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Not logged in: Order ID input */}
          {!user && !trackingMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm dark:shadow-none transition-colors duration-300">
                <h2 className="text-2xl font-light mb-6">
                  <span className="font-black text-gray-900 dark:text-white">TRACK</span>
                  <span className="text-red-500 font-black ml-2">ORDER</span>
                </h2>
                <form onSubmit={handleManualOrderTrack} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                    <input
                      type="text"
                      value={orderIdInput}
                      onChange={(e) => setOrderIdInput(e.target.value)}
                      placeholder="Enter your order ID"
                      className="w-full bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-full py-4 pl-12 pr-6 outline-none focus:border-red-500 text-gray-900 dark:text-white transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                      disabled={loading}
                      aria-label="Order ID"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading || !orderIdInput.trim()}
                    className="w-full bg-red-500 text-black py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-red-400 transition-colors shadow-lg shadow-red-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Searching...
                      </>
                    ) : (
                      "Track Order"
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}

          {/* Display tracked order (non-logged-in user) */}
          {!user && trackedOrder && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-light">
                  <span className="font-black text-gray-900 dark:text-white">ORDER</span>
                  <span className="text-red-500 font-black ml-2">DETAILS</span>
                </h2>
                <button
                  onClick={clearTrackedOrder}
                  className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  aria-label="Clear tracked order"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm dark:shadow-none transition-colors duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Order ID</p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white break-all">{trackedOrder.id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(trackedOrder.status)}`}>
                    {trackedOrder.status || "Pending"}
                  </span>
                </div>

                {trackedOrder.itemPhoto && (
                  <img
                    src={trackedOrder.itemPhoto}
                    alt={trackedOrder.itemName}
                    className="w-24 h-24 object-cover rounded-xl mb-4"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Item</span>
                    <span className="text-gray-900 dark:text-white font-medium">{trackedOrder.itemName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Quantity</span>
                    <span className="text-gray-900 dark:text-white font-medium">{trackedOrder.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Total</span>
                    <span className="text-red-500 font-bold">{formatPrice(trackedOrder.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Ordered on</span>
                    <span className="text-gray-900 dark:text-white text-sm">{formatDate(trackedOrder.createdAt)}</span>
                  </div>
                </div>

                {/* Action buttons for tracked order */}
                {trackedOrder.status?.toLowerCase() === "completed" && !trackedOrder.reviewed && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleReviewOrder(trackedOrder)}
                    className="mt-6 w-full bg-red-500 text-black py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-red-400 transition-colors shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
                  >
                    <Star size={16} />
                    Write a Review
                  </motion.button>
                )}

                {trackedOrder.status?.toLowerCase() === "completed" && trackedOrder.reviewed && (
                  <div className="mt-6 w-full bg-green-500/10 text-green-500 py-3 rounded-full font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 border border-green-500/30">
                    <CheckCircle size={16} />
                    Review Submitted
                  </div>
                )}

                {/* Order Again Button - for tracked order */}
                {(trackedOrder.status?.toLowerCase() === "completed" || trackedOrder.status?.toLowerCase() === "delivered") && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOrderAgain(trackedOrder)}
                    className="mt-4 w-full bg-red-500/10 text-red-500 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-red-500 hover:text-black transition-colors flex items-center justify-center gap-2 border border-red-500/30"
                  >
                    <RefreshCw size={16} />
                    Order Again
                  </motion.button>
                )}

                {trackedOrder.status?.toLowerCase() === "pending" && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCancelOrder(trackedOrder.id)}
                    disabled={cancellingOrder === trackedOrder.id}
                    className="mt-6 w-full bg-red-500 text-white py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {cancellingOrder === trackedOrder.id ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        Cancel Order
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* Logged-in user: order list */}
          {user && (
            <div className="space-y-4">
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-500 mt-4">Loading your orders...</p>
                </div>
              )}

              {!loading && orders.length === 0 && (
                <div className="py-12">
                  <EmptyState
                    icon={Package}
                    title="No orders yet"
                    message="Your orders will appear here once you place them."
                  />
                </div>
              )}

              {!loading && orders.length > 0 &&
                orders
                  .sort((a, b) => {
                    const statusPriority = { pending: 1, preparing: 2, ready: 3, delivered: 4, completed: 5, cancelled: 6 };
                    const aPriority = statusPriority[a.status?.toLowerCase()] || 10;
                    const bPriority = statusPriority[b.status?.toLowerCase()] || 10;

                    if (aPriority !== bPriority) return aPriority - bPriority;

                    const aTime = a.createdAt?.seconds || new Date(a.createdAt).getTime() || 0;
                    const bTime = b.createdAt?.seconds || new Date(b.createdAt).getTime() || 0;
                    return bTime - aTime;
                  })
                  .map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Dish Image */}
                        {order.itemPhoto && (
                          <img
                            src={order.itemPhoto}
                            alt={order.itemName}
                            className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-cover rounded-lg md:rounded-xl flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}

                        {/* Order Info */}
                        <div className="flex-1 space-y-2 md:space-y-3 min-w-0">
                          {/* Name & Status */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">
                              {order.itemName}
                            </h3>
                            <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap ${getStatusColor(order.status)}`}>
                              {order.status || "Pending"}
                            </span>
                          </div>

                          {/* Description */}
                          {order.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {order.description}
                            </p>
                          )}

                          {/* Extra Info */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 text-xs">Category</span>
                              <p>{order.category || "N/A"}</p>
                            </div>

                            <div>
                              <span className="text-gray-500 text-xs">Unit Price</span>
                              <p className="text-red-500 font-bold">
                                {formatPrice(order.price)}
                              </p>
                            </div>

                            <div>
                              <span className="text-gray-500 text-xs">Quantity</span>
                              <p>{order.quantity}</p>
                            </div>

                            <div>
                              <span className="text-gray-500 text-xs">Total Paid</span>
                              <p className="text-green-500 font-bold">
                                {formatPrice(order.totalPrice)}
                              </p>
                            </div>

                            <div className="col-span-2 md:col-span-4">
                              <span className="text-gray-500 text-xs">Ordered On</span>
                              <p className="text-sm">{formatDate(order.createdAt)}</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2 md:gap-3 pt-2 md:pt-3">
                            {order.status?.toLowerCase() === "completed" && !order.reviewed && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleReviewOrder(order)}
                                className="bg-red-500 text-black px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider hover:bg-red-400 transition-colors flex items-center gap-1"
                              >
                                <Star size={12} md:size={14} />
                                Write Review
                              </motion.button>
                            )}

                            {order.status?.toLowerCase() === "pending" && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCancelOrder(order.id)}
                                disabled={cancellingOrder === order.id}
                                className="bg-red-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider hover:bg-red-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                              >
                                {cancellingOrder === order.id ? (
                                  <>
                                    <Loader2 size={12} md:size={14} className="animate-spin" />
                                    Cancelling...
                                  </>
                                ) : (
                                  <>
                                    <XCircle size={12} md:size={14} />
                                    Cancel
                                  </>
                                )}
                              </motion.button>
                            )}

                            {order.status?.toLowerCase() === "completed" && order.reviewed && (
                              <div className="bg-green-500/10 text-green-500 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1 border border-green-500/30">
                                <CheckCircle size={12} md:size={14} />
                                Reviewed
                              </div>
                            )}

                            {/* Order Again Button - for completed orders */}
                            {(order.status?.toLowerCase() === "completed" || order.status?.toLowerCase() === "delivered") && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleOrderAgain(order)}
                                className="bg-red-500/10 text-red-500 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider hover:bg-red-500 hover:text-black transition-colors flex items-center gap-1 border border-red-500/30"
                              >
                                <RefreshCw size={12} md:size={14} />
                                Order Again
                              </motion.button>
                            )}

                            {/* Track Driver Button - for active orders */}
                            {["pending", "preparing", "ready", "accepted", "delivered"].includes(order.status?.toLowerCase()) && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleTrackOrderClick(order.id)}
                                className="bg-green-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider hover:bg-green-600 transition-colors flex items-center gap-1 shadow-lg shadow-green-500/30"
                              >
                                <MapPin size={12} md:size={14} />
                                Track Driver
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
            </div>
          )}
        </div>

        {/* Checkout Component for reordering */}
        <Checkout
          selectedItem={selectedItem}
          isOpen={!!selectedItem}
          onClose={closeCheckout}
          quantity={quantity}
          setQuantity={setQuantity}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          handlePlaceOrder={handleSubmitOrder}
          isPlacingOrder={isPlacingOrder}
        />
      </div>
    </OrderErrorBoundary>
  );
}

export default MyOrders;