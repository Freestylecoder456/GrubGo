import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  UtensilsCrossed,
  Phone,
  Sun,
  Moon,
  ChevronDown,
  Package,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation Links for a Single Restaurant
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Menu", path: "/menu" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      // Only update scroll state when mobile menu is closed
      if (!isOpen) {
        setScrolled(window.scrollY > 20);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-[100] transition-all duration-500 font-sans ${
        isOpen || scrolled
          ? "bg-white/90 dark:bg-black/90 backdrop-blur-2xl shadow-lg shadow-black/5"
          : "bg-transparent"
      }`}
    >
      {/* Gradient accent line at top */}
      <div className="h-[2px] w-full bg-gradient-to-r from-red-500 via-red-500 to-red-500 opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* BRAND LOGO */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-2 bg-red-500/40 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Icon */}
              <div className="relative w-11 h-11 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-110 transition-transform duration-300">
                <UtensilsCrossed
                  className="text-white h-5 w-5"
                  strokeWidth={2.5}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white transition-colors duration-300">
                GRUB<span className="text-red-500">GO</span>
              </span>
              <span className="text-[9px] font-bold tracking-[0.3em] text-gray-400 uppercase -mt-1">
                Express Delivery
              </span>
            </div>
          </Link>

          {/* MENU SEARCH (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-12">
            <div
              className={`relative w-full group transition-all duration-300 ${
                isSearchFocused ? "scale-[1.02]" : ""
              }`}
            >
              {/* Search Icon */}
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                  isSearchFocused ? "text-red-500" : "text-gray-400"
                }`}
              />

              {/* Input */}
              <input
                type="text"
                placeholder="Search for dishes..."
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`w-full bg-gray-100/80 dark:bg-white/[0.05] border-2 py-3 pl-12 rounded-2xl outline-none text-xs transition-all placeholder:text-gray-400 text-gray-900 dark:text-white ${
                  isSearchFocused
                    ? "border-red-500 shadow-lg shadow-red-500/10"
                    : "border-transparent hover:border-gray-200 dark:hover:border-white/10"
                }`}
              />
            </div>
          </div>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-[11px] font-bold uppercase tracking-[0.15em] transition-all relative group py-2 ${
                    location.pathname === link.path
                      ? "text-red-500"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {link.name}
                  {/* Underline animation */}
                  <span
                    className={`absolute bottom-0 left-0 w-0 h-[2px] bg-red-500 transition-all duration-300 group-hover:w-full ${
                      location.pathname === link.path ? "w-full" : ""
                    }`}
                  />
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3 pl-6 border-l border-gray-200 dark:border-white/10">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all group"
              >
                <div className="absolute inset-0 rounded-xl bg-red-500/0 group-hover:bg-red-500/10 transition-colors" />
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* My Orders */}
              <Link
                to="/user/my-orders"
                className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all group"
              >
                <div className="absolute inset-0 rounded-xl bg-red-500/0 group-hover:bg-red-500/10 transition-colors" />
                <Package size={18} />
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-56 py-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 dark:border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {user.displayName || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/user/my-orders"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors"
                      >
                        <ShoppingCart size={16} />
                        My Orders
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 dark:border-white/10 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <X size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/auth/signin"
                    className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/signup"
                    className="bg-gradient-to-r from-red-600 to-red-600 hover:from-red-500 hover:to-red-500 text-white px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-[0.1em] transition-all shadow-lg shadow-red-600/20 hover:shadow-red-600/40 active:scale-95"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* MOBILE TOGGLE */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/20 transition-all shadow-sm"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link
              to="/user/my-orders"
              className="p-3 rounded-xl bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/20 transition-all shadow-sm"
            >
              <Package size={20} />
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-3 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-400 hover:bg-gray-100  dark:hover:bg-black transition-all shadow-sm"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[105] md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="
          fixed inset-y-0 right-0 w-full max-w-sm
          bg-white dark:bg-black
          backdrop-blur-xl
          z-[110] flex flex-col
          border-l border-gray-200 dark:border-white/10
          md:hidden
        "
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10">
                <Link
                  to="/"
                  className="flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                    <UtensilsCrossed className="text-white h-5 w-5" />
                  </div>
                  <span className="text-2xl font-black text-gray-900 dark:text-white">
                    GRUB<span className="text-red-500">GO</span>
                  </span>
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-visible bg-white dark:bg-black">
                <div className="space-y-2">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`block text-xl font-bold py-4 px-4 rounded-2xl transition-all ${
                          location.pathname === link.path
                            ? "bg-red-50 dark:bg-red-500/10 text-red-500"
                            : "text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                        }`}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Link
                      to="/user/my-orders"
                      onClick={() => setIsOpen(false)}
                      className="block text-xl font-bold py-4 px-4 rounded-2xl text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                    >
                      My Orders
                    </Link>
                  </motion.div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-gray-100 dark:border-white/10 space-y-3">
                <Link
                  to="/auth/signup"
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-4 bg-gradient-to-r from-red-600 to-red-600 text-white rounded-2xl font-bold text-center text-sm uppercase tracking-wider"
                >
                  Join the Table
                </Link>
                <Link
                  to="/auth/signin"
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-4 border-2 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl font-bold text-center text-sm uppercase tracking-wider"
                >
                  Sign In
                </Link>

                <div className="flex items-center justify-center gap-2 text-gray-400 text-xs font-bold tracking-widest uppercase pt-2">
                  <Phone size={14} className="text-red-500" />
                  +1 234 567 890
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}