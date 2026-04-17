import React, { useEffect, useState } from "react";
import api from "../../services/api";
import CertificateCard from "../../components/CertificateCard";
import { Award, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function MyCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState({});

  useEffect(() => { loadCertificates(); }, []);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/certificates");
      setCertificates(data.certificates);
    } catch {
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const toggleQR = (id) => setShowQR((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
          <p className="text-gray-500 mt-1">{certificates.length} certificate{certificates.length !== 1 ? "s" : ""} found</p>
        </div>
        <button onClick={loadCertificates} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Award className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No certificates yet</p>
          <p className="text-sm mt-1">Your certificates will appear here once issued by your institution.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {certificates.map((cert) => (
            <div key={cert._id}>
              <CertificateCard certificate={cert} showQR={showQR[cert._id]} />
              <button
                onClick={() => toggleQR(cert._id)}
                className="mt-2 text-xs text-primary-600 hover:underline"
              >
                {showQR[cert._id] ? "Hide QR Code" : "Show QR Code"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
