import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Utensils,
  ClipboardList,
  Settings,
  LogOut,
  Heart,
  Sun,
  Moon,
  LayoutDashboard,
  PlusCircle,
  ShoppingCart,
  Star,
  Menu,
  X,
  UtensilsCrossed,
} from "lucide-react";
import authService from "../../lib/services/authService";
import { useAuth } from "../../context/AuthContext";
import { useAlert } from "../../context/AlertContext";
import { useTheme } from "../../context/ThemeContext";

export default function Sidebar({
  isCollapsed: propIsCollapsed,
  setIsCollapsed: propSetIsCollapsed,
}) {
  // Use props if provided, otherwise use internal state
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [isHydrated, setIsHydrated] = useState(false);

  const isCollapsed =
    propIsCollapsed !== undefined ? propIsCollapsed : internalIsCollapsed;
  const setIsCollapsed = propSetIsCollapsed || setInternalIsCollapsed;

  const { userData } = useAuth();
  const { showAlert } = useAlert();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Check screen size and handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Auto collapse on mobile, expand on desktop
      if (mobile) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, [setIsCollapsed]);

  // Mark as hydrated after mount
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Combined mobile state that waits for hydration
  const effectiveIsMobile = isHydrated && isMobile;

  const menuItems = [
    { name: "Dashboard", icon: Home, path: "/" },
    { name: "Menu", icon: Utensils, path: "/menu" },
    { name: "My Orders", icon: ClipboardList, path: "/user/my-orders" },
    { name: "Favourites", icon: Heart, path: "/user/favourites" },
    { name: "Settings", icon: Settings, path: "/user/settings" },
  ];

  // Admin menu items - only visible for admin users
  const adminMenuItems =
    userData?.role === "admin"
      ? [
          {
            name: "Admin Dashboard",
            icon: LayoutDashboard,
            path: "/admin/dashboard",
          },
          { name: "Orders", icon: ShoppingCart, path: "/admin/orders" },
          { name: "Reviews", icon: Star, path: "/admin/reviews" },
          { name: "Add Menu Item", icon: PlusCircle, path: "/admin/add-menu" },
        ]
      : [];

  // Simplified transition - all elements move together
  const smoothTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.3,
  };

  const handleLogout = async () => {
    await authService.logout();
    showAlert("You have been signed out successfully", "success");
    navigate("/auth/signin");
    if (effectiveIsMobile) {
      setIsMobileOpen(false);
    }
  };

  // Mobile menu button
  const mobileMenuButton = (
    <button
      onClick={() => setIsMobileOpen(!isMobileOpen)}
      className="relative z-50 text-gray-900 dark:text-white p-3 rounded-xl hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
      aria-label="Toggle menu"
    >
      {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );

  // Mobile Logo Component
  const mobileLogo = (
    <Link to="/" className="flex items-center gap-2 group">
      <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(234,88,12,0.3)] group-hover:rotate-12 transition-transform">
        <UtensilsCrossed className="text-black h-5 w-5" strokeWidth={3} />
      </div>
      <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white transition-colors duration-300">
        GRUB<span className="text-red-500">GO</span>
      </span>
    </Link>
  );

  // Overlay for mobile
  const mobileOverlay = (
    <AnimatePresence>
      {effectiveIsMobile && isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </AnimatePresence>
  );

  // Sidebar content (shared between mobile and desktop)
  const sidebarContent = (
    <motion.aside
      animate={{
        x: isMobile ? (isMobileOpen ? 0 : -280) : 0,
        width: isMobile ? 280 : isCollapsed ? 84 : 280,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className={`
        fixed left-0 top-0 h-full bg-white dark:bg-black 
        border-r border-gray-200 dark:border-white/5 
        flex flex-col z-50 shadow-2xl shadow-gray-200 dark:shadow-red-500/5 
        transition-colors duration-300 overflow-hidden
        ${isMobile && !isMobileOpen ? "pointer-events-none" : ""}
      `}
    >
      {/* Brand Header */}
      <div className="p-6">
        <button
          onClick={() => {
            if (!effectiveIsMobile) {
              setIsCollapsed(!isCollapsed);
            } else {
              setIsMobileOpen(false);
            }
          }}
          className="flex items-center gap-4 w-full outline-none group"
        >
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(234,88,12,0.3)] shrink-0 active:scale-90 transition-transform">
            <Utensils className="text-black h-5 w-5" strokeWidth={3} />
          </div>

          <AnimatePresence>
            {!effectiveIsMobile && !isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-xl font-black tracking-tighter text-gray-900 dark:text-white whitespace-nowrap"
              >
                GRUB<span className="text-red-600">GO</span>
              </motion.span>
            )}
            {effectiveIsMobile && isMobileOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-xl font-black tracking-tighter text-gray-900 dark:text-white whitespace-nowrap"
              >
                GRUB<span className="text-red-600">GO</span>
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* User Card */}
      <div className="px-4 mb-8">
        <div
          className={`bg-gray-100 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl p-3 flex items-center ${
            (!effectiveIsMobile && isCollapsed) ||
            (effectiveIsMobile && !isMobileOpen)
              ? "justify-center"
              : "gap-3"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
            <img
              src={userData?.photoURL}
              alt="User"
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>

          <AnimatePresence>
            {!effectiveIsMobile && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col overflow-hidden text-left"
              >
                <span className="text-gray-900 dark:text-white text-xs font-black truncate">
                  {userData?.displayName || "GrubGoer"}
                </span>
                <span className="text-gray-500 text-[9px] uppercase font-bold tracking-[0.2em] truncate">
                  {userData?.email}
                </span>
              </motion.div>
            )}
            {effectiveIsMobile && isMobileOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col overflow-hidden text-left"
              >
                <span className="text-gray-900 dark:text-white text-xs font-black truncate">
                  {userData?.displayName || "GrubGoer"}
                </span>
                <span className="text-gray-500 text-[9px] uppercase font-bold tracking-[0.2em] truncate">
                  {userData?.email}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav Links - Scrollable */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const shouldShowText =
            (!effectiveIsMobile && !isCollapsed) ||
            (effectiveIsMobile && isMobileOpen);

          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => {
                if (effectiveIsMobile) {
                  setIsMobileOpen(false);
                }
              }}
            >
              <div
                className={`relative flex items-center p-4 my-2 rounded-2xl transition-colors duration-200 group ${
                  (!effectiveIsMobile && isCollapsed) ||
                  (effectiveIsMobile && !isMobileOpen)
                    ? "justify-center"
                    : "justify-between"
                } ${
                  isActive
                    ? "bg-red-600/10 text-red-600"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                    className="shrink-0"
                  />

                  <AnimatePresence>
                    {shouldShowText && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {shouldShowText && isActive && (
                    <motion.div
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0 }}
                      transition={{ duration: 0.15 }}
                      className="w-1 h-4 rounded-full bg-red-500"
                    />
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}

        {/* Admin Menu Items - Only visible for admin users */}
        {userData?.role === "admin" && (
          <>
            <AnimatePresence>
              {(!effectiveIsMobile && !isCollapsed) ||
                (effectiveIsMobile && isMobileOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="pt-4 pb-2"
                  >
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 px-4">
                      Admin
                    </span>
                  </motion.div>
                ))}
            </AnimatePresence>
            {adminMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const shouldShowText =
                (!effectiveIsMobile && !isCollapsed) ||
                (effectiveIsMobile && isMobileOpen);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => {
                    if (effectiveIsMobile) {
                      setIsMobileOpen(false);
                    }
                  }}
                >
                  <div
                    className={`relative flex items-center p-4 rounded-2xl transition-colors duration-200 group ${
                      (!effectiveIsMobile && isCollapsed) ||
                      (effectiveIsMobile && !isMobileOpen)
                        ? "justify-center"
                        : "justify-between"
                    } ${
                      isActive
                        ? "bg-red-600/10 text-red-600"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon
                        size={20}
                        strokeWidth={isActive ? 2.5 : 2}
                        className="shrink-0"
                      />

                      <AnimatePresence>
                        {shouldShowText && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    <AnimatePresence>
                      {shouldShowText && isActive && (
                        <motion.div
                          initial={{ opacity: 0, scaleX: 0 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          exit={{ opacity: 0, scaleX: 0 }}
                          transition={{ duration: 0.15 }}
                          className="w-1 h-4 rounded-full bg-red-500"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Theme Toggle & Sign Out */}
      <div className="p-4 border-t border-gray-200 dark:border-white/5 space-y-2">
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center p-4 rounded-2xl text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-200 font-black uppercase text-[10px] tracking-[0.2em] ${
            (!effectiveIsMobile && isCollapsed) ||
            (effectiveIsMobile && !isMobileOpen)
              ? "justify-center"
              : "gap-4"
          }`}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          <AnimatePresence>
            {(!effectiveIsMobile && !isCollapsed) ||
            (effectiveIsMobile && isMobileOpen) ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                Toggle Theme
              </motion.span>
            ) : null}
          </AnimatePresence>
        </button>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center p-4 rounded-2xl text-red-600/70 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-200 font-black uppercase text-[10px] tracking-[0.2em] ${
            (!effectiveIsMobile && isCollapsed) ||
            (effectiveIsMobile && !isMobileOpen)
              ? "justify-center"
              : "gap-4"
          }`}
        >
          <LogOut size={20} />
          <AnimatePresence>
            {(!effectiveIsMobile && !isCollapsed) ||
            (effectiveIsMobile && isMobileOpen) ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                Sign Out
              </motion.span>
            ) : null}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );

  return (
    <>
      {/* Mobile Header with blurred background */}
      <div className="fixed top-0 left-0 right-0 z-40 md:hidden flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10">
        {mobileMenuButton}
        {mobileLogo}
      </div>
      {mobileOverlay}
      {sidebarContent}
    </>
  );
}