import { redirect } from "next/navigation";
import { requireAdmin, UnauthorizedError, ForbiddenError, type AdminAuthResult } from "./requireAdmin";

/**
 * For Server Components (pages, layouts) — NOT for Route Handlers.
 *
 * Mirrors the redirect targets `useRequireAdmin` uses client-side
 * (`/login?redirectTo=...` when signed out, `/unauthorized` when signed in
 * but not an admin), but runs the check on the server before any markup is
 * sent, so there's no loading-spinner flash and no window where an
 * unauthorized user briefly sees the page.
 *
 * `redirect()` works by throwing internally — Next.js catches it, so don't
 * wrap the call site in a try/catch that would swallow it.
 */
export async function requireAdminForPage(currentPath: string): Promise<AdminAuthResult> {
  try {
    return await requireAdmin();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      redirect(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
    }
    if (err instanceof ForbiddenError) {
      redirect("/unauthorized");
    }
    throw err;
  }
}