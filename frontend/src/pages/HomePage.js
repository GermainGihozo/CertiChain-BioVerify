import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, Fingerprint, Search, Award, Building2,
  CheckCircle, ArrowRight, Lock, Globe, Zap
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Blockchain Immutability",
    desc: "Every certificate is hashed and stored on Ethereum. Tampering is instantly detectable.",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: Fingerprint,
    title: "Biometric Ownership",
    desc: "Graduates prove ownership via fingerprint, face recognition, or Windows Hello through WebAuthn.",
    color: "text-purple-600 bg-purple-50",
  },
  {
    icon: Search,
    title: "Instant Verification",
    desc: "Employers verify any certificate in seconds by ID, QR code, or file upload.",
    color: "text-green-600 bg-green-50",
  },
  {
    icon: Lock,
    title: "Fraud Prevention",
    desc: "Altered certificates produce different hashes — blockchain records never match fakes.",
    color: "text-red-600 bg-red-50",
  },
  {
    icon: Globe,
    title: "Public Verification",
    desc: "No account needed to verify. Anyone can check certificate authenticity instantly.",
    color: "text-orange-600 bg-orange-50",
  },
  {
    icon: Zap,
    title: "MetaMask Integration",
    desc: "Wallet-based identity ensures only the rightful owner can claim their credentials.",
    color: "text-yellow-600 bg-yellow-50",
  },
];

const steps = [
  { icon: Building2, title: "Institution Issues Certificate", desc: "Authorized institutions upload certificate details. A cryptographic hash is stored on Ethereum." },
  { icon: Award,     title: "Student Receives Credential",   desc: "The certificate is linked to the student's wallet address and biometric identity." },
  { icon: Fingerprint, title: "Owner Verifies Identity",    desc: "Student uses fingerprint or face recognition to prove ownership via WebAuthn." },
  { icon: CheckCircle, title: "Employer Verifies Instantly", desc: "Third parties scan QR code or enter certificate ID to get instant blockchain verification." },
];

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-accent-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <ShieldCheck className="w-4 h-4" />
            Powered by Ethereum Blockchain + WebAuthn
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            Academic Certificates
            <br />
            <span className="text-blue-300">You Can Trust</span>
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Issue tamper-proof certificates on blockchain. Prove ownership with biometrics.
            Verify authenticity in seconds — no paperwork, no fraud.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/verify" className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold py-3 px-8 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
              <Search className="w-5 h-5" />
              Verify a Certificate
            </Link>
            <Link to="/register" className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white font-bold py-3 px-8 rounded-xl hover:bg-white/20 transition-colors">
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why CertChain?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              A next-generation credential system combining blockchain trust with biometric identity.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="text-center">
                <div className="relative inline-flex">
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-700 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to modernize your credentials?</h2>
          <p className="text-blue-200 mb-8">
            Join institutions and graduates already using blockchain-verified certificates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-700 font-bold py-3 px-8 rounded-xl hover:bg-blue-50 transition-colors">
              Create Account
            </Link>
            <Link to="/verify" className="border border-white/40 text-white font-bold py-3 px-8 rounded-xl hover:bg-white/10 transition-colors">
              Verify Certificate
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
