import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Generate PDF from certificate template
 * @param {string} elementId - ID of the certificate template element
 * @param {string} filename - Output PDF filename
 */
export async function generateCertificatePDF(elementId, filename) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("Certificate template element not found");
  }

  // Temporarily show the element if hidden
  const originalDisplay = element.style.display;
  element.style.display = "block";

  try {
    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    // Restore original display
    element.style.display = originalDisplay;

    // Calculate PDF dimensions (A4 landscape)
    const imgWidth = 297; // A4 width in mm (landscape)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? "portrait" : "landscape",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    // Save PDF
    pdf.save(filename);
  } catch (error) {
    element.style.display = originalDisplay;
    throw error;
  }
}
