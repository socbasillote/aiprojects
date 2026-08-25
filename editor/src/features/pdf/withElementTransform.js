export function withElementTransform(pdf, element, render) {
  // Rotation temporarily disabled.
  // Keep the PDF pipeline stable while we
  // implement rotation separately.
  render();
}
