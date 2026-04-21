import React, { useState } from "react";
import Papa from "papaparse";
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function BatchUpload({ onUpload, onClose }) {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [processing, setProcessing] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    setFile(selectedFile);
    setErrors([]);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        validateData(results.data);
      },
      error: (error) => {
        toast.error(`CSV parsing error: ${error.message}`);
      },
    });
  };

  const validateData = (rows) => {
    const requiredFields = ["studentEmail", "certificateTitle", "courseName", "graduationYear"];
    const validRows = [];
    const errorList = [];

    rows.forEach((row, index) => {
      const missing = requiredFields.filter((field) => !row[field]);
      if (missing.length > 0) {
        errorList.push({
          row: index + 1,
          error: `Missing fields: ${missing.join(", ")}`,
        });
      } else {
        validRows.push(row);
      }
    });

    setData(validRows);
    setErrors(errorList);

    if (validRows.length > 0) {
      toast.success(`${validRows.length} valid records found`);
    }
    if (errorList.length > 0) {
      toast.error(`${errorList.length} rows have errors`);
    }
  };

  const handleUpload = async () => {
    if (data.length === 0) {
      toast.error("No valid data to upload");
      return;
    }

    setProcessing(true);
    try {
      await onUpload(data);
      toast.success(`${data.length} certificates queued for issuance`);
      onClose();
    } catch (error) {
      toast.error(error.message || "Batch upload failed");
    } finally {
      setProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const template = `studentEmail,studentWallet,certificateTitle,courseName,graduationYear,grade,honors
student1@example.com,0x...,Bachelor of Science in Computer Science,Computer Science,2024,First Class,Cum Laude
student2@example.com,,Master of Business Administration,Business Administration,2024,Distinction,`;
    
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "certificate_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Batch Certificate Upload</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            ✕
          </button>
        </div>

        {/* Download Template */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                Download the CSV template and fill in your certificate data. Required fields: studentEmail, certificateTitle, courseName, graduationYear.
              </p>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Download className="w-4 h-4" />
                Download CSV Template
              </button>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload CSV File
          </label>
          <div className="flex items-center gap-3">
            <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg py-8 cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 transition-colors">
              <Upload className="w-6 h-6 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {file ? file.name : "Click to upload CSV"}
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Preview */}
        {data.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Preview ({data.length} records)
            </h3>
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Email</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Title</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Course</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Year</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {data.slice(0, 5).map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{row.studentEmail}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.certificateTitle}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.courseName}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.graduationYear}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 5 && (
                <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 text-center">
                  ... and {data.length - 5} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">
                {errors.length} Error{errors.length > 1 ? "s" : ""} Found
              </h4>
            </div>
            <ul className="text-sm text-red-700 dark:text-red-400 space-y-1 ml-7">
              {errors.slice(0, 5).map((err, i) => (
                <li key={i}>Row {err.row}: {err.error}</li>
              ))}
              {errors.length > 5 && <li>... and {errors.length - 5} more errors</li>}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={data.length === 0 || processing}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {processing ? "Processing..." : `Upload ${data.length} Certificate${data.length !== 1 ? "s" : ""}`}
          </button>
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
