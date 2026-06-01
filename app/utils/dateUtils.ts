/**
 * Extracts YYYY-MM-DD from an ISO string WITHOUT timezone shifting.
 * Supabase returns '2023-10-05T14:30:00Z' or '2023-10-05T14:30:00+00:00'.
 * Using new Date() + getDate() causes off-by-one errors when the device
 * timezone differs from UTC. This function simply reads the first 10 chars.
 */
export function toISODate(input: string | Date): string {
  if (typeof input === 'string') {
    // Take the first 10 characters: YYYY-MM-DD
    return input.slice(0, 10);
  }
  // For Date objects, use UTC methods to avoid local timezone issues
  return `${input.getUTCFullYear()}-${String(input.getUTCMonth() + 1).padStart(2, '0')}-${String(input.getUTCDate()).padStart(2, '0')}`;
}
