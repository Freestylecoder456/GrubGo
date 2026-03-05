/**
 * OrderContext - Order management
 * Handles order placement, fetching, and status updates
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
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";

const OrderContext = createContext(undefined);

/**
 * OrderProvider - Order state provider
 * Manages user orders and order placement
 */
export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const { user } = useAuth();

  // Fetch user orders
  const getOrders = async () => {
    if (!user) {
      setOrders([]);
      return;
    }

    setLoading(true);

    try {
      const ordersRef = collection(db, "Orders");
      const q = query(ordersRef, where("userId", "==", user.uid));

      const snapshot = await getDocs(q);

      const fetchedOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error getting orders:", error);
    }

    setLoading(false);
  };

  // Automatically fetch orders when user changes
  useEffect(() => {
    getOrders();
  }, [user]);

  // Get all orders (for popularity tracking - admin feature)
  const getAllOrders = async () => {
    setLoading(true);

    try {
      const ordersRef = collection(db, "Orders");
      const snapshot = await getDocs(ordersRef);

      const fetchedOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return fetchedOrders;
    } catch (error) {
      console.error("Error getting all orders:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Place a new order
  const handlePlaceOrder = async ({
    selectedItem,
    quantity,
    checkoutName,
    checkoutEmail,
    checkoutPhone,
    deliveryAddress,
    paymentMethod,
    closeCheckout,
    showAlert,
  }) => {
    if (!checkoutName || !checkoutEmail || !checkoutPhone || !deliveryAddress) {
      if (showAlert) {
        showAlert(
          "Please fill in all contact details and delivery address",
          "error"
        );
      } else {
        alert("Please fill in all contact details and delivery address");
      }
      return;
    }

    setIsPlacingOrder(true);

    try {
      const orderData = {
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        itemPhoto: selectedItem.img,
        itemPrice: selectedItem.price,
        quantity,
        totalPrice: (selectedItem.price * quantity).toFixed(2),
        description: selectedItem.desc,
        customerName: checkoutName,
        customerEmail: checkoutEmail,
        customerPhone: checkoutPhone,
        deliveryAddress,
        paymentMethod,
        status: "pending",
        createdAt: serverTimestamp(),
        userId: user ? user.uid : null,
      };

      await addDoc(collection(db, "Orders"), orderData);

      // Show success message
      if (showAlert) {
        showAlert("Order placed successfully!", "success");
      }

      // Optionally close checkout in the component
      if (closeCheckout) closeCheckout();

      // Refresh the order list
      getOrders();
    } catch (error) {
      console.error("Error placing order:", error);
      if (showAlert) {
        showAlert("Failed to place order. Please try again.", "error");
      } else {
        alert("Failed to place order. Please try again.");
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Update order status (for admin)
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "Orders", orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      // Refresh orders
      getAllOrders().then((fetchedOrders) => {
        setOrders(fetchedOrders);
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating order status:", error);
      return { success: false, error: error.message };
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        getOrders,
        getAllOrders,
        setOrders,
        handlePlaceOrder,
        isPlacingOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

// Custom hook for accessing order context
export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
}