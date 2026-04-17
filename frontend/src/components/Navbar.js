import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWeb3 } from "../context/Web3Context";
import { ShieldCheck, Menu, X, Wallet, LogOut, User } from "lucide-react";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { account, connectWallet, connecting } = useWeb3();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged out");
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast.success("Wallet connected");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const dashboardPath =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "institution"
      ? "/institution"
      : "/student";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-700">
            <ShieldCheck className="w-7 h-7 text-primary-600" />
            CertChain
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/verify" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
              Verify Certificate
            </Link>

            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Dashboard
                </Link>

                {/* Wallet button */}
                {!account ? (
                  <button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary-600 border border-gray-300 rounded-lg px-3 py-1.5 transition-colors"
                  >
                    <Wallet className="w-4 h-4" />
                    {connecting ? "Connecting..." : "Connect Wallet"}
                  </button>
                ) : (
                  <span className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                    <Wallet className="w-4 h-4" />
                    {account.slice(0, 6)}…{account.slice(-4)}
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {user.fullName.split(" ")[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary-600">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3">
          <Link to="/verify" className="block text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
            Verify Certificate
          </Link>
          {user ? (
            <>
              <Link to={dashboardPath} className="block text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <button onClick={handleLogout} className="block text-sm font-medium text-red-600">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="block text-sm font-medium text-primary-600" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
