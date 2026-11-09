export const LOCATION_NAME_MAX = 100;

export function validLocationId(id: unknown): id is string {
  return typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function locationName(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const name = input.trim();
  return name.length > 0 && Array.from(name).length <= LOCATION_NAME_MAX ? name : null;
}
