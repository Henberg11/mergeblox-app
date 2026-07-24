// Color palette per tile value. Deliberately a distinct palette (cool purples/teals)
// rather than the classic 2048 orange scheme, so this reads as its own game.
const PALETTE = {
  2: { bg: "#3A3358", text: "#E8E4F5" },
  4: { bg: "#453D6B", text: "#E8E4F5" },
  8: { bg: "#4F5B9E", text: "#FFFFFF" },
  16: { bg: "#3E7CB1", text: "#FFFFFF" },
  32: { bg: "#2E9CA6", text: "#FFFFFF" },
  64: { bg: "#2FB88A", text: "#FFFFFF" },
  128: { bg: "#6FCF6B", text: "#1B1B1B" },
  256: { bg: "#B7D948", text: "#1B1B1B" },
  512: { bg: "#F4D35E", text: "#1B1B1B" },
  1024: { bg: "#F2A65A", text: "#1B1B1B" },
  2048: { bg: "#F2705A", text: "#FFFFFF" },
  4096: { bg: "#D64550", text: "#FFFFFF" },
};

const FALLBACK = { bg: "#1B1730", text: "#FFFFFF" };

export function getTileColors(value) {
  return PALETTE[value] || FALLBACK;
}

export function fontSizeForValue(value) {
  const digits = String(value).length;
  if (digits <= 2) return 22;
  if (digits === 3) return 18;
  return 15;
}
