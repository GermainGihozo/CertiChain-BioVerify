import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWeb3 } from "../../context/Web3Context";
import api from "../../services/api";
import {
  Award, Fingerprint, ShieldCheck, Wallet,
  ArrowRight, CheckCircle, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

export default function StudentDashboard() {
  const { user, refreshUser } = useAuth();
  const { account, connectWallet } = useWeb3();
  const [stats, setStats] = useState({ total: 0, issued: 0 });
  const [hasBiometric, setHasBiometric] = useState(false);

  useEffect(() => {
    loadStats();
    checkBiometric();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await api.get("/certificates?limit=100");
      setStats({
        total: data.total,
        issued: data.certificates.filter((c) => c.status === "issued").length,
      });
    } catch {}
  };

  const checkBiometric = async () => {
    try {
      const { data } = await api.get("/users/credentials");
      setHasBiometric(data.credentials.length > 0);
    } catch {}
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      toast.success("Wallet connected");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.fullName.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">Manage your academic certificates and identity</p>
      </div>

      {/* Alerts */}
      <div className="space-y-3 mb-8">
        {!hasBiometric && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-800">Biometric not set up</p>
                <p className="text-xs text-amber-600">Register your fingerprint to prove certificate ownership</p>
              </div>
            </div>
            <Link to="/student/biometric-setup" className="btn-primary text-sm py-2 px-4">
              Set Up Now
            </Link>
          </div>
        )}

        {!user.walletAddress && !account && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">No wallet connected</p>
                <p className="text-xs text-blue-600">Connect MetaMask to link your blockchain identity</p>
              </div>
            </div>
            <button onClick={handleConnectWallet} className="btn-primary text-sm py-2 px-4">
              Connect
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Award} label="Total Certificates" value={stats.total} color="text-blue-600 bg-blue-50" />
        <StatCard icon={CheckCircle} label="Verified Certificates" value={stats.issued} color="text-green-600 bg-green-50" />
        <StatCard
          icon={Fingerprint}
          label="Biometric Status"
          value={hasBiometric ? "Active" : "Not Set"}
          color={hasBiometric ? "text-purple-600 bg-purple-50" : "text-gray-400 bg-gray-100"}
        />
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ActionCard
          to="/student/certificates"
          icon={Award}
          title="My Certificates"
          desc="View and download your academic certificates"
          color="bg-blue-600"
        />
        <ActionCard
          to="/student/verify-ownership"
          icon={ShieldCheck}
          title="Verify Ownership"
          desc="Prove you own a certificate using biometrics"
          color="bg-purple-600"
        />
        <ActionCard
          to="/student/biometric-setup"
          icon={Fingerprint}
          title="Biometric Setup"
          desc="Register or manage your biometric credentials"
          color="bg-green-600"
        />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function ActionCard({ to, icon: Icon, title, desc, color }) {
  return (
    <Link to={to} className="card hover:shadow-md transition-shadow group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-3">{desc}</p>
      <span className="text-sm text-primary-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
        Open <ArrowRight className="w-4 h-4" />
      </span>
    </Link>
  );
}
