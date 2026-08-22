// Matemática pura del ranking, sin dependencias (testeable sin BD).

/** La puja nueva NUNCA baja: newBid = max(actual, target). */
export function computeNewBid(
  existingCents: number | null | undefined,
  targetCents: number,
): number {
  return Math.max(existingCents ?? 0, targetCents);
}