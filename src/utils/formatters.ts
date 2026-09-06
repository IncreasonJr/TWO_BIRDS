export function formatGradYear(year: number): string {
  const currentYear = new Date().getFullYear();
  if (year === currentYear) return `'${String(year).slice(-2)} (Senior)`;
  if (year === currentYear + 1) return `'${String(year).slice(-2)} (Junior)`;
  if (year === currentYear + 2) return `'${String(year).slice(-2)} (Sophomore)`;
  if (year === currentYear + 3) return `'${String(year).slice(-2)} (Freshman)`;
  return `'${String(year).slice(-2)}`;
}

export function formatDistance(miles: number): string {
  if (miles < 0.1) return 'On your quad';
  if (miles < 1) return `${(miles * 5280).toFixed(0)} ft away on campus`;
  return `${miles.toFixed(1)} miles away`;
}

export function getZodiacEmoji(sign?: string): string {
  // Returns clean label without emoji characters
  switch (sign?.toLowerCase()) {
    case 'aries': return 'Aries';
    case 'taurus': return 'Taurus';
    case 'gemini': return 'Gemini';
    case 'cancer': return 'Cancer';
    case 'leo': return 'Leo';
    case 'virgo': return 'Virgo';
    case 'libra': return 'Libra';
    case 'scorpio': return 'Scorpio';
    case 'sagittarius': return 'Sagittarius';
    case 'capricorn': return 'Capricorn';
    case 'aquarius': return 'Aquarius';
    case 'pisces': return 'Pisces';
    default: return sign || 'Campus Student';
  }
}
