import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Lock,
  Shield,
  LogOut,
  Save,
  ChevronRight,
  Moon,
  Sun,
  Star,
  Trash2,
  Loader2,
} from "lucide-react";
import { useAlert } from "../../context/AlertContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useReviews } from "../../context/ReviewContext";
import ProtectedView from "../common/ProtectedView";
import EmptyState from "../common/EmptyState";

const SettingsPage = () => {
  const { showAlert } = useAlert();
  const { user, userData, logout, updateUserProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { reviews, getReviews, deleteReview } = useReviews();

  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [userReviews, setUserReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [displayName, setDisplayName] = useState(userData?.displayName || "");
  const [phoneNumber, setPhoneNumber] = useState(userData?.phoneNumber || "");
  const [address, setAddress] = useState(userData?.address || "");

  // Update displayName, phoneNumber and address when userData changes
  useEffect(() => {
    if (userData?.displayName) {
      setDisplayName(userData.displayName);
    }
    if (userData?.phoneNumber) {
      setPhoneNumber(userData.phoneNumber);
    }
    if (userData?.address) {
      setAddress(userData.address);
    }
  }, [userData]);

  // Fetch user reviews when tab is active
  useEffect(() => {
    if (activeTab === "reviews" && user) {
      // Use reviews from context directly
      setUserReviews(reviews);
    }
  }, [activeTab, user, reviews]);

  const loadUserReviews = async () => {
    // Now handled by context - just ensure reviews are loaded
    await getReviews();
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      // Check if anything changed
      const updates = {};
      if (displayName !== userData?.displayName) {
        updates.displayName = displayName;
      }
      if (phoneNumber !== userData?.phoneNumber) {
        updates.phoneNumber = phoneNumber;
      }
      if (address !== userData?.address) {
        updates.address = address;
      }

      if (Object.keys(updates).length > 0) {
        const result = await updateUserProfile(updates);
        if (!result.success) {
          showAlert("Failed to update profile", "error");
          setSaving(false);
          return;
        }
      }

      showAlert("Settings updated successfully!", "success");
    } catch (error) {
      showAlert("Failed to update settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    // Use deleteReview from context
    const result = await deleteReview(reviewId);

    if (result.success) {
      // Update local state
      setUserReviews((prev) => prev.filter((r) => r.id !== reviewId));
      showAlert("Review deleted successfully!", "success");
    } else {
      showAlert("Failed to delete review", "error");
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const sections = [
    { id: "profile", label: "Profile", icon: <User size={20} /> },
    {
      id: "appearance",
      label: "Appearance",
      icon: theme === "dark" ? <Moon size={20} /> : <Sun size={20} />,
    },
    { id: "notifications", label: "Notifications", icon: <Bell size={20} /> },
    { id: "reviews", label: "My Reviews", icon: <Star size={20} /> },
    { id: "security", label: "Security", icon: <Lock size={20} /> },
  ];

  if (!user) {
    return (
      <ProtectedView
        user={user}
        message="Please login to view settings"
        icon="🔒"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-4 md:p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Settings
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64 space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  activeTab === section.id
                    ? "bg-red-500/10 text-red-500 border border-red-500/30"
                    : "text-gray-500 hover:bg-white/5 dark:hover:bg-white/5"
                }`}
              >
                {section.icon}
                <span className="font-medium">{section.label}</span>
                {activeTab === section.id && (
                  <motion.div layoutId="active" className="ml-auto">
                    <ChevronRight size={16} />
                  </motion.div>
                )}
              </button>
            ))}
            <hr className="my-4 border-gray-200 dark:border-white/10" />
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>

          {/* Main Content Area */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-6 md:p-10 shadow-2xl"
          >
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Profile Settings
                </h2>

                <div className="flex items-center gap-6 mb-8">
                  {userData?.photoURL ? (
                    <img
                      src={userData.photoURL}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-red-500 shadow-xl"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-linear-to-tr from-red-500 to-amber-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                      {userData?.displayName?.[0] || user?.email?.[0] || "?"}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {userData?.displayName || "User"}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                      Manage your personal information
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">
                      Display Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                      placeholder="John Doe"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      className="w-full bg-gray-100/10 border border-white/5 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                      placeholder="+1 234 567 8900"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">
                      Address
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                      placeholder="123 Main Street, City, State"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">
                      Account Type
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-white/10 dark:border-white/5 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                      value={userData?.role || "Customer"}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Appearance
                </h2>

                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-500">
                    Theme
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => theme === "light" || toggleTheme()}
                      className={`p-6 rounded-2xl border-2 transition-all ${
                        theme === "light"
                          ? "border-red-500 bg-red-500/10"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <Sun size={32} className="mx-auto mb-2 text-yellow-500" />
                      <p className="font-medium text-gray-900 dark:text-white">
                        Light
                      </p>
                      <p className="text-xs text-gray-500">Bright and clean</p>
                    </button>
                    <button
                      onClick={() => theme === "dark" || toggleTheme()}
                      className={`p-6 rounded-2xl border-2 transition-all ${
                        theme === "dark"
                          ? "border-red-500 bg-red-500/10"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <Moon
                        size={32}
                        className="mx-auto mb-2 text-purple-500"
                      />
                      <p className="font-medium text-gray-900 dark:text-white">
                        Dark
                      </p>
                      <p className="text-xs text-gray-500">Easy on the eyes</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Notification Preferences
                </h2>
                {["Order Updates", "Promotional Emails", "Security Alerts"].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between p-4 bg-white/5 dark:bg-white/5 rounded-2xl border border-white/5"
                    >
                      <span className="text-gray-900 dark:text-white font-medium">
                        {item}
                      </span>
                      <div className="w-12 h-6 bg-red-500 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  My Reviews
                </h2>

                {loadingReviews ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="animate-spin text-red-500" size={32} />
                  </div>
                ) : userReviews.length === 0 ? (
                  <div className="py-10">
                    <EmptyState
                      emoji="⭐"
                      title="No reviews yet"
                      message="You haven't written any reviews yet"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userReviews.map((review) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-white/5 dark:bg-white/5 rounded-2xl border border-white/10"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {review.itemName || "Item Review"}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={14}
                                    className={
                                      star <= review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                          {review.reviewText}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Security
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield size={20} className="text-green-500" />
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Account Security
                      </h4>
                    </div>
                    <p className="text-sm text-gray-500">
                      Your account is secured with Firebase Authentication
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <Lock size={20} className="text-red-500" />
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Password
                      </h4>
                    </div>
                    <p className="text-sm text-gray-500">
                      Managed through Firebase Auth - Reset via email
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="mt-12 pt-8 border-t border-white/10 flex justify-end gap-4">
              <button className="px-6 py-2 text-gray-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
              >
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save size={18} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;