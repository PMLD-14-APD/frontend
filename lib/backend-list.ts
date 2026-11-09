import "server-only";
import { backendRequest, BackendError } from "./backend";

export async function readBackendList(path: string): Promise<unknown[]> {
  const items: unknown[] = [];
  let total = Infinity;
  while (items.length < total) {
    const separator = path.includes("?") ? "&" : "?";
    const page = await backendRequest(`${path}${separator}limit=200&offset=${items.length}`);
    if (Array.isArray(page)) return page;
    if (!page || typeof page !== "object" || !("items" in page) || !Array.isArray(page.items) ||
      !("total" in page) || typeof page.total !== "number" || !Number.isSafeInteger(page.total) || page.total < 0) {
      throw new BackendError("Respons daftar tidak valid.", 502);
    }
    total = Math.min(total, page.total);
    if (!page.items.length) break;
    items.push(...page.items);
  }
  return items;
}
