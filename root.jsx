import { useState, useEffect } from "react"; // Added useEffect
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import "./app.css";

// Navigation
import Navbar from "./components/navigation/Navbar";
import Sidebar from "./components/navigation/Sidebar";
import FloatingParticles from "./components/common/FloatingParticles";

// Context
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AlertProvider } from "./context/AlertContext";
import { OrderProvider } from "./context/OrderContext";
import { MenuProvider } from "./context/MenuContext";
import { FavouriteProvider } from "./context/FavouriteContext";
import { ReviewProvider } from "./context/ReviewContext";
import { TrackerProvider } from "./context/TrackerContext";

export const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com",
  },
];

// This helper component handles the conditional UI and Layout shifting
function AppLayout({ children }) {
  const { user } = useAuth();
  // Lifted state to control the main content padding
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [isHydrated, setIsHydrated] = useState(false);

  // Check screen size for responsive padding
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Mark as hydrated after mount
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Only use mobile layout after hydration
  const effectiveIsMobile = isHydrated && isMobile;

  // Calculate padding based on device and sidebar state
  const getMainPadding = () => {
    if (!user) {
      // No user - navbar only
      return "pt-20";
    }

    if (effectiveIsMobile) {
      // Mobile - top padding for fixed header
      return "pt-20";
    }

    // Desktop - padding fixed so expanding sidebar overlays content instead of pushing it
    return "pl-[84px]";
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-black dark:text-white">
      <FloatingParticles />
      {/* 
          If logged in: Show Sidebar and pass toggle state 
          If guest: Show Navbar 
      */}
      {user ? (
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      ) : (
        <Navbar />
      )}

      {/* 
          RESPONSIVE MAIN CONTENT:
          - Guest: Top padding for navbar
          - User on Mobile: No left padding (sidebar is overlay)
          - User on Desktop: Left padding based on sidebar state
      */}
      <main
        className={`transition-all duration-300 ease-in-out ${getMainPadding()}`}
      >
        {/* Add top padding on mobile when user is logged in to account for mobile menu button */}
        {user && effectiveIsMobile && (
          <div className="" /> /* Spacer for mobile menu button */
        )}
        {children}
      </main>
    </div>
  );
}

export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider>
          <AlertProvider>
            <AuthProvider>
              <TrackerProvider>
                <MenuProvider>
                  <OrderProvider>
                    <FavouriteProvider>
                      <ReviewProvider>
                        <AppLayout>{children}</AppLayout>
                      </ReviewProvider>
                    </FavouriteProvider>
                  </OrderProvider>
                </MenuProvider>
              </TrackerProvider>
            </AuthProvider>
          </AlertProvider>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-24 p-4 container mx-auto text-center">
      <h1 className="text-6xl font-black text-red-500 mb-4">{message}</h1>
      <p className="text-gray-400 font-bold uppercase tracking-widest">
        {details}
      </p>
      {stack && (
        <pre className="mt-8 w-full p-4 overflow-x-auto bg-white/5 border border-white/10 rounded-2xl text-left">
          <code className="text-xs text-red-300/70">{stack}</code>
        </pre>
      )}
    </main>
  );
}