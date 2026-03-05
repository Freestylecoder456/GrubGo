import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router";
import { useEffect, useState, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { useAlert } from "../../context/AlertContext";
import {
  UtensilsCrossed,
  ArrowLeft,
  Save,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Image as ImageIcon,
  Pencil,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase.config";
import AdminPageWrapper from "../../components/admin/AdminPageWrapper";

export default function AddMenu() {
  const { user, userData, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const { showAlert } = useAlert();

  // Form state matching the exact schema
  const [formData, setFormData] = useState({
    uid: null,
    name: "",
    cat: "Main Course",
    price: "",
    time: "",
    minDeliveryTime: "",
    rating: 0,
    popularity: 0,
    available: true,
    img: "",
    desc: "",
    chefSpecial: false,
    calories: "",
    tags: [],
    docId: null,
  });

  const [tagInput, setTagInput] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef(null);

  const categories = [
    "Main Course",
    "Beverages",
    "Desserts",
    "Sides",
    "Appetizers",
    "Salads",
    "Breakfast",
  ];

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth/signin");
      } else if (userData?.role !== "admin") {
        navigate("/");
      }
    }
  }, [user, userData, authLoading, navigate]);

  // Fetch existing menu items
  const fetchMenuItems = async () => {
    try {
      const q = query(collection(db, "Menu"), orderBy("id", "desc"));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const items = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          docId: doc.id,
        }));
        setMenuItems(items);
      }
    } catch (err) {
      console.log("Could not fetch menu items:", err);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMenuItems();
    setRefreshing(false);
  };

  // Image compression function
  const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Handle file selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setError("");
    setCompressing(true);

    try {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      const base64 = await compressImage(file);
      setFormData((prev) => ({ ...prev, img: base64 }));
    } catch (err) {
      setError("Failed to process image");
      console.error(err);
    } finally {
      setCompressing(false);
    }
  };

  // Handle URL input (fallback)
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, img: url }));
    if (url.startsWith("http")) {
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  // Clear image
  const clearImage = () => {
    setFormData((prev) => ({ ...prev, img: "" }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Reset form to create new item
  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      cat: "Main Course",
      price: "",
      time: "",
      minDeliveryTime: "",
      rating: 0,
      popularity: 0,
      available: true,
      img: "",
      desc: "",
      chefSpecial: false,
      calories: "",
      tags: [],
      docId: null,
    });
    setImagePreview(null);
    setEditingItem(null);
    setViewMode("create");
    setError("");
  };

  // Edit existing item
  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      name: item.name || "",
      cat: item.cat || "Main Course",
      price: item.price?.toString() || "",
      time: item.time || "",
      minDeliveryTime: item.minDeliveryTime || "",
      rating: item.rating || 0,
      popularity: item.popularity || 0,
      available: item.available ?? true,
      img: item.img || "",
      desc: item.desc || "",
      chefSpecial: item.chefSpecial || false,
      calories: item.calories?.toString() || "",
      tags: item.tags || [],
      docId: item.docId,
    });
    setImagePreview(item.img || null);
    setEditingItem(item);
    setViewMode("edit");
  };

  // Open delete confirmation modal
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  // Confirm and process deletion
  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteDoc(doc(db, "Menu", itemToDelete.docId));
      setMenuItems((prev) => prev.filter((i) => i.docId !== itemToDelete.docId));
      showAlert(`"${itemToDelete.name}" has been deleted`, "success");
    } catch (err) {
      showAlert("Failed to delete item", "error");
      console.error(err);
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // Toggle item availability
  const toggleAvailability = async (item) => {
    try {
      await updateDoc(doc(db, "Menu", item.docId), {
        available: !item.available,
      });
      setMenuItems((prev) =>
        prev.map((i) =>
          i.docId === item.docId ? { ...i, available: !i.available } : i
        )
      );
    } catch (err) {
      setError("Failed to update availability");
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (
        !formData.name ||
        !formData.price ||
        !formData.time ||
        !formData.desc ||
        !formData.img
      ) {
        throw new Error("Please fill in all required fields");
      }

      const menuItem = {
        id: formData.docId ? formData.id : null,
        name: formData.name,
        cat: formData.cat,
        price: parseFloat(formData.price),
        time: formData.time,
        minDeliveryTime: formData.minDeliveryTime,
        rating: parseFloat(formData.rating) || 0,
        popularity: parseInt(formData.popularity) || 0,
        available: formData.available,
        img: formData.img,
        desc: formData.desc,
        chefSpecial: formData.chefSpecial,
        calories: parseInt(formData.calories) || 0,
        tags: formData.tags,
        updatedAt: serverTimestamp(),
      };

      if (formData.docId) {
        await updateDoc(doc(db, "Menu", formData.docId), menuItem);
        setMenuItems((prev) =>
          prev.map((item) =>
            item.docId === formData.docId
              ? { ...item, ...menuItem, docId: formData.docId }
              : item
          )
        );
      } else {
        menuItem.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(db, "Menu"), menuItem);
        menuItem.id = docRef.id;
        await updateDoc(doc(db, "Menu", docRef.id), { id: docRef.id });
        setMenuItems((prev) => [{ ...menuItem, docId: docRef.id }, ...prev]);
      }

      setSuccess(true);
      resetForm();
      setViewMode("list");

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div
        className={`min-h-screen ${
          isDark ? "bg-black" : "bg-gray-100"
        } flex items-center justify-center`}
      >
        <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (userData?.role !== "admin") {
    return null;
  }

  return (
    <AdminPageWrapper
      title={
        viewMode === "list"
          ? "Menu Items"
          : viewMode === "edit"
          ? "Edit Menu Item"
          : "Add Menu Item"
      }
      subtitle={
        viewMode === "list"
          ? `${menuItems.length} items in menu`
          : "Fill in the details below"
      }
      icon={UtensilsCrossed}
      onRefresh={viewMode === "list" ? handleRefresh : undefined}
      isRefreshing={refreshing}
      color="red"
    >
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDeleteModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-zinc-800"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Delete Menu Item?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={closeDeleteModal}
                    className="flex-1 px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto">
          {viewMode !== "list" && (
            <button
              onClick={() => {
                resetForm();
                setViewMode("list");
              }}
              className="p-1.5 md:p-2 rounded-lg md:rounded-xl hover:bg-white/10 transition-colors bg-white/5 border border-white/10"
            >
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>
        {viewMode === "list" && (
          <button
            onClick={resetForm}
            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-linear-to-r from-red-500 to-red-600 text-white rounded-lg md:rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all text-sm md:text-base font-medium w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4 md:h-5 md:w-5" />
            <span>Add Menu Item</span>
          </button>
        )}
      </div>

      <div className="relative w-full">
        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 md:mb-6 bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center gap-2 md:gap-3"
          >
            <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-400 flex-shrink-0" />
            <span className="text-green-400 text-xs md:text-sm">
              {formData.docId
                ? "Menu item updated successfully!"
                : "Menu item added successfully!"}
            </span>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 md:mb-6 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center gap-2 md:gap-3"
          >
            <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-red-400 flex-shrink-0" />
            <span className="text-red-400 text-xs md:text-sm">{error}</span>
          </motion.div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {menuItems.length === 0 ? (
              <div className="rounded-xl md:rounded-2xl bg-white/5 border border-white/10 p-8 md:p-12 text-center">
                <UtensilsCrossed className="h-12 w-12 md:h-16 md:w-16 text-gray-600 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No menu items yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm md:text-base">
                  Add your first menu item to get started
                </p>
                <button
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-linear-to-r from-red-500 to-red-600 text-white rounded-lg md:rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all text-sm md:text-base font-medium"
                >
                  <Plus className="h-4 w-4 md:h-5 md:w-5" />
                  Add Menu Item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.docId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative rounded-xl md:rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden hover:border-white/20 transition-all"
                  >
                    {/* Image */}
                    <div className="relative h-32 md:h-40 lg:h-48 overflow-hidden">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/400x200?text=No+Image";
                        }}
                      />

                      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

                      <div className="absolute top-2 md:top-3 right-2 md:right-3 flex gap-1.5 md:gap-2">
                        <button
                          onClick={() => toggleAvailability(item)}
                          className={`p-1.5 md:p-2 rounded-lg md:rounded-xl backdrop-blur-md border border-white/20 transition-colors ${
                            item.available
                              ? "bg-green-500/70 hover:bg-green-600/80 text-white"
                              : "bg-red-500/70 hover:bg-red-600/80 text-white"
                          }`}
                          title={
                            item.available
                              ? "Mark unavailable"
                              : "Mark available"
                          }
                        >
                          {item.available ? (
                            <Eye className="h-3 w-3 md:h-4 md:w-4" />
                          ) : (
                            <EyeOff className="h-3 w-3 md:h-4 md:w-4" />
                          )}
                        </button>
                      </div>

                      {item.chefSpecial && (
                        <div className="absolute top-2 md:top-3 left-2 md:left-3 bg-linear-to-r from-red-500/90 to-red-500/90 backdrop-blur-md px-2 md:px-3 py-1 rounded-lg md:rounded-xl border border-white/20">
                          <span className="text-[10px] md:text-xs font-bold text-black">
                            Chef's Special
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3 md:p-4">
                      <div className="flex items-start justify-between mb-1.5 md:mb-2 gap-2">
                        <h3 className="font-semibold text-sm md:text-base lg:text-lg text-gray-900 dark:text-white group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors truncate flex-1">
                          {item.name}
                        </h3>
                        <span className="text-red-500 dark:text-red-400 font-bold text-sm md:text-base whitespace-nowrap">
                          ${item.price?.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2 md:mb-3 line-clamp-2">
                        {item.desc}
                      </p>

                      <div className="flex items-center gap-1.5 md:gap-2 mb-3 md:mb-4 flex-wrap">
                        <span className="text-[10px] md:text-xs px-2 py-0.5 md:py-1 bg-white/10 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded border border-white/20 dark:border-white/10">
                          {item.cat}
                        </span>

                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          •
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {item.time}
                        </span>

                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          •
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {item.calories} cal
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 
                          bg-red-500/20 dark:bg-red-500/10 
                          backdrop-blur-md
                          border border-red-400/30 dark:border-red-500/20
                          text-red-700 dark:text-red-400
                          rounded-lg md:rounded-xl 
                          hover:bg-red-500/30 dark:hover:bg-red-500/20
                          transition-colors text-xs md:text-sm font-medium"
                        >
                          <Pencil className="h-3 w-3 md:h-4 md:w-4" />
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="flex items-center justify-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 
                          bg-red-500/20 dark:bg-red-500/10 
                          backdrop-blur-md
                          border border-red-400/30 dark:border-red-500/20
                          text-red-700 dark:text-red-400
                          rounded-lg md:rounded-xl 
                          hover:bg-red-500/30 dark:hover:bg-red-500/20
                          transition-colors text-xs md:text-sm font-medium"
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Form View - Create/Edit */}
        {viewMode !== "list" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <form
              onSubmit={handleSubmit}
              className="space-y-4 md:space-y-6 lg:space-y-8"
            >
              {/* Basic Information */}
              <div className="rounded-xl md:rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 md:p-5 lg:p-6">
                <h2 className="text-sm md:text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-4 md:mb-6">
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                      Dish Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Signature Wagyu"
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 dark:border-white/10 rounded-lg md:rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm md:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                      Category *
                    </label>
                    <select
                      name="cat"
                      value={formData.cat}
                      onChange={handleInputChange}
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 dark:border-white/10 rounded-lg md:rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm md:text-base"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="14.99"
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 dark:border-white/10 rounded-lg md:rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm md:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                      Preparation Time *
                    </label>
                    <input
                      type="text"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      placeholder="e.g., 15 min"
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 dark:border-white/10 rounded-lg md:rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm md:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                      Min Delivery Time
                    </label>
                    <input
                      type="text"
                      name="minDeliveryTime"
                      value={formData.minDeliveryTime}
                      onChange={handleInputChange}
                      placeholder="e.g., 30 min"
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 dark:border-white/10 rounded-lg md:rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                      Calories
                    </label>
                    <input
                      type="number"
                      name="calories"
                      min="0"
                      value={formData.calories}
                      onChange={handleInputChange}
                      placeholder="e.g., 850"
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 dark:border-white/10 rounded-lg md:rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm md:text-base"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                      Image *
                    </label>
                    <div className="space-y-2 md:space-y-3">
                      {/* File Upload Button */}
                      <div className="flex gap-2 md:gap-3">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 border-2 border-dashed border-white/20 dark:border-white/10 rounded-lg md:rounded-xl hover:border-red-500/50 hover:bg-red-500/10 transition-colors"
                        >
                          <Upload className="h-4 w-4 md:h-5 md:w-5 text-gray-500 dark:text-gray-400" />
                          <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">
                            Upload Image
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            document.getElementById("url-input")?.focus()
                          }
                          className="px-3 md:px-4 py-2.5 md:py-3 border border-white/20 dark:border-white/10 rounded-lg md:rounded-xl hover:border-red-500/50 transition-colors"
                        >
                          <ImageIcon className="h-4 w-4 md:h-5 md:w-5 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>

                      {/* URL Input (Alternative) */}
                      <input
                        type="url"
                        id="url-input"
                        name="img"
                        value={formData.img}
                        onChange={handleUrlChange}
                        placeholder="Or paste image URL here..."
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 dark:border-white/10 rounded-lg md:rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm md:text-base"
                      />

                      {/* Compressing indicator */}
                      {compressing && (
                        <div className="flex items-center gap-2 text-xs md:text-sm text-red-500">
                          <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-2 border-red-500 border-t-transparent"></div>
                          Compressing image...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 md:mt-5 lg:mt-6">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                    Description *
                  </label>
                  <textarea
                    name="desc"
                    value={formData.desc}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Describe the dish..."
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 dark:border-white/10 rounded-lg md:rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm md:text-base resize-none"
                    required
                  />
                </div>

                {/* Image Preview */}
                {(formData.img || imagePreview) && (
                  <div className="mt-4 md:mt-5 lg:mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                        Image Preview
                      </label>
                      <button
                        type="button"
                        onClick={clearImage}
                        className="text-xs md:text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
                      >
                        <X className="h-3 w-3 md:h-4 md:w-4" />
                        Remove
                      </button>
                    </div>
                    <div className="relative w-full h-32 md:h-40 lg:h-48 rounded-lg md:rounded-xl overflow-hidden bg-white/5">
                      <img
                        src={imagePreview || formData.img}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Details */}
              <div className="rounded-xl md:rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 md:p-5 lg:p-6">
                <h2 className="text-sm md:text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-4 md:mb-6">
                  Additional Details
                </h2>

                {/* Tags */}
                <div className="mt-4 md:mt-5 lg:mt-6">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddTag())
                      }
                      placeholder="Add a tag..."
                      className="flex-1 px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 dark:border-white/10 rounded-lg md:rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm md:text-base"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 md:px-4 py-2 md:py-2.5 bg-white/10 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-lg md:rounded-xl hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
                    >
                      <Plus className="h-4 w-4 md:h-5 md:w-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 md:px-3 py-1 bg-red-500/20 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-full text-xs md:text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-900 dark:hover:text-red-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="mt-4 md:mt-5 lg:mt-6 flex flex-col sm:flex-row gap-4 md:gap-6">
                  <label className="flex items-center gap-2 md:gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="available"
                      checked={formData.available}
                      onChange={handleInputChange}
                      className="w-4 h-4 md:w-5 md:h-5 text-red-500 border-white/20 rounded focus:ring-red-500 bg-white/5"
                    />
                    <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">
                      Available for order
                    </span>
                  </label>

                  <label className="flex items-center gap-2 md:gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="chefSpecial"
                      checked={formData.chefSpecial}
                      onChange={handleInputChange}
                      className="w-4 h-4 md:w-5 md:h-5 text-red-500 border-white/20 rounded focus:ring-red-500 bg-white/5"
                    />
                    <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">
                      Chef's Special
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setViewMode("list");
                  }}
                  className="order-2 sm:order-1 px-4 md:px-6 py-2.5 md:py-3 border border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-lg md:rounded-xl hover:bg-white/10 transition-colors text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="order-1 sm:order-2 px-4 md:px-6 py-2.5 md:py-3 bg-linear-to-r from-red-500 to-red-600 text-white rounded-lg md:rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base font-medium"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 md:h-5 md:w-5" />
                      <span>
                        {formData.docId ? "Update Menu" : "Add to Menu"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </AdminPageWrapper>
  );
}