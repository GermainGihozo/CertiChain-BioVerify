import React from "react";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <ShieldCheck className="w-6 h-6 text-primary-400" />
            CertChain
          </div>
          <p className="text-sm text-center">
            Blockchain-powered academic certificate verification with biometric authentication.
          </p>
          <p className="text-sm">© {new Date().getFullYear()} CertChain. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
