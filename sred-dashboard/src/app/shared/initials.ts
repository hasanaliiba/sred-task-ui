/**
 * Up to two uppercase initials from a display name, for avatar chips.
 * Multi-word → first letter of the first two words ("Anne User" → "AU");
 * single word → its first two letters ("Afiniti" → "AF"). Empty → "?".
 */
export function initials(name: string): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return '?';
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}
