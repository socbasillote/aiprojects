export function rotatePointAroundCenter({ x, y, centerX, centerY, degrees }) {
  const radians = (degrees * Math.PI) / 180;

  const cos = Math.cos(radians);

  const sin = Math.sin(radians);

  const dx = x - centerX;

  const dy = y - centerY;

  return {
    x: centerX + dx * cos - dy * sin,

    y: centerY + dx * sin + dy * cos,
  };
}
