import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import JSZip from "jszip";

import { getPaperDimensions } from "./paperUtils";

const PIXEL_RATIO = 2;
const MM_TO_PX = 96 / 25.4;

async function waitForRender() {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  await new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

function getPageElements(previewElement) {
  if (!previewElement) {
    throw new Error("Paper preview is not available.");
  }

  return Array.from(previewElement.querySelectorAll(".paper-page"));
}

function getPagePixelDimensions(dimensions) {
  return {
    width: Math.round(dimensions.width * MM_TO_PX),
    height: Math.round(dimensions.height * MM_TO_PX),
  };
}

async function renderPage(page, dimensions) {
  const { width, height } = getPagePixelDimensions(dimensions);

  return toPng(page, {
    pixelRatio: PIXEL_RATIO,

    cacheBust: true,

    backgroundColor: "#ffffff",

    width,
    height,

    style: {
      width: `${width}px`,
      height: `${height}px`,

      margin: "0",

      transform: "none",

      position: "static",

      left: "0",
      top: "0",

      boxSizing: "border-box",
    },
  });
}

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");

  link.download = filename;
  link.href = dataUrl;

  document.body.appendChild(link);

  link.click();

  link.remove();
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);

    image.onerror = () => {
      reject(new Error("Unable to load an exported paper page."));
    };

    image.src = dataUrl;
  });
}

/*
 * Export each paper page as an individual PNG.
 */
export async function exportPaperAsPng({
  previewElement,
  pageSize,
  orientation,
  filename = "assessment",
}) {
  await waitForRender();

  const pages = getPageElements(previewElement);

  if (!pages.length) {
    throw new Error("No paper pages are available for export.");
  }

  const dimensions = getPaperDimensions(pageSize, orientation);

  for (let index = 0; index < pages.length; index += 1) {
    const dataUrl = await renderPage(pages[index], dimensions);

    downloadDataUrl(
      dataUrl,
      pages.length === 1
        ? `${filename}.png`
        : `${filename}-page-${index + 1}.png`,
    );

    /*
     * Give the browser a moment between
     * multiple download requests.
     */
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
}

/*
 * Export all paper pages as one vertically
 * combined PNG.
 *
 * Page 1
 * Page 2
 * Page 3
 * ...
 */
export async function exportPaperAsPngZip({
  previewElement,
  pageSize,
  orientation,
  filename = "assessment",
}) {
  await waitForRender();

  const pages = getPageElements(previewElement);

  if (!pages.length) {
    throw new Error("No paper pages are available for export.");
  }

  const dimensions = getPaperDimensions(pageSize, orientation);

  const zip = new JSZip();

  for (let index = 0; index < pages.length; index += 1) {
    const dataUrl = await renderPage(pages[index], dimensions);

    /*
     * Remove:
     *
     * data:image/png;base64,
     *
     * because JSZip expects the actual
     * base64 image data.
     */
    const base64Data = dataUrl.split(",")[1];

    zip.file(`${filename}-page-${index + 1}.png`, base64Data, {
      base64: true,
    });
  }

  /*
   * Generate the ZIP file.
   */
  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: 6,
    },
  });

  /*
   * Download the ZIP.
   */
  const url = URL.createObjectURL(zipBlob);

  const link = document.createElement("a");

  link.href = url;
  link.download = `${filename}-pages.zip`;

  document.body.appendChild(link);

  link.click();

  link.remove();

  /*
   * Give the browser time to release
   * the object URL.
   */
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
/*
 * Export the complete paper as a multi-page PDF.
 */
export async function exportPaperAsPdf({
  previewElement,
  pageSize,
  orientation,
  filename = "assessment",
}) {
  await waitForRender();

  const pages = getPageElements(previewElement);

  if (!pages.length) {
    throw new Error("No paper pages are available for export.");
  }

  const dimensions = getPaperDimensions(pageSize, orientation);

  const pdfOrientation = orientation === "landscape" ? "landscape" : "portrait";

  const pdf = new jsPDF({
    orientation: pdfOrientation,

    unit: "mm",

    format: [dimensions.width, dimensions.height],

    compress: true,
  });

  for (let index = 0; index < pages.length; index += 1) {
    const dataUrl = await renderPage(pages[index], dimensions);

    if (index > 0) {
      pdf.addPage([dimensions.width, dimensions.height], pdfOrientation);
    }

    pdf.addImage(
      dataUrl,
      "PNG",
      0,
      0,
      dimensions.width,
      dimensions.height,
      undefined,
      "FAST",
    );
  }

  pdf.save(`${filename}.pdf`);
}
