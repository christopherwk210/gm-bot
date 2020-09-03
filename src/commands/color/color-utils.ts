// Some of these functions were taken from:
// https://gist.github.com/mjackson/5311256

export function rgbToHsv(r: number, g: number, b: number) {
  r /= 255, g /= 255, b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const v = max;
  const d = max - min;

  let h: number;
  let s: number;

  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [
    Math.round(h * 255),
    Math.round(s * 255),
    Math.round(v * 255)
  ];
}

export function hsvToRgb(h: number, s: number, v: number) {
  let r: number;
  let g: number;
  let b: number;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }

  return [ r * 255, g * 255, b * 255 ];
}

export function hexToRgb(hex: string) {
  return hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1).match(/.{2}/g)
    .map(x => parseInt(x, 16));
}

export function parseHex(hex: string) {
  return {
    hex,
    r: hex.slice(1, 3),
    g: hex.slice(3, 5),
    b: hex.slice(5, 7)
  };
}

function componentToHex(c: number) {
  const hex = c.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

export function rgbToHex(r: number, g: number, b: number) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
