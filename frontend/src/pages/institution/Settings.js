import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import PageHeader from "../../components/PageHeader";
import { Settings as SettingsIcon, User, Lock, Building2, Save, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [institution, setInstitution] = useState(null);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  // Profile form
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Institution form
  const [institutionForm, setInstitutionForm] = useState({
    name: "",
    shortName: "",
    country: "",
    city: "",
    website: "",
  });

  useEffect(() => {
    if (user?.institutionId) {
      loadInstitution();
    }
  }, [user]);

  const loadInstitution = async () => {
    try {
      const { data } = await api.get(`/institutions/${user.institutionId}`);
      setInstitution(data.institution);
      setInstitutionForm({
        name: data.institution.name || "",
        shortName: data.institution.shortName || "",
        country: data.institution.country || "",
        city: data.institution.city || "",
        website: data.institution.website || "",
      });
    } catch (err) {
      toast.error("Failed to load institution details");
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/users/profile", profileForm);
      toast.success("Profile updated successfully!");
      await refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await api.put("/users/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleInstitutionUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/institutions/${user.institutionId}`, institutionForm);
      toast.success("Institution details updated!");
      await loadInstitution();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update institution");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "institution", label: "Institution", icon: Building2 },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <PageHeader
        title="Settings"
        description="Manage your account and institution settings"
        icon={SettingsIcon}
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === id
                ? "border-primary-600 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Profile Information
          </h2>
          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                className="input-field"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                className="input-field bg-gray-50 dark:bg-gray-800"
                value={user?.email}
                disabled
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Role
              </label>
              <input
                type="text"
                className="input-field bg-gray-50 dark:bg-gray-800 capitalize"
                value={user?.role}
                disabled
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Change Password
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.current ? "text" : "password"}
                  className="input-field pr-10"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                >
                  {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.new ? "text" : "password"}
                  className="input-field pr-10"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                >
                  {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  className="input-field pr-10"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                >
                  {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <Lock className="w-4 h-4" />
              {loading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      )}

      {/* Institution Tab */}
      {activeTab === "institution" && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Institution Details
          </h2>
          
          {institution && (
            <>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Wallet Address</p>
                    <p className="font-mono text-xs text-gray-900 dark:text-gray-100 break-all mt-1">
                      {institution.walletAddress}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Status</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                      {institution.isActive ? "✅ Active" : "❌ Inactive"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Blockchain</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                      {institution.registeredOnChain ? "✅ Registered" : "⏳ Pending"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                      {institution.email}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleInstitutionUpdate} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Institution Name
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={institutionForm.name}
                      onChange={(e) => setInstitutionForm({ ...institutionForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Short Name
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={institutionForm.shortName}
                      onChange={(e) => setInstitutionForm({ ...institutionForm, shortName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Country
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={institutionForm.country}
                      onChange={(e) => setInstitutionForm({ ...institutionForm, country: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={institutionForm.city}
                      onChange={(e) => setInstitutionForm({ ...institutionForm, city: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Website
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://..."
                    value={institutionForm.website}
                    onChange={(e) => setInstitutionForm({ ...institutionForm, website: e.target.value })}
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
