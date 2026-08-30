import { toPng } from "html-to-image";
import jsPDF from "jspdf";

import { getPaperDimensions } from "./paperUtils";

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

async function renderPage(page, dimensions) {
  const width = Math.round(dimensions.width * (96 / 25.4));

  const height = Math.round(dimensions.height * (96 / 25.4));

  return toPng(page, {
    pixelRatio: 2,

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

    const link = document.createElement("a");

    link.download =
      pages.length === 1
        ? `${filename}.png`
        : `${filename}-page-${index + 1}.png`;

    link.href = dataUrl;

    document.body.appendChild(link);

    link.click();

    link.remove();

    await new Promise((resolve) => setTimeout(resolve, 150));
  }
}

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
