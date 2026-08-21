import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Lock,
  MapPin,
  Shield,
  Plus,
  Trash2,
  Edit3,
  Check,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Building,
  Phone,
  Mail,
  ShoppingBag,
  Clock,
  Sparkles,
} from "lucide-react";
import api from "../api/axiosInstance";
import { useAuthStore } from "../store/useAuthStore";

export default function Profile() {
  const { user, setUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState("details"); // "details", "security", "addresses"

  // Profile Details Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    fullName: user?.name || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [addressSuccess, setAddressSuccess] = useState("");

  // Sync user state to profile form
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // Fetch addresses on mount
  const fetchAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      const res = await api.get("/auth/addresses");
      setAddresses(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // 1. Update Profile Handler
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");

    if (!profileData.name.trim() || !profileData.email.trim()) {
      setProfileError("Name and email cannot be empty.");
      return;
    }

    try {
      setIsUpdatingProfile(true);
      const res = await api.patch("/auth/update-account", {
        name: profileData.name.trim(),
        email: profileData.email.trim(),
      });
      setUser(res.data.data);
      setProfileSuccess("Account details updated successfully!");
    } catch (err) {
      setProfileError(
        err.response?.data?.message || "Failed to update account details."
      );
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // 2. Change Password Handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");

    if (!passwordData.oldPassword || !passwordData.newPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await api.patch("/auth/change-password", {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess("Password changed successfully!");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || "Failed to change password."
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // 3. Address Modal Handlers
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressFormData({
      fullName: user?.name || "",
      phone: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      isDefault: addresses.length === 0,
    });
    setAddressError("");
    setAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setAddressFormData({
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      street: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.postalCode || "",
      country: addr.country || "India",
      isDefault: addr.isDefault || false,
    });
    setAddressError("");
    setAddressModalOpen(true);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressError("");
    setAddressSuccess("");

    const required = ["fullName", "phone", "street", "city", "state", "postalCode"];
    if (required.some((field) => !addressFormData[field]?.trim())) {
      setAddressError("Please fill out all address fields.");
      return;
    }

    try {
      setIsSavingAddress(true);
      if (editingAddressId) {
        const res = await api.put(`/auth/addresses/${editingAddressId}`, addressFormData);
        setAddresses(res.data.data);
        setAddressSuccess("Address updated successfully.");
      } else {
        const res = await api.post("/auth/addresses", addressFormData);
        setAddresses(res.data.data);
        setAddressSuccess("New address added successfully.");
      }
      setAddressModalOpen(false);
    } catch (err) {
      setAddressError(
        err.response?.data?.message || "Failed to save address."
      );
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await api.delete(`/auth/addresses/${addressId}`);
      setAddresses(res.data.data);
      setAddressSuccess("Address removed.");
    } catch (err) {
      setAddressError(
        err.response?.data?.message || "Failed to delete address."
      );
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const res = await api.patch(`/auth/addresses/${addressId}/default`);
      setAddresses(res.data.data);
      setAddressSuccess("Default address updated.");
    } catch (err) {
      setAddressError(
        err.response?.data?.message || "Failed to set default address."
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Account & Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your personal profile, security credentials, and shipping addresses
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-indigo-600 hover:text-indigo-600"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>My Orders</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Sidebar: User Card & Navigation Tabs */}
        <div className="space-y-6 lg:col-span-4">
          {/* User Profile Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-xl font-black text-white shadow-md shadow-indigo-100">
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "U"}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-base font-bold text-slate-900">
                    {user?.name}
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold capitalize text-indigo-700">
                    {user?.role || "Customer"}
                  </span>
                </div>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>
                    Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation Menu */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <button
              onClick={() => setActiveTab("details")}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                activeTab === "details"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <User className="h-4 w-4" />
              <span>Personal Details</span>
            </button>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                activeTab === "addresses"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span>Saved Addresses</span>
              {addresses.length > 0 && (
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${
                    activeTab === "addresses"
                      ? "bg-indigo-700 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {addresses.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                activeTab === "security"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>Password & Security</span>
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-8">
          {/* TAB 1: Personal Details Form */}
          {activeTab === "details" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Update your contact info and personal display name
                </p>
              </div>

              {profileSuccess && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Full Name
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="text"
                      required
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Email Address
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="email"
                      required
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isUpdatingProfile ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Addresses Management */}
          {activeTab === "addresses" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Saved Addresses</h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Manage your shipping and delivery destinations
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddAddress}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Address</span>
                </button>
              </div>

              {addressSuccess && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span>{addressSuccess}</span>
                </div>
              )}

              {addressError && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{addressError}</span>
                </div>
              )}

              {isLoadingAddresses ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="py-12 text-center">
                  <MapPin className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-3 text-sm font-bold text-slate-900">No saved addresses</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Add a shipping address for faster one-click checkout.
                  </p>
                  <button
                    onClick={handleOpenAddAddress}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Address</span>
                  </button>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`relative flex flex-col justify-between rounded-2xl border p-5 transition ${
                        addr.isDefault
                          ? "border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-100"
                          : "border-slate-200 bg-slate-50/50 hover:bg-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900">{addr.fullName}</span>
                          {addr.isDefault && (
                            <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-slate-600">
                          {addr.street}, {addr.city}
                        </p>
                        <p className="text-xs text-slate-600">
                          {addr.state} - {addr.postalCode}, {addr.country}
                        </p>
                        <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-slate-700">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{addr.phone}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3">
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr._id)}
                            className="text-xs font-bold text-indigo-600 hover:underline"
                          >
                            Set Default
                          </button>
                        )}
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditAddress(addr)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            title="Edit Address"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr._id)}
                            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                            title="Delete Address"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Password & Security Form */}
          {activeTab === "security" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">Password & Authentication</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Ensure your account is protected with a secure password
                </p>
              </div>

              {passwordSuccess && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Current Password
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={passwordData.oldPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, oldPassword: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    New Password
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="password"
                      required
                      placeholder="Minimum 8 characters"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Confirm New Password
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="password"
                      required
                      placeholder="Re-enter new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isUpdatingPassword ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Address Add/Edit Modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingAddressId ? "Edit Address" : "Add New Shipping Address"}
              </h3>
              <button
                type="button"
                onClick={() => setAddressModalOpen(false)}
                className="text-sm font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {addressError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{addressError}</span>
              </div>
            )}

            <form onSubmit={handleAddressSubmit} className="mt-4 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-700">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={addressFormData.fullName}
                    onChange={(e) =>
                      setAddressFormData({ ...addressFormData, fullName: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={addressFormData.phone}
                    onChange={(e) =>
                      setAddressFormData({ ...addressFormData, phone: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Street / House No.</label>
                <input
                  type="text"
                  required
                  value={addressFormData.street}
                  onChange={(e) =>
                    setAddressFormData({ ...addressFormData, street: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">City</label>
                  <input
                    type="text"
                    required
                    value={addressFormData.city}
                    onChange={(e) =>
                      setAddressFormData({ ...addressFormData, city: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">State</label>
                  <input
                    type="text"
                    required
                    value={addressFormData.state}
                    onChange={(e) =>
                      setAddressFormData({ ...addressFormData, state: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Postal PIN Code</label>
                  <input
                    type="text"
                    required
                    value={addressFormData.postalCode}
                    onChange={(e) =>
                      setAddressFormData({
                        ...addressFormData,
                        postalCode: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  checked={addressFormData.isDefault}
                  onChange={(e) =>
                    setAddressFormData({
                      ...addressFormData,
                      isDefault: e.target.checked,
                    })
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Set this address as default
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSavingAddress ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span>Save Address</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
