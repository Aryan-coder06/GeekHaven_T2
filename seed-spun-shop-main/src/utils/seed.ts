export const ASSIGNMENT_SEED=import.meta.env.VITE_ASSIGNMENT_SEED || "FRONT25-XXXX";
export const ROLLNO=import.meta.env.VITE_ROLLNO
// Generate hash from seed
export function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Extract number from seed for calculations
export function getSeedNumber(seed: string = ASSIGNMENT_SEED): number {
  const numbers = seed.match(/\d+/g);
  return numbers ? parseInt(numbers.join(''), 10) : 25;
}

export function calculatePlatformFee(subtotal: number, seed: string = ASSIGNMENT_SEED): number {
  const seedNum = getSeedNumber(seed);
  const feePercentage = seedNum % 10;
  return (subtotal * feePercentage) / 100;
}
export function generateSeedColor(seed: string = ASSIGNMENT_SEED): { h: number, s: number, l: number } {
  const hash = hashSeed(seed);
  const hue = hash % 360;
  const saturation = 70 + (hash % 30); 
  const lightness = 45 + (hash % 20); 
  
  return { h: hue, s: saturation, l: lightness };
}

export function generateChecksum(id: string, seed: string = ASSIGNMENT_SEED): string {
  const seedNum = getSeedNumber(seed);
  const idNum = parseInt(id.replace(/\D/g, ''), 10) || 0;
  const checksum = (idNum + seedNum) % 10;
  return checksum.toString();
}

export function applySeedTheme(seed: string = ASSIGNMENT_SEED): void {
  const { h, s, l } = generateSeedColor(seed);
  
  const root = document.documentElement;
  root.style.setProperty('--primary', `${h} ${s}% ${l}%`);
  root.style.setProperty('--primary-glow', `${h} ${s}% ${Math.min(l + 10, 90)}%`);
  root.style.setProperty('--primary-dark', `${h} ${s}% ${Math.max(l - 10, 20)}%`);
  root.style.setProperty('--ring', `${h} ${s}% ${l}%`);
  root.style.setProperty('--sidebar-primary', `${h} ${s}% ${l}%`);
  root.style.setProperty('--sidebar-ring', `${h} ${s}% ${Math.min(l + 10, 90)}%`);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
export function generateProductId(baseId: string, seed: string = ASSIGNMENT_SEED): string {
  const checksum = generateChecksum(baseId, seed);
  return `${baseId}-${checksum}`;
}