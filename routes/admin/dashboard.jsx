import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router";
import { useOrders } from "../../context/OrderContext";
import { useMenu } from "../../context/MenuContext";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  ArrowRight,
  Package,
  Calendar
} from "lucide-react";
import AdminPageWrapper from "../../components/admin/AdminPageWrapper";

export default function AdminDashboard() {
  const { user, userData, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { getAllOrders } = useOrders();
  const { menuItems } = useMenu();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user || userData?.role !== "admin") {
      if (!user) navigate("/auth/signin");
      else if (userData?.role !== "admin") navigate("/");
      return;
    }

    setIsReady(true);
  }, [user, userData, authLoading, navigate]);

  useEffect(() => {
    if (!isReady) return;

    const fetchData = async () => {
      try {
        const orders = await getAllOrders();

        const totalOrders = orders?.length || 0;
        const revenue =
          orders?.reduce((sum, order) => {
            const price =
              typeof order.totalPrice === "number"
                ? order.totalPrice
                : parseFloat(order.totalPrice || 0);
            return sum + price;
          }, 0) || 0;
        const pendingOrders =
          orders?.filter((o) => o.status === "pending").length || 0;
        const completedOrders =
          orders?.filter((o) => o.status === "completed").length || 0;

        setStats({ totalOrders, revenue, pendingOrders, completedOrders });

        const sorted = [...(orders || [])]
          .sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(0);
            const dateB = b.createdAt?.toDate?.() || new Date(0);
            return dateB - dateA;
          })
          .slice(0, 5);

        setRecentOrders(sorted);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, [isReady]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const orders = await getAllOrders();

      const totalOrders = orders?.length || 0;
      const revenue =
        orders?.reduce((sum, order) => {
          const price =
            typeof order.totalPrice === "number"
              ? order.totalPrice
              : parseFloat(order.totalPrice || 0);
          return sum + price;
        }, 0) || 0;
      const pendingOrders =
        orders?.filter((o) => o.status === "pending").length || 0;
      const completedOrders =
        orders?.filter((o) => o.status === "completed").length || 0;

      setStats({ totalOrders, revenue, pendingOrders, completedOrders });

      const sorted = [...(orders || [])]
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        })
        .slice(0, 5);

      setRecentOrders(sorted);
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  if (authLoading || !isReady) {
    return (
      <div
        className={`min-h-screen ${
          isDark ? "bg-black" : "bg-gray-50"
        } flex items-center justify-center`}
      >
        <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (userData?.role !== "admin") {
    return null;
  }

  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-400",
    },
    {
      title: "Total Revenue",
      value: `$${stats.revenue.toFixed(2)}`,
      icon: DollarSign,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-500/10",
      iconColor: "text-green-400",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-500/10",
      iconColor: "text-yellow-400",
    },
    {
      title: "Completed",
      value: stats.completedOrders,
      icon: CheckCircle,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-500/10",
      iconColor: "text-red-400",
    },
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "accepted":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Clock size={12} />;
      case "accepted":
        return <ChefHat size={12} />;
      case "completed":
        return <CheckCircle size={12} />;
      case "cancelled":
        return <XCircle size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  return (
    <AdminPageWrapper
      title="Dashboard"
      subtitle={`Welcome back, ${userData?.displayName || "Admin"}`}
      icon={LayoutDashboard}
      onRefresh={handleRefresh}
      isRefreshing={refreshing}
      color="red"
    >
      <div className="space-y-4 md:space-y-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative group"
          >
            <div
              className="absolute inset-0 bg-linear-to-r opacity-20 group-hover:opacity-30 transition-opacity rounded-xl md:rounded-2xl"
              style={{ background: `linear-gradient(135deg, ${stat.color})` }}
            />
            <div className="relative bg-white/5 mb-2 backdrop-blur-sm border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-5 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] md:text-xs lg:text-sm text-gray-500 dark:text-gray-400 mb-0.5 md:mb-1 truncate">
                    {stat.title}
                  </p>
                  <p className="text-sm md:text-lg lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-1.5 md:p-2 lg:p-3 rounded-lg md:rounded-xl ${stat.bgColor} ml-1 flex-shrink-0`}
                >
                  <stat.icon
                    className={`h-3 w-3 md:h-4 md:w-4 lg:h-6 lg:w-6 ${stat.iconColor}`}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions & System Status - Stack on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-8">
        <Link
          to="/admin/orders"
          className="group relative overflow-hidden rounded-xl md:rounded-2xl bg-linear-to-r from-red-500 to-red-600 p-4 md:p-6 hover:shadow-lg hover:shadow-red-500/25 transition-all"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30" />
          <div className="relative flex items-center justify-between">
            <div>
              <h3 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                Manage Orders
              </h3>
              <p className="text-red-100 mt-0.5 md:mt-1 text-xs md:text-sm">
                {stats.pendingOrders} pending orders
              </p>
            </div>
            <div className="p-2 md:p-3 bg-white/20 rounded-lg md:rounded-xl">
              <ShoppingCart className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-white" />
            </div>
          </div>
        </Link>

        <Link
          to="/admin/add-menu"
          className="group relative overflow-hidden rounded-xl md:rounded-2xl bg-white/5 border border-white/10 p-4 md:p-6 hover:border-red-500/30 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm md:text-base lg:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-red-500 transition-colors">
                Add Menu Item
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-0.5 md:mt-1 text-xs md:text-sm">
                {menuItems?.length || 0} items in menu
              </p>
            </div>
            <div className="p-2 md:p-3 bg-red-500/10 rounded-lg md:rounded-xl group-hover:bg-red-500/20 transition-colors">
              <Package className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-red-400" />
            </div>
          </div>
        </Link>

        <div className="rounded-xl md:rounded-2xl bg-white/5 border border-white/10 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <h3 className="text-sm md:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
              System Status
            </h3>
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] md:text-xs text-green-400 font-medium">
                Online
              </span>
            </div>
          </div>
          <div className="space-y-2 md:space-y-3">
            <div className="flex justify-between items-center py-1.5 md:py-2 border-b border-white/5">
              <span className="text-gray-400 text-xs md:text-sm">Database</span>
              <span className="text-green-400 text-xs md:text-sm font-medium">
                Connected
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 md:py-2 border-b border-white/5">
              <span className="text-gray-400 text-xs md:text-sm">
                Menu Items
              </span>
              <span className="text-gray-900 dark:text-white text-xs md:text-sm font-medium">
                {menuItems?.length || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 md:py-2">
              <span className="text-gray-400 text-xs md:text-sm">
                Total Revenue
              </span>
              <span className="text-red-400 text-xs md:text-sm font-bold">
                ${stats.revenue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders - Scroll horizontally on mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl md:rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
      >
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 bg-red-500/10 rounded-lg">
              <Calendar className="h-4 w-4 md:h-5 md:w-5 text-red-400" />
            </div>
            <h3 className="text-sm md:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
              Recent Orders
            </h3>
          </div>
          <Link
            to="/admin/orders"
            className="flex items-center gap-1 text-xs md:text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile: Card view, Desktop: Table view */}
        <div className="md:hidden">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingCart className="h-12 w-12 mx-auto text-gray-600 mb-3" />
              <p className="text-gray-400 dark:text-gray-500 text-base">
                No orders yet
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                Orders will appear here when customers place them
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-sm font-medium text-red-400">
                        #{order.id?.slice(0, 8).toUpperCase() || "N/A"}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {order.customerName || "N/A"}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status || "pending"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    {order.itemPhoto && (
                      <img
                        src={order.itemPhoto}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {order.itemName || "Unknown Item"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.customerEmail || ""}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      $
                      {typeof order.totalPrice === "number"
                        ? order.totalPrice.toFixed(2)
                        : parseFloat(order.totalPrice || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          {recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingCart className="h-16 w-16 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 dark:text-gray-500 text-lg">
                No orders yet
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Orders will appear here when customers place them
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-red-400">
                        #{order.id?.slice(0, 8).toUpperCase() || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {order.customerName || "N/A"}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-500">
                          {order.customerEmail || ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {order.itemPhoto && (
                          <img
                            src={order.itemPhoto}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        )}
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {order.itemName || "Unknown Item"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status || "pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        $
                        {typeof order.totalPrice === "number"
                          ? order.totalPrice.toFixed(2)
                          : parseFloat(order.totalPrice || 0).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </AdminPageWrapper>
  );
}