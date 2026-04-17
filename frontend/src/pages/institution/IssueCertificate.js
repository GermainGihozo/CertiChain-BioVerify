import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Award, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const CURRENT_YEAR = new Date().getFullYear();

export default function IssueCertificate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [issued, setIssued]   = useState(null);
  const [form, setForm] = useState({
    studentEmail: "",
    studentWallet: "",
    certificateTitle: "",
    courseName: "",
    graduationYear: CURRENT_YEAR,
    grade: "",
    honors: "",
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/certificates", form);
      setIssued(data.certificate);
      toast.success("Certificate issued successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to issue certificate");
    } finally {
      setLoading(false);
    }
  };

  if (issued) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="card text-center py-10">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Issued!</h2>
          <p className="text-gray-500 mb-6">The certificate has been recorded on the blockchain.</p>
          <div className="bg-gray-50 rounded-xl p-4 text-left text-sm space-y-2 mb-6">
            <p><span className="text-gray-500">Certificate ID:</span> <span className="font-mono font-medium">{issued.certificateId}</span></p>
            <p><span className="text-gray-500">Student:</span> <span className="font-medium">{issued.studentName}</span></p>
            <p><span className="text-gray-500">Course:</span> <span className="font-medium">{issued.courseName}</span></p>
            <p><span className="text-gray-500">Status:</span> <span className={`font-medium ${issued.isOnChain ? "text-green-600" : "text-yellow-600"}`}>{issued.isOnChain ? "On Blockchain ✓" : "Pending blockchain"}</span></p>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setIssued(null); setForm({ ...form, studentEmail: "", studentWallet: "" }); }} className="btn-secondary">
              Issue Another
            </button>
            <button onClick={() => navigate("/institution")} className="btn-primary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Issue Certificate</h1>
        <p className="text-gray-500 mt-1">Issue a blockchain-verified certificate to a student</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Student info */}
          <div className="pb-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Student Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Student Email *</label>
                <input type="email" className="input-field" placeholder="student@example.com" value={form.studentEmail} onChange={set("studentEmail")} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Student Wallet Address</label>
                <input type="text" className="input-field font-mono text-sm" placeholder="0x..." value={form.studentWallet} onChange={set("studentWallet")} />
                <p className="text-xs text-gray-400 mt-1">Optional — uses student's registered wallet if blank</p>
              </div>
            </div>
          </div>

          {/* Certificate details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Certificate Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Certificate Title *</label>
                <input type="text" className="input-field" placeholder="Bachelor of Science in Computer Science" value={form.certificateTitle} onChange={set("certificateTitle")} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Course / Program *</label>
                <input type="text" className="input-field" placeholder="Computer Science" value={form.courseName} onChange={set("courseName")} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Graduation Year *</label>
                  <input type="number" className="input-field" min="1900" max={CURRENT_YEAR + 5} value={form.graduationYear} onChange={set("graduationYear")} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Grade</label>
                  <input type="text" className="input-field" placeholder="First Class" value={form.grade} onChange={set("grade")} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Honors / Distinction</label>
                <input type="text" className="input-field" placeholder="Cum Laude" value={form.honors} onChange={set("honors")} />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>A cryptographic hash will be generated and stored on the Ethereum blockchain. This action is permanent.</p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            <Award className="w-4 h-4" />
            {loading ? "Issuing on Blockchain..." : "Issue Certificate"}
          </button>
        </form>
      </div>
    </div>
  );
}
