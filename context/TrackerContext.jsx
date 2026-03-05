/**
 * TrackerContext - Real-time order tracking
 * Manages WebSocket connection for live order location updates
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { io } from "socket.io-client";

const TrackerContext = createContext();

// Socket server URL - uses environment variable or localhost fallback
const SOCKET_URL = import.meta.env?.VITE_SOCKET_URL || "http://localhost:5000";

/**
 * TrackerProvider - Real-time location tracking provider
 * Handles WebSocket connection for order tracking
 */
export const TrackerProvider = ({ children }) => {
  const [location, setLocation] = useState(null); // Start at null to show "Loading..." on map
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const socket = useRef(null); // Use useRef to keep the socket instance stable
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Initialize socket connection with reconnection logic
  const initializeSocket = useCallback(() => {
    if (socket.current?.connected) return;

    try {
      socket.current = io(SOCKET_URL, {
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
      });

      socket.current.on("connect", () => {
        console.log("Socket connected:", socket.current.id);
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      });

      socket.current.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        setIsConnected(false);
      });

      socket.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setConnectionError(error.message);
        reconnectAttempts.current++;

        if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.error("Max reconnection attempts reached");
        }
      });

      // Listen for updates globally within the context
      socket.current.on("location-update", (data) => {
        console.log("New Location Received:", data);
        setLocation({ lat: data.latitude, lng: data.longitude });
      });
    } catch (error) {
      console.error("Error initializing socket:", error);
      setConnectionError(error.message);
    }
  }, []);

  useEffect(() => {
    initializeSocket();

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [initializeSocket]);

  const joinOrderRoom = (orderId) => {
    if (socket.current && orderId) {
      socket.current.emit("join-order", orderId);
      console.log("Joined order room:", orderId);
    }
  };

  // Helper to send location (used by admin/driver)
  const sendLocation = useCallback((orderId, lat, lng) => {
    if (socket.current && orderId) {
      socket.current.emit("send-location", {
        orderId,
        latitude: lat,
        longitude: lng,
      });
      console.log("Location sent for order:", orderId, { lat, lng });
    }
  }, []);

  return (
    <TrackerContext.Provider
      value={{
        location,
        joinOrderRoom,
        sendLocation,
        isConnected,
        connectionError,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
};

// Custom hook for accessing tracker context
export const useTracker = () => useContext(TrackerContext);