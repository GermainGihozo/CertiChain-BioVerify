import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Users, Search, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ManageUsers() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole]     = useState("");

  useEffect(() => { 
    loadUsers(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (role) params.append("role", role);
      if (search) params.append("search", search);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (userId) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/toggle`);
      toast.success(data.message);
      await loadUsers();
    } catch {
      toast.error("Failed to update user");
    }
  };

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleBadge = (r) => ({
    admin:       <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">Admin</span>,
    institution: <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Institution</span>,
    student:     <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Student</span>,
  }[r]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-500 mt-1">{users.length} users</p>
        </div>
        <button onClick={loadUsers} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input-field w-40" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="institution">Institutions</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="w-8 h-8 text-primary-600 animate-spin" /></div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Biometrics</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.fullName}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">{roleBadge(u.role)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${u.webauthnCredentials?.length > 0 ? "text-green-600" : "text-gray-400"}`}>
                        {u.webauthnCredentials?.length > 0 ? `${u.webauthnCredentials.length} device(s)` : "None"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-xs font-medium ${u.isActive ? "text-green-600" : "text-red-600"}`}>
                        {u.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(u._id)}
                        className={`text-xs font-medium hover:underline ${u.isActive ? "text-red-600" : "text-green-600"}`}
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center text-gray-400 py-10 text-sm">No users found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
