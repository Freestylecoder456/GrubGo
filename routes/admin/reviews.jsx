import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Star,
  Trash2,
  X,
  Filter,
  Calendar,
} from "lucide-react";
import { db } from "../../lib/firebase.config";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import AdminPageWrapper from "../../components/admin/AdminPageWrapper";
import EmptyState from "../../components/common/EmptyState";

export default function AdminReviews() {
  const { user, userData, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [deletingId, setDeletingId] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
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

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const reviewsRef = collection(db, "Reviews");
      const q = query(reviewsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const fetchedReviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));

      setReviews(fetchedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isReady) return;
    fetchReviews();
  }, [isReady]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReviews();
    setRefreshing(false);
  };

  const handleDeleteClick = (review) => {
    setDeleteConfirm(review);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setDeletingId(deleteConfirm.id);
    try {
      await deleteDoc(doc(db, "Reviews", deleteConfirm.id));
      setReviews((prev) => prev.filter((r) => r.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting review:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      searchQuery === "" ||
      review.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.reviewText?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating =
      filterRating === "all" || review.rating === parseInt(filterRating);

    return matchesSearch && matchesRating;
  });

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : 0;

  const statCards = [
    {
      title: "Total Reviews",
      value: reviews.length,
      icon: Star,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-400",
    },
    {
      title: "Average Rating",
      value: averageRating,
      icon: Star,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-500/10",
      iconColor: "text-yellow-400",
    },
    {
      title: "5-Star Reviews",
      value: reviews.filter((r) => r.rating === 5).length,
      icon: Star,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-500/10",
      iconColor: "text-green-400",
    },
    {
      title: "1-Star Reviews",
      value: reviews.filter((r) => r.rating === 1).length,
      icon: Star,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-500/10",
      iconColor: "text-red-400",
    },
  ];

  const getRatingColor = (rating) => {
    switch (rating) {
      case 5:
        return "from-green-500 to-green-600";
      case 4:
        return "from-blue-500 to-blue-600";
      case 3:
        return "from-yellow-500 to-yellow-600";
      case 2:
        return "from-orange-500 to-orange-600";
      case 1:
        return "from-red-500 to-red-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  if (!isReady || loading) {
    return (
      <div
        className={`min-h-screen relative ${
          isDark ? "bg-black" : "bg-gray-50"
        }`}
      >
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-linear-to-br from-orange-500/5"
              : "bg-linear-to-br from-orange-100"
          } via-transparent to-transparent pointer-events-none`}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="animate-pulse space-y-4 md:space-y-6">
            <div className="h-6 md:h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 md:w-48"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-20 md:h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (userData?.role !== "admin") {
    return null;
  }

  return (
    <AdminPageWrapper
      title="Customer Reviews"
      subtitle="Manage and view all customer reviews"
      icon={Star}
      onRefresh={handleRefresh}
      isRefreshing={refreshing}
      color="purple"
    >
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-xl md:rounded-2xl p-4 md:p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                <div className="p-2 md:p-3 bg-red-500/20 rounded-lg md:rounded-xl">
                  <Trash2 className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                  Delete Review
                </h3>
              </div>

              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4 md:mb-6">
                Are you sure you want to delete this review from{" "}
                <span className="font-semibold text-red-500">
                  "{deleteConfirm.userName || "Anonymous"}"
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex flex-col xs:flex-row gap-2 md:gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-3 md:px-4 py-2 md:py-2.5 bg-white/50 dark:bg-gray-700/50 backdrop-blur-md border border-gray-300/50 dark:border-gray-600/50 rounded-lg hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium order-2 xs:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deletingId === deleteConfirm.id}
                  className="flex-1 px-3 md:px-4 py-2 md:py-2.5 bg-red-500/80 backdrop-blur-md border border-red-500/30 text-white rounded-lg hover:bg-red-600 transition-all text-sm md:text-base font-medium shadow-lg shadow-red-500/30 order-1 xs:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingId === deleteConfirm.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="w-full">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-8">
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
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-5 hover:border-white/20 transition-all">
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

        <div className="grid grid-cols-1 gap-4 md:gap-6 mb-4 md:mb-8">
          <div className="group relative overflow-hidden rounded-xl md:rounded-2xl bg-white/5 border border-white/10 p-4 md:p-6 hover:border-purple-500/30 transition-all">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews by name, email, or comment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-9 md:pr-10 py-2 md:py-3 text-sm md:text-base rounded-lg md:rounded-xl border border-white/10 bg-white/5 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 md:w-64">
                <Filter className="w-4 h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0" />
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  className="flex-1 px-3 md:px-4 py-2 md:py-3 text-sm md:text-base rounded-lg md:rounded-xl border border-white/10 bg-white/5 dark:text-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>

            {(searchQuery || filterRating !== "all") && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/10">
                <span className="text-xs text-gray-500">Active filters:</span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-[10px] md:text-xs text-purple-400">
                    Search: "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery("")}
                      className="hover:text-purple-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filterRating !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-[10px] md:text-xs text-purple-400">
                    {filterRating} Stars
                    <button
                      onClick={() => setFilterRating("all")}
                      className="hover:text-purple-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl md:rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
        >
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-purple-500/10 rounded-lg">
                <Star className="h-4 w-4 md:h-5 md:w-5 text-purple-400" />
              </div>
              <h3 className="text-sm md:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                All Reviews
              </h3>
            </div>
            <div className="text-xs md:text-sm text-gray-400">
              {filteredReviews.length} review
              {filteredReviews.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="md:hidden">
            {filteredReviews.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={Star}
                  title="No reviews found"
                  message={
                    searchQuery || filterRating !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Reviews will appear here when customers leave them"
                  }
                />
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredReviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-3 md:p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full bg-linear-to-tr ${getRatingColor(
                            review.rating
                          )} flex items-center justify-center text-white font-bold text-xs`}
                        >
                          {review.userName?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {review.userName || "Anonymous"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {review.userEmail || "No email"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteClick(review)}
                        disabled={deletingId === review.id}
                        className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          className={
                            star <= review.rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300 dark:text-gray-600"
                          }
                        />
                      ))}
                      <span className="ml-1 text-xs text-gray-500">
                        {review.rating}/5
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                      {review.reviewText || "No comment provided"}
                    </p>

                    {review.createdAt && (
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Calendar size={10} />
                        <span>
                          {review.createdAt.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:block overflow-x-auto">
            {filteredReviews.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={Star}
                  title="No reviews found"
                  message={
                    searchQuery || filterRating !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Reviews will appear here when customers leave them"
                  }
                />
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Review
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredReviews.map((review) => (
                    <tr
                      key={review.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full bg-linear-to-tr ${getRatingColor(
                              review.rating
                            )} flex items-center justify-center text-white font-bold`}
                          >
                            {review.userName?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {review.userName || "Anonymous"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {review.userEmail || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={
                                star <= review.rating
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300 dark:text-gray-600"
                              }
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-500">
                            {review.rating}/5
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 max-w-md">
                          {review.reviewText || "No comment provided"}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {review.createdAt && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Calendar size={14} />
                            <span>
                              {review.createdAt.toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteClick(review)}
                          disabled={deletingId === review.id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          {deletingId === review.id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    </AdminPageWrapper>
  );
}