import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Generate and download a PDF certificate
 * @param {string} elementId - ID of the HTML element to convert to PDF
 * @param {string} filename - Name of the PDF file (without extension)
 * @param {string} certificateId - Certificate ID to embed as text in PDF
 */
export async function downloadCertificateAsPDF(elementId, filename, certificateId = null) {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error("Certificate element not found");
    }

    // Show loading state
    const originalContent = element.innerHTML;
    
    // Capture the element as canvas with high quality
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? "portrait" : "landscape",
      unit: "mm",
      format: "a4",
    });

    // Add image to PDF
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    // Add certificate ID as invisible text for verification
    if (certificateId) {
      pdf.setFontSize(1); // Very small font
      pdf.setTextColor(255, 255, 255); // White text (invisible)
      pdf.text(`CERTIFICATE_ID:${certificateId}`, 0, 0);
    }

    // Save PDF
    pdf.save(`${filename}.pdf`);

    return { success: true };
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  }
}

/**
 * Generate PDF blob for upload verification
 * @param {string} elementId - ID of the HTML element to convert to PDF
 * @returns {Promise<Blob>} PDF blob
 */
export async function generateCertificatePDFBlob(elementId) {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error("Certificate element not found");
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? "portrait" : "landscape",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    // Return as blob instead of downloading
    return pdf.output("blob");
  } catch (error) {
    console.error("PDF blob generation error:", error);
    throw error;
  }
}
