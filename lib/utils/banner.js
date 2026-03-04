const chalk = require('chalk');

// ── ASCII art ──────────────────────────────────────────────────────────────

const LINES = [
  '   ______   __     ',
  '  / ____/  / /__   ',
  ' / /      / //_/   ',
  '/ /___   / ,<      ',
  '\\____/  /_/|_|    ',
];

// ── Color helpers ──────────────────────────────────────────────────────────

/**
 * Convert HSL (h: 0–360, s: 0–100, l: 0–100) to [r, g, b] (0–255).
 * Standard algorithm — no dependencies.
 */
function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

// ── Banner ─────────────────────────────────────────────────────────────────

function printBanner() {
  const maxLen = Math.max(...LINES.map(l => l.length));

  console.log('');
  LINES.forEach(line => {
    const colored = line.split('').map((char, i) => {
      if (char === ' ') return ' ';
      // Cycle hues 20–290°: warm red → yellow → green → cyan → blue
      const hue = (i / maxLen) * 270 + 20;
      const [r, g, b] = hslToRgb(hue, 100, 65);
      return chalk.rgb(r, g, b)(char);
    }).join('');
    console.log(colored);
  });
  console.log('');
}

module.exports = { printBanner, hslToRgb };
