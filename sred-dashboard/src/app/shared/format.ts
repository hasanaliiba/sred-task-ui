/** Whole-dollar USD, e.g. 12345.6 → "$12,346". */
const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
export const money = (n: number): string => USD.format(n);

/** Whole hours with a unit, e.g. 4600 → "4,600 h". */
export const hoursLabel = (n: number): string => `${Math.round(n).toLocaleString()} h`;
