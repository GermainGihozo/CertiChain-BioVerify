import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Building2, Plus, CheckCircle, XCircle, RefreshCw, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function ManageInstitutions() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [showPw, setShowPw]             = useState(false);
  const [form, setForm] = useState({
    name: "", shortName: "", email: "", walletAddress: "",
    country: "", city: "", website: "",
    adminEmail: "", adminPassword: "", adminFullName: "",
  });

  useEffect(() => { loadInstitutions(); }, []);

  const loadInstitutions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/institutions");
      setInstitutions(data.institutions);
    } catch {
      toast.error("Failed to load institutions");
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/institutions", form);
      toast.success("Institution created and registered on blockchain!");
      setShowForm(false);
      setForm({ name: "", shortName: "", email: "", walletAddress: "", country: "", city: "", website: "", adminEmail: "", adminPassword: "", adminFullName: "" });
      await loadInstitutions();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create institution");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Deactivate this institution?")) return;
    try {
      await api.delete(`/institutions/${id}`);
      toast.success("Institution deactivated");
      await loadInstitutions();
    } catch {
      toast.error("Failed to deactivate");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Institutions</h1>
          <p className="text-gray-500 mt-1">{institutions.length} registered institutions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Institution
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card mb-8">
          <h2 className="font-semibold text-gray-900 mb-5">Register New Institution</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Institution Name *</label>
                <input type="text" className="input-field" placeholder="University of Rwanda" value={form.name} onChange={set("name")} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Name</label>
                <input type="text" className="input-field" placeholder="UR" value={form.shortName} onChange={set("shortName")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Institution Email *</label>
                <input type="email" className="input-field" value={form.email} onChange={set("email")} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Wallet Address *</label>
                <input type="text" className="input-field font-mono text-sm" placeholder="0x..." value={form.walletAddress} onChange={set("walletAddress")} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                <input type="text" className="input-field" value={form.country} onChange={set("country")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <input type="text" className="input-field" value={form.city} onChange={set("city")} />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Institution Admin Account</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Full Name *</label>
                  <input type="text" className="input-field" value={form.adminFullName} onChange={set("adminFullName")} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Email *</label>
                  <input type="email" className="input-field" value={form.adminEmail} onChange={set("adminEmail")} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Password *</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} className="input-field pr-10" value={form.adminPassword} onChange={set("adminPassword")} required minLength={8} />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPw(!showPw)}>
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? "Creating..." : "Create Institution"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="w-8 h-8 text-primary-600 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {institutions.map((inst) => (
            <div key={inst._id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{inst.name}</h3>
                    {inst.shortName && <p className="text-xs text-gray-400">{inst.shortName}</p>}
                  </div>
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${inst.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {inst.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {inst.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-1">{inst.email}</p>
              <p className="text-xs font-mono text-gray-400 mb-3 truncate">{inst.walletAddress}</p>
              {inst.registeredOnChain && (
                <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">On Blockchain ✓</span>
              )}
              {inst.isActive && (
                <button onClick={() => handleDeactivate(inst._id)} className="mt-3 text-xs text-red-600 hover:underline block">
                  Deactivate
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
