import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useAlert } from "../../context/AlertContext";
import {
  X,
  Minus,
  Plus,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Clock,
  Star,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function Checkout({
  selectedItem,
  isOpen,
  onClose,
  quantity,
  setQuantity,
  paymentMethod,
  setPaymentMethod,
  handlePlaceOrder,
  isPlacingOrder,
}) {
  const { user, userData } = useAuth();
  const { showAlert } = useAlert();

  // Initialize form fields from AuthContext
  const [checkoutName, setCheckoutName] = useState(userData?.displayName || "");
  const [checkoutEmail, setCheckoutEmail] = useState(user?.email || "");
  const [checkoutPhone, setCheckoutPhone] = useState(
    userData?.phoneNumber || ""
  );
  const [deliveryAddress, setDeliveryAddress] = useState(
    userData?.address || ""
  );

  // Sync with userData when it changes
  useEffect(() => {
    if (userData) {
      if (userData.displayName && !checkoutName)
        setCheckoutName(userData.displayName);
      if (userData.phoneNumber && !checkoutPhone)
        setCheckoutPhone(userData.phoneNumber);
      if (userData.address && !deliveryAddress)
        setDeliveryAddress(userData.address);
    }
    if (user?.email && !checkoutEmail) setCheckoutEmail(user.email);
  }, [userData, user]);
  if (!isOpen || !selectedItem) return null;

  const deliveryFee = 2.99;
  const taxRate = 0.1;
  const subtotal = selectedItem.price * quantity;
  const tax = subtotal * taxRate;
  const total = subtotal + deliveryFee + tax;

  return (
    <AnimatePresence>
      {selectedItem && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:max-w-lg md:max-w-2xl bg-white/40 dark:bg-white/5 backdrop-blur-xl border-l border-white/20 shadow-2xl z-50 overflow-y-auto"
          >
            <div className="relative min-h-full p-4 sm:p-6 md:p-8 lg:p-12">
              {/* Close button with animation */}
              <motion.button
                whileHover={{ rotate: 90 }}
                onClick={onClose}
                className="absolute top-4 sm:top-6 md:top-8 right-4 sm:right-6 md:right-8 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors bg-white/20 dark:bg-white/5 p-2 sm:p-3 rounded-full"
              >
                <X size={18} sm:size={20} />
              </motion.button>

              {/* Header with animated underline */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-6 sm:mb-8 md:mb-10"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter mb-1 sm:mb-2 text-gray-900 dark:text-white">
                  <span className="bg-linear-to-r from-red-500 to-red-500 bg-clip-text text-transparent">
                    COMPLETE
                  </span>
                  <span className="ml-2 sm:ml-3 text-gray-900 dark:text-white">
                    ORDER
                  </span>
                </h2>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 60 }}
                  transition={{ delay: 0.2 }}
                  className="h-[2px] bg-linear-to-r from-red-500 to-transparent"
                />
              </motion.div>

              {/* Item preview with enhanced styling */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8 md:mb-10 bg-white/20 dark:bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20"
              >
                <div className="relative w-full sm:w-28 h-40 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0">
                  <img
                    src={selectedItem.img}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                        {selectedItem.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {selectedItem.desc}
                      </p>
                    </div>
                    <span className="text-2xl sm:text-3xl font-light text-red-500 whitespace-nowrap">
                      ${selectedItem.price?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 mt-3 text-xs text-gray-600 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {selectedItem.time}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-red-500" />
                      {selectedItem.rating}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Quantity selector with premium styling */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6 sm:mb-8 md:mb-10"
              >
                <label className="text-xs uppercase tracking-widest text-gray-500 font-medium block mb-3 sm:mb-4">
                  Select Quantity
                </label>
                <div className="flex items-center gap-3 sm:gap-6 bg-white/20 dark:bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 border border-white/20 w-fit">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/20 dark:bg-white/5 flex items-center justify-center text-gray-900 dark:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-colors border border-white/20"
                  >
                    <Minus size={16} sm:size={18} />
                  </motion.button>
                  <span className="text-2xl sm:text-3xl font-light text-gray-900 dark:text-white w-8 sm:w-12 text-center">
                    {quantity}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/20 dark:bg-white/5 flex items-center justify-center text-gray-900 dark:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-colors border border-white/20"
                  >
                    <Plus size={16} sm:size={18} />
                  </motion.button>
                </div>
              </motion.div>

              {/* Contact form grid */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-3 sm:space-y-4 mb-6 sm:mb-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="relative group">
                    <User
                      size={16}
                      className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Full name"
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      className="w-full bg-white/20 dark:bg-white/5 border border-white/20 rounded-xl py-3 sm:py-4 pl-10 sm:pl-12 pr-3 sm:pr-4 outline-none focus:border-red-500 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <Mail
                      size={16}
                      className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors"
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={checkoutEmail}
                      onChange={(e) => setCheckoutEmail(e.target.value)}
                      className="w-full bg-white/20 dark:bg-white/5 border border-white/20 rounded-xl py-3 sm:py-4 pl-10 sm:pl-12 pr-3 sm:pr-4 outline-none focus:border-red-500 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="relative group">
                    <Phone
                      size={16}
                      className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors"
                    />
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value)}
                      className="w-full bg-white/20 dark:bg-white/5 border border-white/20 rounded-xl py-3 sm:py-4 pl-10 sm:pl-12 pr-3 sm:pr-4 outline-none focus:border-red-500 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <MapPin
                      size={16}
                      className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Delivery address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full bg-white/20 dark:bg-white/5 border border-white/20 rounded-xl py-3 sm:py-4 pl-10 sm:pl-12 pr-3 sm:pr-4 outline-none focus:border-red-500 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 transition-all"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Payment methods */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-6 sm:mb-8 md:mb-10"
              >
                <label className="text-xs uppercase tracking-widest text-gray-500 font-medium block mb-3 sm:mb-4">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {["card", "cash", "online"].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`p-3 sm:p-4 rounded-xl border transition-all flex items-center justify-center gap-1 sm:gap-2 capitalize text-xs sm:text-sm
                        ${
                          paymentMethod === method
                            ? "bg-red-500/20 border-red-500 text-red-500"
                            : "bg-white/20 dark:bg-white/5 border-white/20 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                      <CreditCard size={14} sm:size={16} />
                      {method}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Order summary */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-6 sm:mb-8 md:mb-10 p-4 sm:p-6 bg-white/20 dark:bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/20"
              >
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Delivery fee
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    ${deliveryFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-3 sm:mb-4">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span className="text-gray-900 dark:text-white">
                    ${tax.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-white/20 pt-3 sm:pt-4 flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    Total
                  </span>
                  <span className="text-2xl font-light text-red-500">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </motion.div>

              {/* Place order button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  handlePlaceOrder({
                    selectedItem,
                    quantity,
                    checkoutName,
                    checkoutEmail,
                    checkoutPhone,
                    deliveryAddress,
                    paymentMethod,
                    closeCheckout: onClose,
                    showAlert,
                  })
                }
                disabled={isPlacingOrder}
                className="w-full bg-linear-to-r from-red-500 to-red-500 text-black py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-sm uppercase tracking-widest hover:shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Order</span>
                    <ChevronRight size={18} />
                  </>
                )}
              </motion.button>

              {/* Terms */}
              <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center mt-6">
                By placing your order you agree to our Terms of Service and
                Privacy Policy
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}