import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import PageHeader from "../../components/PageHeader";
import { Award, CheckCircle, AlertCircle, Upload } from "lucide-react";
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Certificate Submitted!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The student will be notified to confirm ownership with their biometric, then an admin will approve it.
          </p>

          {/* Flow steps */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-green-600 font-medium">Issued</span>
            </div>
            <div className="w-10 h-0.5 bg-yellow-300" />
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <span className="text-xs text-yellow-600 font-medium">Student</span>
            </div>
            <div className="w-10 h-0.5 bg-gray-200" />
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-xs font-bold">3</span>
              </div>
              <span className="text-xs text-gray-400 font-medium">Admin</span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-left text-sm space-y-2 mb-6">
            <p><span className="text-gray-500">Certificate ID:</span> <span className="font-mono font-medium dark:text-gray-200">{issued.certificateId}</span></p>
            <p><span className="text-gray-500">Student:</span> <span className="font-medium dark:text-gray-200">{issued.studentName}</span></p>
            <p><span className="text-gray-500">Course:</span> <span className="font-medium dark:text-gray-200">{issued.courseName}</span></p>
            <p><span className="text-gray-500">Status:</span> <span className="font-medium text-yellow-600">Awaiting student confirmation</span></p>
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
      <PageHeader
        title="Issue Certificate"
        description="Issue blockchain-verified certificates to students"
        icon={Upload}
      />

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

          <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-sm text-blue-700 dark:text-blue-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">3-step approval process</p>
              <ol className="list-decimal list-inside space-y-0.5 text-xs">
                <li>You submit the certificate (now)</li>
                <li>Student confirms ownership with biometric</li>
                <li>Admin approves and records on blockchain</li>
              </ol>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            <Award className="w-4 h-4" />
            {loading ? "Submitting..." : "Submit Certificate"}
          </button>
        </form>
      </div>
    </div>
  );
}
