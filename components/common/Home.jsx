import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Star,
  Clock,
  MapPin,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Heart,
  Search,
  X,
} from "lucide-react";
import { Link } from "react-router";
import { useMenu } from "../../context/MenuContext";
import { useOrders } from "../../context/OrderContext";
import { useReviews } from "../../context/ReviewContext";
import { useFavourite } from "../../context/FavouriteContext";
import { useAlert } from "../../context/AlertContext";
import { useTheme } from "../../context/ThemeContext";
import Checkout from "./Checkout";

export default function Home() {
  const { menuItems, loading: menuLoading } = useMenu();
  const { getAllOrders, handlePlaceOrder, isPlacingOrder } = useOrders();
  const { getAllReviews, getReviewsByItemId } = useReviews();
  const { favourites, toggleFavourite } = useFavourite();
  const { showAlert } = useAlert();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [popularItems, setPopularItems] = useState([]);
  const [displayedItems, setDisplayedItems] = useState([]);
  const [itemOrderCounts, setItemOrderCounts] = useState({});
  const [allReviews, setAllReviews] = useState([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [itemReviews, setItemReviews] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsToShow, setItemsToShow] = useState(6);

  // Checkout state
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  };

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Fetch all orders to calculate popularity
        const orders = await getAllOrders();

        // Count orders per item
        const itemCounts = {};
        orders.forEach((order) => {
          if (order.itemId) {
            itemCounts[order.itemId] = (itemCounts[order.itemId] || 0) + 1;
          }
        });

        // Sort menu items by popularity
        const sortedByPopularity = [...menuItems].sort((a, b) => {
          const countA = itemCounts[a.id] || 0;
          const countB = itemCounts[b.id] || 0;
          return countB - countA;
        });

        setPopularItems(sortedByPopularity);
        setDisplayedItems(sortedByPopularity.slice(0, 6));
        setItemOrderCounts(itemCounts);

        // Fetch all reviews
        const reviews = await getAllReviews();
        setAllReviews(reviews);

        // Fetch reviews for all menu items (for search functionality)
        const reviewData = {};
        for (const item of sortedByPopularity) {
          try {
            const itemRevs = await getReviewsByItemId(item.id);
            if (itemRevs.length > 0) {
              const avgRating =
                itemRevs.reduce((sum, r) => sum + (r.rating || 0), 0) /
                itemRevs.length;
              reviewData[item.id] = {
                avgRating: avgRating.toFixed(1),
                reviewCount: itemRevs.length,
              };
            }
          } catch (err) {
            console.log("Could not fetch reviews for item:", item.id);
          }
        }
        setItemReviews(reviewData);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    if (menuItems.length > 0) {
      fetchData();
    }
  }, [menuItems]);

  // Auto-advance review slider
  useEffect(() => {
    if (allReviews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % allReviews.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [allReviews.length]);

  const handleAddToCart = (item) => {
    setSelectedItem(item);
    setQuantity(1);
  };

  const handleLoadMore = () => {
    const newItemsToShow = itemsToShow + 6;
    setItemsToShow(newItemsToShow);
    setDisplayedItems(popularItems.slice(0, newItemsToShow));
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
      showAlert,
    });
  };

  const isFavourited = (itemId) => favourites.some((f) => f.dishId === itemId);

  return (
    <div className="space-y-12 md:space-y-16 pb-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* HERO SECTION */}
      <section className="relative min-h-[50vh] md:h-[60vh] flex items-center justify-center rounded-2xl md:rounded-3xl overflow-hidden border border-white/5 bg-linear-to-br from-red-600/10 to-transparent dark:from-red-600/20 dark:border-white/10">
        <div className="text-center space-y-4 md:space-y-6 px-4 z-10">
          <motion.h1
            {...fadeInUp}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter dark:text-white"
          >
            HUNGRY?{" "}
            <span className="relative inline-block">
              {/* Outline */}
              <span
                className="absolute inset-0 text-transparent"
                style={{ WebkitTextStroke: "2px #dc2626" }}
              >
                GRUBGO.
              </span>

              {/* Fill animation */}
              <motion.span
                className="text-red-600 block overflow-hidden whitespace-nowrap"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 1.2,
                  ease: "easeInOut",
                  delay: 0.3,
                  repeat: Infinity,
                  repeatType: "loop",
                  repeatDelay: 0.5,
                }}
              >
                GRUBGO.
              </motion.span>
            </span>
          </motion.h1>
          <motion.p
            {...fadeInUp}
            transition={{ delay: 0.1 }}
            className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-[0.2em] md:tracking-[0.4em] text-[10px] md:text-xs"
          >
            The freshest flavors delivered in minutes
          </motion.p>
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="pt-2 md:pt-4"
          >
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 md:gap-3 bg-red-600 hover:bg-red-500 text-black px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-sm md:text-base transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(234,88,12,0.2)] group"
            >
              Explore Menu{" "}
              <ArrowRight
                className="group-hover:translate-x-1 transition-transform"
                size={16}
              />
            </Link>
          </motion.div>
        </div>
        {/* Decorative Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent opacity-50" />
      </section>

      {/* QUICK STATS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {[
          {
            icon: Star,
            label: "Top Rated",
            val: "4.9/5",
            desc: "User Satisfaction",
          },
          {
            icon: Clock,
            label: "Fast Delivery",
            val: "20-30 min",
            desc: "Average Time",
          },
          {
            icon: MapPin,
            label: "Live Tracking",
            val: "Real-time",
            desc: "Follow your meal",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            {...fadeInUp}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center text-center space-y-2 md:space-y-3"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-600">
              <stat.icon size={20} />
            </div>
            <h3 className="text-xl md:text-2xl font-black dark:text-white">
              {stat.val}
            </h3>
            <p className="text-[9px] md:text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-widest">
              {stat.label}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {stat.desc}
            </p>
          </motion.div>
        ))}
      </section>

      {/* POPULAR DISHES SECTION */}
      <section>
        <motion.div
          {...fadeInUp}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-black dark:text-white">
              <span className="bg-linear-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                POPULAR
              </span>
              <span className=" dark:text-white"> DISHES</span>
            </h2>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 md:mt-2">
              Most ordered items by our customers
            </p>
          </div>
          <Link
            to="/menu"
            className="text-red-600 w-20 hover:text-red-400 font-medium flex items-center gap-2 text-sm md:text-base"
          >
            View All <ArrowRight size={16} />
          </Link>
        </motion.div>

        {loadingData || menuLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl md:rounded-3xl bg-white/5 dark:bg-white/5 h-56 md:h-80"
              ></div>
            ))}
          </div>
        ) : popularItems.length > 0 ? (
          <>
            {/* Search Bar */}
            <div className="mb-4 md:mb-6">
              <div className="relative max-w-md">
                {/* Search Icon */}
                <Search
                  className="
        absolute left-4 top-1/2 -translate-y-1/2
        w-5 h-5
        text-black dark:text-white
        z-10
        pointer-events-none
      "
                />

                {/* Input */}
                <input
                  type="text"
                  placeholder="Search popular dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="
        w-full
        pl-12 pr-12
        py-3
        rounded-xl

        bg-white/40 dark:bg-white/10
        backdrop-blur-lg
        border border-white/30 dark:border-white/20
        shadow-lg

        text-gray-900 dark:text-white
        placeholder-gray-600 dark:placeholder-gray-400

        focus:outline-none
        focus:ring-2
        focus:ring-red-500/70

        relative
        z-0
      "
                />

                {/* Clear Button */}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="
          absolute right-4 top-1/2 -translate-y-1/2
          text-black/60 dark:text-white/60
          hover:text-black dark:hover:text-white
          z-10
        "
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {menuItems
                .filter(
                  (item) =>
                    !searchQuery ||
                    item.name
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    item.desc?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .slice(0, itemsToShow)
                .map((item, i) => (
                  <motion.div
                    key={item.docId || item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative bg-linear-to-br from-white/5 to-white/[0.02] backdrop-blur-sm dark:bg-white/5 rounded-2xl md:rounded-3xl border border-white/10 dark:border-white/10 overflow-hidden hover:border-red-500/30 transition-all"
                  >
                    {/* Image */}
                    <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

                      {/* Favourite Button */}
                      <button
                        onClick={() => toggleFavourite(item.docId || item.id)}
                        className="absolute top-3 right-3 p-1.5 md:p-2 rounded-full bg-black/40 backdrop-blur-sm dark:text-white hover:text-red-600 transition-colors"
                      >
                        <Heart
                          size={16}
                          fill={
                            isFavourited(item.docId || item.id)
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>

                      {/* Popular Badge */}
                      <div className="absolute top-3 left-3 px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-red-500/90 text-black text-[10px] md:text-xs font-bold">
                        #{i + 1} POPULAR
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 md:p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-base md:text-lg lg:text-xl font-bold dark:text-white text-black group-hover:text-red-600 transition-colors line-clamp-1">
                          {item.name}
                        </h3>
                        <span className="text-lg md:text-xl lg:text-2xl font-light text-red-600 dark:text-red-500">
                          ${item.price?.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-black dark:text-gray-400 text-xs md:text-sm line-clamp-2 mb-3 md:mb-4">
                        {item.desc}
                      </p>

                      <div className="flex items-center gap-3 md:gap-4 text-black dark:text-gray-400 text-[10px] md:text-xs mb-3 md:mb-4">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {item.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star
                            size={10}
                            className="text-red-600 dark:text-red-500"
                          />
                          {itemReviews[item.id] ? (
                            <>
                              {itemReviews[item.id].avgRating}
                              <span className="text-gray-500 dark:text-gray-400">
                                ({itemReviews[item.id].reviewCount})
                              </span>
                            </>
                          ) : (
                            item.rating
                          )}
                        </span>
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-500">
                          <ShoppingCart size={10} />
                          {itemOrderCounts[item.id] || 0} orders
                        </span>
                      </div>

                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-full py-2 md:py-3 rounded-lg md:rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-500 font-bold uppercase text-[10px] md:text-xs hover:bg-red-500 hover:text-black dark:hover:text-white transition-all flex items-center justify-center gap-1 md:gap-2"
                      >
                        <ShoppingCart size={12} />
                        Order Now
                      </button>
                    </div>
                  </motion.div>
                ))}
            </div>

            {/* View More Button */}
            {!searchQuery && itemsToShow < menuItems.length && (
              <div className="text-center mt-6 md:mt-8">
                <button
                  onClick={handleLoadMore}
                  className="inline-flex items-center gap-2 px-6 py-2.5 md:py-3 rounded-xl bg-red-500 text-white font-bold text-sm md:text-base hover:bg-red-600 transition-colors"
                >
                  View More
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 md:py-12 text-gray-500 dark:text-gray-400">
            <p className="text-sm md:text-base">
              No popular items yet. Be the first to order!
            </p>
          </div>
        )}
      </section>

      {/* REVIEWS SLIDER SECTION */}
      {allReviews.length > 0 && (
        <section className="relative overflow-hidden">
          <motion.div {...fadeInUp} className="text-center mb-6 md:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-black dark:text-white">
              <span className="bg-linear-to-r from-red-500 to-red-500 bg-clip-text text-transparent">
                CUSTOMER
              </span>
              <span className=""> REVIEWS</span>
            </h2>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 md:mt-2">
              What our customers are saying
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 md:px-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentReviewIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-2xl md:rounded-3xl border border-white/10 dark:border-white/10 p-6 md:p-8 lg:p-12"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4 md:mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={
                          star <= allReviews[currentReviewIndex]?.rating
                            ? "text-red-600 fill-red-500"
                            : "text-gray-600 dark:text-gray-500"
                        }
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <blockquote className="text-base sm:text-lg md:text-xl lg:text-2xl text-black dark:text-white font-medium mb-4 md:mb-6 max-w-2xl">
                    "
                    {allReviews[currentReviewIndex]?.reviewText ||
                      "Great food and excellent service!"}
                    "
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full bg-linear-to-tr from-red-500 to-red-500 flex items-center justify-center text-black font-bold text-sm md:text-base">
                      {allReviews[currentReviewIndex]?.userName
                        ?.charAt(0)
                        .toUpperCase() || "U"}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm md:text-base">
                        {allReviews[currentReviewIndex]?.userName ||
                          "Anonymous"}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">
                        {allReviews[currentReviewIndex]?.userEmail}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows - Hidden on mobile, shown on tablet/desktop */}
            <button
              onClick={() =>
                setCurrentReviewIndex(
                  (prev) => (prev - 1 + allReviews.length) % allReviews.length
                )
              }
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-3 rounded-full bg-white/10 border border-white/10 dark:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() =>
                setCurrentReviewIndex((prev) => (prev + 1) % allReviews.length)
              }
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 p-3 rounded-full bg-white/10 border border-white/10 dark:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all"
            >
              <ChevronRight size={24} />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-4 md:mt-6">
              {allReviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentReviewIndex(i)}
                  className={`transition-all ${
                    i === currentReviewIndex
                      ? "w-6 md:w-8 h-1.5 md:h-2 bg-red-500 rounded-full"
                      : "w-1.5 md:w-2 h-1.5 md:h-2 bg-gray-600 dark:bg-gray-500 rounded-full"
                  }`}
                  aria-label={`Go to review ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ALL MENU CTA */}
      <section className="text-center">
        <motion.div {...fadeInUp} className="inline-block">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 md:gap-3 bg-white/5 border border-white/10 dark:text-white hover:border-red-500/30 px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl text-black font-bold uppercase tracking-widest text-sm md:text-base transition-all hover:bg-red-500/10"
          >
            Explore Full Menu{" "}
            <ArrowRight
              className="group-hover:translate-x-1 transition-transform"
              size={16}
            />
          </Link>
        </motion.div>
      </section>

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
    </div>
  );
}