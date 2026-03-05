import React from 'react';
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Coffee,
  IceCream,
  Sandwich,
  Timer,
  ChefHat,
  Search,
  X,
  Heart,
  Award,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  ShoppingCart,
  ChevronRight,
  Truck,
  Shield,
  CircleDollarSign,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAlert } from "../../context/AlertContext";
import { useFavourite } from "../../context/FavouriteContext";
import { useMenu } from "../../context/MenuContext";
import { useOrders } from "../../context/OrderContext";
import { useReviews } from "../../context/ReviewContext";
import Checkout from "./Checkout";

// Category icon mapping
const categoryIcons = {
  All: Zap,
  "Main Course": ChefHat,
  Beverages: Coffee,
  Desserts: IceCream,
  Sides: Sandwich,
  Appetizers: Timer,
  Salads: Zap,
  Breakfast: Coffee,
};

// Categories list
const categories = [
  "All",
  "Main Course",
  "Beverages",
  "Desserts",
  "Sides",
  "Appetizers",
  "Salads",
  "Breakfast",
];

export default function Menu() {
  const { user } = useAuth();
  const { showAlert } = useAlert();

  // UI state
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredItem, setHoveredItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [quickFilters, setQuickFilters] = useState({
    fastDelivery: false,
    topRated: false,
    inStock: false,
  });

  // Checkout form state - now managed by Checkout component via AuthContext
  const [paymentMethod, setPaymentMethod] = useState("card");

  // Context hooks
  const { favourites, toggleFavourite } = useFavourite();
  const { menuItems, loading } = useMenu();
  const { handlePlaceOrder, isPlacingOrder, getAllOrders } = useOrders();
  const { getReviewsByItemId } = useReviews();

  // Store reviews for each menu item
  const [itemReviews, setItemReviews] = useState({});
  const [itemOrderCounts, setItemOrderCounts] = useState({});

  // Fetch reviews for menu items
  useMemo(() => {
    const fetchReviewsForItems = async () => {
      if (!menuItems || menuItems.length === 0) return;

      const reviewData = {};
      for (const item of menuItems) {
        try {
          const reviews = await getReviewsByItemId(item.id);
          if (reviews.length > 0) {
            const avgRating =
              reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
              reviews.length;
            reviewData[item.id] = {
              avgRating: avgRating.toFixed(1),
              reviewCount: reviews.length,
            };
          }
        } catch (err) {
          console.log("Could not fetch reviews for item:", item.id);
        }
      }
      setItemReviews(reviewData);
    };

    fetchReviewsForItems();
  }, [menuItems]);

  // Fetch order counts for menu items
  useMemo(() => {
    const fetchOrderCounts = async () => {
      if (!menuItems || menuItems.length === 0) return;

      try {
        const orders = await getAllOrders();
        const itemCounts = {};
        orders.forEach((order) => {
          if (order.itemId) {
            itemCounts[order.itemId] = (itemCounts[order.itemId] || 0) + 1;
          }
        });
        setItemOrderCounts(itemCounts);
      } catch (err) {
        console.log("Could not fetch order counts:", err);
      }
    };

    fetchOrderCounts();
  }, [menuItems]);

  // Search & filter
  const cleanSearch = searchQuery.trim().toLowerCase();
  const filteredItems = useMemo(() => {
    if (loading) return [];
    let items =
      activeTab === "All"
        ? menuItems
        : menuItems.filter((item) => item.cat === activeTab);

    if (cleanSearch !== "") {
      items = items.filter(
        (item) =>
          (item.name && item.name.toLowerCase().includes(cleanSearch)) ||
          (item.desc && item.desc.toLowerCase().includes(cleanSearch)) ||
          (item.tags &&
            item.tags.some((tag) => tag.toLowerCase().includes(cleanSearch)))
      );
    }

    // Quick filters
    if (quickFilters.inStock) {
      items = items.filter((item) => item.available !== false);
    }
    if (quickFilters.fastDelivery) {
      items = items.filter((item) => {
        const timeNum = parseInt(item.time?.replace(/\D/g, "")) || 30;
        return timeNum <= 25; // 25 minutes or less
      });
    }
    if (quickFilters.topRated) {
      items = items.filter((item) => {
        const itemRating = itemReviews[item.id]?.avgRating || item.rating || 0;
        const orderCount = itemOrderCounts[item.id] || 0;
        return itemRating >= 4.0 || orderCount >= 5;
      });
    }

    return items;
  }, [activeTab, cleanSearch, menuItems, loading, quickFilters, itemReviews, itemOrderCounts]);

  // Filters
  const clearSearch = () => setSearchQuery("");
  const clearAllFilters = () => {
    setSearchQuery("");
    setActiveTab("All");
    setQuickFilters({
      fastDelivery: false,
      topRated: false,
      inStock: false,
    });
  };

  // Checkout
  const openCheckout = (item) => {
    setSelectedItem(item);
    setQuantity(1);
  };

  const closeCheckout = () => setSelectedItem(null);

  // Submit order using OrderContext - Checkout passes form values directly
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
      showAlert,
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <>
      <div className="min-h-screen dark:bg-[#0a0a0a] bg-white dark:text-white text-black font-sans transition-colors duration-300">
        {/* Animated Background */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 20% 20%, rgba(249, 115, 22, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(251, 146, 60, 0.06) 0%, transparent 50%)",
            zIndex: 0,
          }}
        />
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            zIndex: 0,
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10 overflow-hidden">
          {/* Header */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8 md:mb-16"
          >
            <div className="text-center mb-6 md:mb-10">
              {/* Premium Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-4 md:mb-6"
              >
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-xs md:text-sm font-medium">
                  Premium Quality
                </span>
              </motion.div>

              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2 md:mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span>Discover </span>

                <span className="inline-flex">
                  {"Delicious".split("").map((char, i) => (
                    <motion.span
                      key={i}
                      className="text-transparent bg-clip-text bg-linear-to-r from-red-400 to-red-600 inline-block"
                      animate={{
                        y: [0, -8, 0],
                        rotate: [-5, 5, -5],
                      }}
                      transition={{
                        duration: 0.6,
                        delay: i * 0.1,
                        repeat: Infinity,
                        repeatDelay: 1,
                        ease: "easeInOut",
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  backgroundPosition: ["200% center", "-200% center"],
                }}
                transition={{
                  opacity: { delay: 0.4 },
                  backgroundPosition: {
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  },
                }}
                className="
    text-sm md:text-base lg:text-lg max-w-2xl mx-auto px-4
    text-transparent bg-clip-text
    bg-[linear-gradient(110deg,#6b7280_40%,#000000_50%,#6b7280_60%)]
    dark:bg-[linear-gradient(110deg,#6b7280_40%,#ffffff_50%,#6b7280_60%)]
    bg-[length:200%_100%]
  "
              >
                Explore our carefully crafted menu featuring the finest
                ingredients and chef's special creations
              </motion.p>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="max-w-2xl mx-auto mb-6 md:mb-8 px-4 sm:px-0"
            >
              <motion.div
                className="search-glass rounded-xl md:rounded-2xl p-1 cursor-text"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
                whileHover={{
                  background: "rgba(255, 255, 255, 0.06)",
                  scale: 1.01,
                }}
                whileFocus={{ background: "rgba(255, 255, 255, 0.08)" }}
              >
                <div className="relative flex items-center">
                  {/* Animated Search Icon */}
                  <motion.div
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-500"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Search />
                  </motion.div>

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for your favorite dishes..."
                    className="w-full bg-transparent py-3 md:py-4 pl-10 md:pl-14 pr-10 placeholder-gray-500 outline-none text-sm md:text-base
                   focus:ring-1 focus:ring-red-500 focus:border-red-500 rounded-xl transition-all duration-300"
                  />

                  {searchQuery && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.2 }}
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </motion.div>

            {/* Category Pills - Horizontal scroll on mobile */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="relative mb-6 md:mb-8"
            >
              <div className="overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                <div className="flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-2 md:gap-3 px-4 md:px-0 min-w-min">
                  {categories.map((cat, index) => {
                    const Icon = categoryIcons[cat];
                    return (
                      <motion.button
                        key={cat}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab(cat)}
                        className={`relative px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm font-semibold transition-all overflow-hidden whitespace-nowrap
                          ${
                            activeTab === cat
                              ? "bg-linear-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/40"
                              : "bg-white/5 dark:text-gray-300 border border-white/10 hover:bg-white/10"
                          }`}
                      >
                        <span className="relative z-10 flex items-center gap-1 md:gap-2">
                          <Icon size={12} />
                          {cat}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Quick Filters - Hide on very small screens */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="hidden sm:flex flex-wrap justify-center gap-3 md:gap-4 mb-4 md:mb-6"
            >
              <button
                onClick={() => setQuickFilters(prev => ({ ...prev, fastDelivery: !prev.fastDelivery }))}
                className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border transition-all ${
                  quickFilters.fastDelivery
                    ? "bg-red-500/20 border-red-500 text-red-500"
                    : "bg-white/5 border-white/10 dark:text-gray-300 text-gray-800 hover:bg-white/10"
                }`}
              >
                <svg
                  className="w-3 h-3 md:w-4 md:h-4 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-xs md:text-sm">
                  Fast Delivery
                </span>
              </button>
              <button
                onClick={() => setQuickFilters(prev => ({ ...prev, topRated: !prev.topRated }))}
                className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border transition-all ${
                  quickFilters.topRated
                    ? "bg-yellow-500/20 border-yellow-500 text-yellow-500"
                    : "bg-white/5 border-white/10 dark:text-gray-300 text-gray-800 hover:bg-white/10"
                }`}
              >
                <Star size={14} className={`${quickFilters.topRated ? "text-yellow-500 fill-yellow-500" : "text-yellow-400 fill-yellow-400"}`} />
                <span className="text-xs md:text-sm">
                  Top Rated
                </span>
              </button>
              <button
                onClick={() => setQuickFilters(prev => ({ ...prev, inStock: !prev.inStock }))}
                className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border transition-all ${
                  quickFilters.inStock
                    ? "bg-green-500/20 border-green-500 text-green-500"
                    : "bg-white/5 border-white/10 dark:text-gray-300 text-gray-800 hover:bg-white/10"
                }`}
              >
                <CheckCircle2 size={14} className={quickFilters.inStock ? "text-green-500" : "text-green-400"} />
                <span className="text-xs md:text-sm">
                  In Stock
                </span>
              </button>
            </motion.div>

            {/* Active filters */}
            <AnimatePresence>
              {(activeTab !== "All" || searchQuery || quickFilters.fastDelivery || quickFilters.topRated || quickFilters.inStock) && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-4 md:mt-6 flex items-center  justify-center gap-3 px-4"
                >
                  <div className="flex flex-wrap justify-center gap-2">
                    {activeTab !== "All" && (
                      <motion.span
                        layout
                        className="px-3 py-1.5 md:px-4 md:py-2 bg-red-500/10 border border-red-500/30 rounded-full text-xs flex items-center gap-1.5 md:gap-2"
                      >
                        {React.createElement(categoryIcons[activeTab], {
                          size: 12,
                        })}
                        <span className="text-[10px] md:text-xs">
                          {activeTab}
                        </span>
                      </motion.span>
                    )}
                    {searchQuery && (
                      <motion.span
                        layout
                        className="px-3 py-1.5 md:px-4 md:py-2 bg-red-500/10 border border-red-500/30 rounded-full text-xs flex items-center gap-1.5 md:gap-2"
                      >
                        <Search size={12} />
                        <span className="max-w-[100px] md:max-w-[200px] truncate">
                          "{searchQuery}"
                        </span>
                        <button
                          onClick={clearSearch}
                          className="ml-1 hover:text-red-500 "
                        >
                          <X size={12} />
                        </button>
                      </motion.span>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={clearAllFilters}
                      className="px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs dark:text-gray-500 text-black hover:text-red-500 transition-colors underline"
                    >
                      Clear all
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-12 md:py-20">
              <div className="flex flex-col items-center gap-3 md:gap-4">
                <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-t-2 border-b-2 border-red-500"></div>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 ">
                  Loading menu...
                </p>
              </div>
            </div>
          )}

          {/* Premium dish grid */}
          {!loading && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 px-2 sm:px-0"
            >
              <AnimatePresence mode="wait">
                {filteredItems.map((item, index) => {
                  const ItemIcon = categoryIcons[item.cat];
                  const isFavourite = favourites.some(
                    (fav) => fav.dishId === item.docId
                  );

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.05,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                      onHoverStart={() => setHoveredItem(item.id)}
                      onHoverEnd={() => setHoveredItem(null)}
                      className={`group relative ${
                        !item.available && "opacity-50 pointer-events-none"
                      }`}
                    >
                      <div className="relative bg-linear-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-500 h-full flex flex-col">
                        {/* Image container with parallax */}
                        <div className="relative h-32 sm:h-40 md:h-48 lg:h-56 overflow-hidden">
                          <motion.img
                            src={item.img}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />

                          {/* Gradient overlays */}
                          <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />
                          <div className="absolute inset-0 bg-linear-to-r from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                          {/* Top left badges - Stack vertically on mobile */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {item.chefSpecial && (
                              <motion.div
                                initial={{ x: -30, opacity: 0 }}
                                animate={{
                                  x: 0,
                                  opacity: 1,
                                  boxShadow: [
                                    "0 0 0px rgba(239,68,68,0.0)",
                                    "0 0 10px rgba(239,68,68,0.6)",
                                    "0 0 20px rgba(239,68,68,0.8)",
                                    "0 0 10px rgba(239,68,68,0.6)",
                                  ],
                                }}
                                transition={{
                                  delay: 0.2,
                                  boxShadow: {
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                  },
                                }}
                                className="relative bg-linear-to-r from-red-500 to-red-600 px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl flex items-center gap-1"
                              >
                                <div className="absolute inset-0 rounded-lg md:rounded-xl bg-red-500 blur-lg opacity-40 animate-pulse"></div>
                                <div className="relative flex items-center gap-0.5 sm:gap-1">
                                  <Award size={8} className="text-black" />
                                  <span className="text-[6px] sm:text-[8px] md:text-[10px] font-black uppercase text-black tracking-widest">
                                    Chef's Special
                                  </span>
                                </div>
                              </motion.div>
                            )}
                            {item.popularity > 90 && (
                              <motion.div
                                initial={{ x: -30, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="bg-black/80 backdrop-blur-xl px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl flex items-center gap-1 border border-white/10"
                              >
                                <Flame size={8} className="text-red-500" />
                                <span className="text-[6px] sm:text-[8px] md:text-[10px] font-black uppercase text-white tracking-widest">
                                  Trending
                                </span>
                              </motion.div>
                            )}
                          </div>

                          {/* Top right - availability */}
                          <div className="absolute top-2 right-2">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring" }}
                              className={`
                                px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1.5
                                rounded-lg md:rounded-xl
                                flex items-center gap-0.5 sm:gap-1
                                backdrop-blur-xl
                                text-[6px] sm:text-[8px] md:text-[10px]
                                border
                                ${
                                  item.available
                                    ? "bg-green-500/10 border-green-400 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.35)]"
                                    : "bg-red-500/10 border-red-400 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.35)]"
                                }
                              `}
                            >
                              {item.available ? (
                                <CheckCircle2
                                  size={8}
                                  className="drop-shadow-[0_0_2px_currentColor]"
                                />
                              ) : (
                                <XCircle
                                  size={8}
                                  className="drop-shadow-[0_0_2px_currentColor]"
                                />
                              )}

                              <span className="font-black uppercase tracking-widest drop-shadow-[0_0_2px_currentColor] hidden sm:block">
                                {item.available ? "Available" : "Sold Out"}
                              </span>
                            </motion.div>
                          </div>

                          {/* Category badge */}
                          <div className="absolute bottom-2 left-2">
                            <div className="bg-black/60 backdrop-blur-xl px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl border border-white/10 flex items-center gap-1">
                              <ItemIcon size={8} className="text-red-500" />
                              <span className="text-[6px] sm:text-[8px] md:text-xs text-gray-300 truncate max-w-[40px] sm:max-w-[60px] md:max-w-none">
                                {item.cat}
                              </span>
                            </div>
                          </div>

                          {/* Rating and time */}
                          <div className="absolute bottom-2 right-2 flex gap-1">
                            <div className="bg-black/60 backdrop-blur-xl px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl border border-white/10 flex items-center gap-1">
                              <Clock size={8} className="text-red-500/70" />
                              <span className="text-[6px] sm:text-[8px] md:text-xs text-white">
                                {item.time}
                              </span>
                            </div>
                            {itemReviews[item.id] ? (
                              <div className="bg-black/60 backdrop-blur-xl px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl border border-white/10 flex items-center gap-1">
                                <Star
                                  size={8}
                                  className="text-yellow-500 fill-yellow-500"
                                />
                                <span className="text-[5px] sm:text-[6px] md:text-[8px] font-bold text-white">
                                  {itemReviews[item.id].avgRating}
                                </span>
                                <span className="text-[4px] sm:text-[5px] md:text-[6px] dark:text-gray-400  text-gray-800">
                                  ({itemReviews[item.id].reviewCount})
                                </span>
                              </div>
                            ) : (
                              <div className="bg-black/60 backdrop-blur-xl px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl border border-white/10 flex items-center gap-1">
                                <Star
                                  size={8}
                                  className="text-red-500 fill-red-500"
                                />
                                <span className="text-[5px] sm:text-[6px] md:text-[8px] dark:text-gray-400  text-gray-800 self-center">
                                  {item.rating}
                                </span>
                              </div>
                            )}
                            {itemOrderCounts[item.id] > 0 && (
                              <div className="bg-black/60 backdrop-blur-xl px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl border border-white/10 flex items-center gap-1">
                                <ShoppingCart
                                  size={8}
                                  className="text-green-500"
                                />
                                <span className="text-[5px] sm:text-[6px] md:text-[8px] font-bold text-white">
                                  {itemOrderCounts[item.id]}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Favourite button */}
                          <button
                            onClick={() => toggleFavourite(item.docId)}
                            className="absolute top-12 sm:top-14 md:top-16 right-2 sm:right-3 p-1 sm:p-1.5 md:p-2 bg-black/60 backdrop-blur-xl rounded-lg md:rounded-xl border border-white/10 hover:border-red-500/30 transition-colors"
                          >
                            <Heart
                              size={10}
                              className={
                                isFavourite
                                  ? "fill-red-500 text-red-500"
                                  : "text-white"
                              }
                            />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="p-2 sm:p-3 md:p-6 flex flex-col flex-grow">
                          <div className="flex justify-between items-start mb-1 sm:mb-2 md:mb-3">
                            <div className="flex-1 min-w-0 pr-2">
                              <h3 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold dark:text-white text-black group-hover:text-red-500 transition-colors truncate">
                                {item.name}
                              </h3>
                              <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-600 mt-0.5 md:mt-1">
                                est. {item.calories} cal
                              </p>
                            </div>
                            <span className="text-sm sm:text-lg md:text-2xl lg:text-3xl font-light text-red-500 whitespace-nowrap">
                              ${item.price?.toFixed(2)}
                            </span>
                          </div>

                          <p className="text-[10px] sm:text-xs md:text-sm dark:text-gray-400  text-gray-800 leading-relaxed mb-2 sm:mb-3 md:mb-4 line-clamp-2 min-h-[1.5rem] sm:min-h-[2rem] md:min-h-[2.5rem]">
                            {item.desc}
                          </p>

                          {/* Tags - Horizontal scroll on mobile */}
                          <div className="flex flex-wrap gap-1 md:gap-2 mb-2 sm:mb-3 md:mb-6 min-h-[1.25rem] sm:min-h-[1.5rem] md:min-h-[2rem]">
                            {item.tags?.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="
                                  relative
                                  px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-3 md:py-1
                                  rounded-full
                                  text-[5px] sm:text-[7px] md:text-[9px]
                                  uppercase
                                  tracking-wider
                                  text-white
                                  bg-white/5
                                  border border-red-500/20
                                  backdrop-blur-sm
                                  shadow-[0_0_5px_rgba(239,68,68,0.15)]
                                  hover:shadow-[0_0_10px_rgba(239,68,68,0.5)]
                                  hover:border-red-500/50
                                  transition-all
                                  duration-300
                                  whitespace-nowrap
                                "
                              >
                                <span className="absolute inset-0 rounded-full bg-red-500/10 blur-md opacity-70 animate-pulse"></span>
                                <span className="relative z-10 dark:text-white text-red-500">
                                  {tag.length > 8
                                    ? `${tag.slice(0, 8)}...`
                                    : tag}
                                </span>
                              </span>
                            ))}
                            {item.tags?.length > 3 && (
                              <span className="text-[5px] sm:text-[6px] md:text-[8px] text-gray-500 self-center">
                                +{item.tags.length - 3}
                              </span>
                            )}
                          </div>

                          {/* Spacer to push button to bottom */}
                          <div className="flex-grow" />

                          {/* Order button */}
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            disabled={!item.available}
                            onClick={() => openCheckout(item)}
                            className={`w-full flex items-center justify-between px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 rounded-lg sm:rounded-xl md:rounded-2xl font-medium text-[10px] sm:text-xs md:text-sm transition-all group/btn border border-red-500/30
                              ${
                                item.available
                                  ? "bg-transparent text-red-500 active:bg-red-500/10 active:shadow-[0_0_15px_rgba(249,115,22,0.3)] active:border-red-500/60"
                                  : "bg-white/5 text-gray-600 cursor-not-allowed border-gray-500/20"
                              }`}
                          >
                            <span className="flex items-center gap-1">
                              <ShoppingCart size={12} />
                              Order
                            </span>
                            <span className="flex items-center gap-0.5">
                              <span className="text-[8px] sm:text-[10px] md:text-xs opacity-70">
                                ${item.price?.toFixed(2)}
                              </span>
                              <ChevronRight
                                size={12}
                                className="group-hover/btn:translate-x-1 transition-transform"
                              />
                            </span>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Empty state with premium design */}
          <AnimatePresence>
            {!loading && filteredItems.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 md:py-32 relative px-4"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="text-5xl md:text-8xl mb-4 md:mb-6 opacity-20"
                >
                  🍽️
                </motion.div>
                <p className="text-xl md:text-3xl text-gray-600 font-light mb-2 md:mb-3">
                  No items found
                </p>
                <p className="text-xs md:text-sm text-gray-700 mb-4 md:mb-8">
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : `No items in ${activeTab}`}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearAllFilters}
                  className="px-6 md:px-8 py-3 md:py-4 bg-linear-to-r from-red-500/10 to-red-500/10 border border-red-500/30 rounded-xl md:rounded-2xl text-red-500 text-xs md:text-sm font-medium hover:bg-red-500/20 transition-all flex items-center gap-2 mx-auto"
                >
                  <Zap size={14} />
                  View all items
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer stats - Stack on mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 md:mt-20 pt-6 md:pt-8 border-t border-white/5 flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-center text-[10px] md:text-xs text-gray-600 px-4 md:px-0"
          >
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <div className="flex items-center gap-1 md:gap-2">
                <Truck size={12} className="text-red-500/50" />
                <span>Free delivery over $30</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <Shield size={12} className="text-red-500/50" />
                <span>Secure payment</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <CircleDollarSign size={12} className="text-red-500/50" />
                <span>30-day guarantee</span>
              </div>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <span>Showing {filteredItems.length} items</span>
              <span>•</span>
              <span>
                {menuItems.filter((i) => i.available).length} available
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Checkout Component */}
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
    </>
  );
}