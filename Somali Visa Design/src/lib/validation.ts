export const isEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

// Day-aware: June 20 → Dec 19 = 5 months (day hasn't passed), not 6.
export const monthsBetween = (a: Date, b: Date) =>
  (b.getFullYear() - a.getFullYear()) * 12 +
  (b.getMonth() - a.getMonth()) +
  (b.getDate() >= a.getDate() ? 0 : -1);

export const todayStr = () => new Date().toISOString().slice(0, 10);

export const isPassportExpiryValid = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const exp = new Date(dateStr);
  if (isNaN(exp.getTime())) return false;
  return monthsBetween(new Date(), exp) >= 6;
};
