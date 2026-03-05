import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";
import { useOrders } from "../../context/OrderContext";
import { useAlert } from "../../context/AlertContext";
import { useTracker } from "../../context/TrackerContext";
import {
  ShoppingCart,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  X,
  ChefHat,
  Navigation,
  Search,
} from "lucide-react";
import AdminPageWrapper from "../../components/admin/AdminPageWrapper";
import EmptyState from "../../components/common/EmptyState";

export default function OrderList() {
  const { user, userData, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { orders, loading, getAllOrders, updateOrderStatus } = useOrders();
  const { showAlert } = useAlert();
  const { joinOrderRoom, sendLocation, isConnected } = useTracker();
  const [filter, setFilter] = useState("all"); // all, pending, accepted, completed, cancelled
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Tracking state
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const trackingIntervalRef = useRef(null);

  // Start tracking driver location
  const startTracking = (orderId) => {
    if (!orderId) return;

    // Join the order room
    joinOrderRoom(orderId);
    setTrackingOrderId(orderId);
    setIsTracking(true);

    // Get GPS location and send to server
    const sendAdminLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            sendLocation(
              orderId,
              position.coords.latitude,
              position.coords.longitude
            );
            console.log("Admin location sent:", {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            console.error("Error getting admin location:", error);
          },
          { enableHighAccuracy: true }
        );
      } else {
        console.error("Geolocation not supported");
      }
    };

    // Send location immediately
    sendAdminLocation();

    // Then send location every 5 seconds
    trackingIntervalRef.current = setInterval(sendAdminLocation, 5000);

    showAlert("Location tracking started for this order!", "success");
  };

  // Stop tracking
  const stopTracking = () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    setTrackingOrderId(null);
    setIsTracking(false);
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth/signin");
      } else if (userData?.role !== "admin") {
        navigate("/");
      } else {
        getAllOrders();
      }
    }
  }, [user, userData, authLoading, navigate]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        showAlert(`Order ${newStatus} successfully!`, "success");
        getAllOrders();
      } else {
        showAlert(result.error || "Failed to update order", "error");
      }
    } catch (error) {
      showAlert("Failed to update order status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders =
    orders
      ?.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      })
      .filter((order) => {
        if (filter !== "all" && order.status !== filter) return false;
        
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            order.itemName?.toLowerCase().includes(query) ||
            order.customerName?.toLowerCase().includes(query) ||
            order.customerEmail?.toLowerCase().includes(query) ||
            order.customerPhone?.toLowerCase().includes(query) ||
            order.deliveryAddress?.toLowerCase().includes(query) ||
            order.id?.toLowerCase().includes(query)
          );
        }
        return true;
      }) || [];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "accepted":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "completed":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-500 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Clock size={14} />;
      case "accepted":
        return <ChefHat size={14} />;
      case "completed":
        return <CheckCircle size={14} />;
      case "cancelled":
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (userData?.role !== "admin") {
    return null;
  }

  const statusCounts = {
    all: orders?.length || 0,
    pending: orders?.filter((o) => o.status === "pending").length || 0,
    accepted: orders?.filter((o) => o.status === "accepted").length || 0,
    completed: orders?.filter((o) => o.status === "completed").length || 0,
    cancelled: orders?.filter((o) => o.status === "cancelled").length || 0,
  };

  return (
    <AdminPageWrapper
      title="Order Management"
      icon={ShoppingCart}
      onRefresh={getAllOrders}
      isRefreshing={loading}
      color="red"
    >
      <div className="w-full">
        {/* Search and Filter Section */}
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 mb-6">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search orders by item, customer name, email, phone, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2">
            {["all", "pending", "accepted", "completed", "cancelled"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-full font-medium capitalize text-sm transition-all ${
                    filter === status
                      ? "bg-red-600 text-white shadow-lg shadow-red-500/30"
                      : "bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20"
                  }`}
                >
                  {status} ({statusCounts[status]})
                </button>
              )
            )}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No orders found"
            message={
              filter === "all"
                ? "There are no orders yet"
                : `No ${filter} orders at the moment`
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:border-red-500/30 transition-all shadow-sm dark:shadow-none"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-lg font-semibold">
                        Order #{order.id?.slice(0, 8).toUpperCase() || "N/A"}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status || "pending"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Item Details */}
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">
                          Item Details
                        </h4>
                        <div className="flex items-center gap-3">
                          {order.itemPhoto && (
                            <img
                              src={order.itemPhoto}
                              alt={order.itemName}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="font-semibold">
                              {order.itemName || "Unknown Item"}
                            </p>
                            <p className="text-sm text-gray-400">
                              Qty: {order.quantity || 1}
                            </p>
                            <p className="text-sm text-gray-400">
                              ${order.itemPrice?.toFixed(2) || "0.00"} each
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Customer Details */}
                      <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">
                          Customer Details
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm dark:text-gray-300">
                            <User
                              size={14}
                              className="text-gray-500 dark:text-gray-400"
                            />
                            <span>{order.customerName || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm dark:text-gray-300">
                            <Mail
                              size={14}
                              className="text-gray-500 dark:text-gray-400"
                            />
                            <span>{order.customerEmail || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm dark:text-gray-300">
                            <Phone
                              size={14}
                              className="text-gray-500 dark:text-gray-400"
                            />
                            <span>{order.customerPhone || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm dark:text-gray-300">
                            <MapPin
                              size={14}
                              className="text-gray-500 dark:text-gray-400"
                            />
                            <span>{order.deliveryAddress || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Meta */}
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-400">
                      <span>Placed: {formatDate(order.createdAt)}</span>
                      <span>•</span>
                      <span>Payment: {order.paymentMethod || "N/A"}</span>
                      {order.userId && (
                        <>
                          <span>•</span>
                          <span>User ID: {order.userId.slice(0, 8)}...</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="flex flex-col items-end gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-500">
                        $
                        {typeof order.totalPrice === "number"
                          ? order.totalPrice.toFixed(2)
                          : parseFloat(order.totalPrice || 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-400">Total Amount</p>
                    </div>

                    {/* Status Buttons */}
                    <div className="flex flex-wrap gap-2 justify-end">
                      {order.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusUpdate(order.id, "accepted")
                            }
                            disabled={updatingId === order.id}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            <ChefHat size={16} />
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(order.id, "cancelled")
                            }
                            disabled={updatingId === order.id}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            <X size={16} />
                            Cancel
                          </button>
                        </>
                      )}
                      {order.status === "accepted" && (
                        <>
                          <button
                            onClick={() => startTracking(order.id)}
                            disabled={
                              isTracking && trackingOrderId === order.id
                            }
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                              trackingOrderId === order.id
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white hover:bg-red-600"
                            }`}
                          >
                            <Navigation size={16} />
                            {trackingOrderId === order.id
                              ? "Tracking..."
                              : "Start Tracking"}
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(order.id, "completed")
                            }
                            disabled={updatingId === order.id}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle size={16} />
                            Mark Completed
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(order.id, "cancelled")
                            }
                            disabled={updatingId === order.id}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            <X size={16} />
                            Cancel
                          </button>
                        </>
                      )}
                      {order.status === "completed" && (
                        <span className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-500 rounded-lg">
                          <CheckCircle size={16} />
                          Order Completed
                        </span>
                      )}
                      {order.status === "cancelled" && (
                        <span className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-500 rounded-lg">
                          <XCircle size={16} />
                          Order Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminPageWrapper>
  );
}