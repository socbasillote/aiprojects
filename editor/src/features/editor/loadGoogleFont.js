const loadedFonts = new Set();

export function loadGoogleFont(fontFamily) {
  if (!fontFamily) {
    return;
  }

  if (loadedFonts.has(fontFamily)) {
    return;
  }

  const id = `google-font-${fontFamily.replace(/\s+/g, "-").toLowerCase()}`;

  if (document.getElementById(id)) {
    loadedFonts.add(fontFamily);
    return;
  }

  const link = document.createElement("link");

  link.id = id;

  link.rel = "stylesheet";

  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    fontFamily,
  )}:wght@400;500;600;700&display=swap`;

  document.head.appendChild(link);

  loadedFonts.add(fontFamily);
}
