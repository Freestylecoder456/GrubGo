import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAlert } from "../../context/AlertContext";
import { useFavourite } from "../../context/FavouriteContext";
import { useMenu } from "../../context/MenuContext";
import { useOrders } from "../../context/OrderContext";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";
import {
  Heart,
  Clock,
  Star,
  ShoppingCart,
  ChevronRight,
  X,
  Search,
  Award,
  Flame,
  CheckCircle2,
  XCircle,
  UtensilsCrossed,
} from "lucide-react";
import Checkout from "../common/Checkout";
import ProtectedView from "../common/ProtectedView";
import EmptyState from "../common/EmptyState";
import PageBackground from "../common/PageBackground";

export default function FavouritesPage() {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const { favourites, toggleFavourite } = useFavourite();
  const { menuItems, loading: menuLoading } = useMenu();
  const { handlePlaceOrder, isPlacingOrder } = useOrders();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [favouriteItems, setFavouriteItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Checkout state - now managed by Checkout component via AuthContext
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");

  // Get full menu items based on favourite dishIds from context
  useEffect(() => {
    const fetchFavouriteItems = async () => {
      if (!user) {
        setFavouriteItems([]);
        setLoading(false);
        return;
      }

      if (favourites.length === 0 || menuItems.length === 0) {
        setFavouriteItems([]);
        setLoading(false);
        return;
      }

      try {
        // Get the dishIds from context
        const favouriteDishIds = favourites.map((fav) => fav.dishId);

        // Filter menu items from MenuContext to get favourite items
        // Using 'id' since MenuContext stores items with id (not docId)
        const favItems = menuItems.filter((item) =>
          favouriteDishIds.includes(item.id)
        );

        setFavouriteItems(favItems);
      } catch (error) {
        console.error("Error fetching favourite items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavouriteItems();
  }, [user, favourites, menuItems]);

  // Handle opening checkout
  const openCheckout = (item) => {
    setSelectedItem(item);
    setQuantity(1);

    if (user) {
      setCheckoutName(user.displayName || "");
      setCheckoutEmail(user.email || "");
      setCheckoutPhone(user.phoneNumber || "");
    } else {
      setCheckoutName("");
      setCheckoutEmail("");
      setCheckoutPhone("");
      setDeliveryAddress("");
    }
  };

  const closeCheckout = () => setSelectedItem(null);

  // Handle order submission - Checkout passes form values directly
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

  // Handle removing from favourites
  const handleRemoveFromFavourites = (itemId) => {
    toggleFavourite(itemId, showAlert);
  };

  if (!user) {
    return (
      <ProtectedView
        user={user}
        message="Please login to see your favourites"
        subMessage="Sign in to save your favorite dishes"
        icon="❤️"
      />
    );
  }

  if (loading || menuLoading) {
    return (
      <div className="min-h-screen dark:bg-[#0a0a0a] bg-white dark:text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          <p className="text-gray-500">Loading favourites...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen relative dark:bg-[#0a0a0a] bg-white dark:text-white transition-colors duration-300">
        <PageBackground color="red" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8 md:mb-12"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 dark:text-white text-black">
              Your Favourites <span className="text-red-500">❤️</span>
            </h1>
            <p className="dark:text-gray-400 text-gray-500 text-sm md:text-lg">
              You have {favouriteItems.length} favorite{" "}
              {favouriteItems.length === 1 ? "dish" : "dishes"}
            </p>
          </motion.div>

          {/* Search Bar */}
          {favouriteItems.length > 0 && (
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 dark:text-gray-400 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-9 md:pr-10 py-2 md:py-3 text-sm md:text-base rounded-lg md:rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

          {favouriteItems.length === 0 ? (
            <div className="py-20">
              <EmptyState
                emoji="🍽️"
                title="No favorites yet"
                message="Start adding your favorite dishes from the menu"
                actionText="Browse Menu"
                actionHref="/menu"
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8"
            >
              {favouriteItems
                .filter(
                  (item) =>
                    !searchQuery ||
                    item.name
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    item.desc?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-500"
                  >
                    {/* Image container */}
                    <div className="relative h-32 sm:h-36 md:h-40 lg:h-48 overflow-hidden">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
                            className="relative bg-linear-to-r from-red-500 to-red-600 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg flex items-center gap-1"
                          >
                            <div className="absolute inset-0 rounded-lg bg-red-500 blur-lg opacity-40 animate-pulse"></div>
                            <div className="relative flex items-center gap-0.5 sm:gap-1">
                              <Award size={8} className="text-black" />
                              <span className="text-[6px] sm:text-[8px] font-black uppercase text-black tracking-widest">
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
                            className="bg-black/80 backdrop-blur-xl px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg flex items-center gap-1 border border-white/10"
                          >
                            <Flame size={8} className="text-red-500" />
                            <span className="text-[6px] sm:text-[8px] font-black uppercase text-white tracking-widest">
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
                                                        px-1.5 py-0.5 sm:px-2 sm:py-1
                                                        rounded-lg
                                                        flex items-center gap-0.5 sm:gap-1
                                                        backdrop-blur-xl
                                                        text-[6px] sm:text-[8px]
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
                        <div className="bg-black/60 backdrop-blur-xl px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg border border-white/10 flex items-center gap-1">
                          <UtensilsCrossed size={8} className="text-red-500" />
                          <span className="text-[6px] sm:text-[8px] text-gray-300 truncate max-w-[40px] sm:max-w-[60px]">
                            {item.cat}
                          </span>
                        </div>
                      </div>

                      {/* Rating and time */}
                      <div className="absolute bottom-2 right-2 flex gap-1">
                        <div className="bg-black/60 backdrop-blur-xl px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg border border-white/10 flex items-center gap-1">
                          <Clock size={8} className="text-red-500/70" />
                          <span className="text-[6px] sm:text-[8px] text-white">
                            {item.time}
                          </span>
                        </div>
                        <div className="bg-black/60 backdrop-blur-xl px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg border border-white/10 flex items-center gap-1">
                          <Star
                            size={8}
                            className="text-yellow-500 fill-yellow-500"
                          />
                          <span className="text-[5px] sm:text-[6px] font-bold text-white">
                            {item.rating}
                          </span>
                        </div>
                      </div>

                      {/* Favourite button */}
                      <button
                        onClick={() => handleRemoveFromFavourites(item.id)}
                        className="absolute top-10 sm:top-12 right-2 p-1 sm:p-1.5 bg-black/60 backdrop-blur-xl rounded-lg border border-white/10 hover:border-red-500/30 transition-colors"
                      >
                        <Heart
                          size={10}
                          className="fill-red-500 text-red-500"
                        />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-2 sm:p-3 md:p-4 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-1 sm:mb-2">
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="text-sm sm:text-base md:text-lg font-bold dark:text-white text-black group-hover:text-red-500 transition-colors truncate">
                            {item.name}
                          </h3>
                          <p className="text-[8px] sm:text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
                            est. {item.calories || 0} cal
                          </p>
                        </div>
                        <span className="text-sm sm:text-lg md:text-xl font-light text-red-500 whitespace-nowrap">
                          ${item.price?.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed mb-2 line-clamp-2 min-h-[2rem]">
                        {item.desc}
                      </p>

                      {/* Tags - Horizontal scroll on mobile */}
                      <div className="flex flex-wrap gap-1 mb-2 min-h-[1.25rem]">
                        {item.tags?.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="
                                                            relative
                                                            px-1.5 py-0.5
                                                            rounded-full
                                                            text-[5px] sm:text-[7px]
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
                              {tag.length > 8 ? `${tag.slice(0, 8)}...` : tag}
                            </span>
                          </span>
                        ))}
                        {item.tags?.length > 3 && (
                          <span className="text-[5px] sm:text-[6px] text-gray-500 self-center">
                            +{item.tags.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Spacer to push button to bottom */}
                      <div className="flex-grow" />

                      {/* Order button */}
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => openCheckout(item)}
                        className="w-full flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-medium text-[10px] sm:text-xs transition-all group/btn border border-red-500/30 bg-transparent text-red-500 active:bg-red-500/10 active:shadow-[0_0_15px_rgba(249,115,22,0.3)] active:border-red-500/60"
                      >
                        <span className="flex items-center gap-1">
                          <ShoppingCart size={12} />
                          Order
                        </span>
                        <span className="flex items-center gap-0.5">
                          <span className="text-[8px] sm:text-[10px] opacity-70">
                            ${item.price?.toFixed(2)}
                          </span>
                          <ChevronRight
                            size={12}
                            className="group-hover/btn:translate-x-1 transition-transform"
                          />
                        </span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
            </motion.div>
          )}
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