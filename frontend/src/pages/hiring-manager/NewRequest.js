import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import PageHeader from "../../components/PageHeader";
import { Send, Search } from "lucide-react";
import toast from "react-hot-toast";

export default function NewRequest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [certificateInfo, setCertificateInfo] = useState(null);

  const [form, setForm] = useState({
    certificateId: "",
    studentEmail: "",
    companyName: "",
    jobTitle: "",
    message: "",
  });

  const handleVerifyCertificate = async () => {
    if (!form.certificateId.trim()) {
      toast.error("Please enter a certificate ID");
      return;
    }

    setVerifying(true);
    try {
      const { data } = await api.get(`/verify/${form.certificateId.trim()}`);
      
      if (data.valid && data.status === "issued") {
        setCertificateInfo(data.certificate);
        // Auto-fill student email if available
        if (data.certificate.studentEmail) {
          setForm({ ...form, studentEmail: data.certificate.studentEmail });
        }
        toast.success("Certificate verified!");
      } else {
        toast.error(data.error || "Certificate is not valid or not issued");
        setCertificateInfo(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to verify certificate");
      setCertificateInfo(null);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!certificateInfo) {
      toast.error("Please verify the certificate first");
      return;
    }

    setLoading(true);
    try {
      await api.post("/verification-requests", form);
      toast.success("Verification request sent successfully!");
      navigate("/hiring-manager/requests");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <PageHeader
        title="New Verification Request"
        description="Request certificate verification from a candidate"
        icon={Send}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Certificate ID */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Certificate Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Certificate ID *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder="e.g., UR-2026-A1B2C3D4"
                  value={form.certificateId}
                  onChange={(e) => setForm({ ...form, certificateId: e.target.value.toUpperCase() })}
                  required
                />
                <button
                  type="button"
                  onClick={handleVerifyCertificate}
                  disabled={verifying || !form.certificateId.trim()}
                  className="btn-secondary flex items-center gap-2 whitespace-nowrap"
                >
                  <Search className="w-4 h-4" />
                  {verifying ? "Verifying..." : "Verify"}
                </button>
              </div>
            </div>

            {/* Certificate Details */}
            {certificateInfo && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-lg">
                    <Search className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      Certificate Verified ✓
                    </h4>
                    <div className="space-y-1 text-sm text-green-800 dark:text-green-200">
                      <p><strong>Title:</strong> {certificateInfo.certificateTitle}</p>
                      <p><strong>Student:</strong> {certificateInfo.studentName}</p>
                      <p><strong>Course:</strong> {certificateInfo.courseName}</p>
                      <p><strong>Institution:</strong> {certificateInfo.institutionName}</p>
                      <p><strong>Year:</strong> {certificateInfo.graduationYear}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Candidate Information */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Candidate Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Candidate Email *
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="candidate@example.com"
                value={form.studentEmail}
                onChange={(e) => setForm({ ...form, studentEmail: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                The candidate will receive a notification at this email
              </p>
            </div>
          </div>
        </div>

        {/* Job Information */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Job Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Company Name *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Your Company Name"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Job Title *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Software Engineer"
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Message (Optional)
              </label>
              <textarea
                className="input-field"
                rows={4}
                placeholder="Add a message to the candidate..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {form.message.length}/500 characters
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/hiring-manager/requests")}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !certificateInfo}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? "Sending..." : "Send Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
