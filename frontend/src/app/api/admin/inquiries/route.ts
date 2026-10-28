import { z } from "zod";
import { requireAdmin, authErrorResponse } from "@/lib/auth/requireAdmin";
import { apiSuccess, apiFail } from "@/lib/api/respond";
import { INQUIRY_STATUS } from "@/lib/inquiries/status";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200; // well under the project's max_rows = 1000

const limitSchema = z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT);

// Postgres timestamptz comes back as e.g. 2026-10-02T18:50:25.123456+00:00.
// Validate strictly because the value is interpolated into a PostgREST filter.
const cursorSchema = z.object({
  s: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$/),
  i: z.uuid(),
});
type Cursor = z.infer<typeof cursorSchema>;

function encodeCursor(row: { submitted_at: string; id: string }): string {
  const cursor: Cursor = { s: row.submitted_at, i: row.id };
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

function decodeCursor(raw: string): Cursor | null {
  try {
    const json = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    const parsed = cursorSchema.safeParse(json);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/**
 * Manual review queue: every inquiry still awaiting a decision, oldest first.
 * No automated pre-filtering — per the current scope, ALL new inquiries land
 * here until a human approves or rejects them.
 *
 * Keyset (cursor) pagination ordered by (submitted_at, id). `id` is the
 * tiebreaker so rows sharing a timestamp still have a stable, total order.
 * Query params: `limit` (1-200, default 50), `cursor` (opaque, from a prior
 * response's `next_cursor`).
 */
export async function GET(request: Request) {
  let supabase;
  try {
    ({ supabase } = await requireAdmin());
  } catch (err) {
    return authErrorResponse(err);
  }

  const params = new URL(request.url).searchParams;

  const limitParsed = limitSchema.safeParse(params.get("limit") ?? undefined);
  if (!limitParsed.success) return apiFail("invalid_query");
  const limit = limitParsed.data;

  const rawCursor = params.get("cursor");
  const cursor = rawCursor ? decodeCursor(rawCursor) : null;
  if (rawCursor && !cursor) return apiFail("invalid_query");

  let query = supabase
    .from("inquiries")
    .select("*")
    .eq("inquiry_status", INQUIRY_STATUS.PendingReview)
    .order("submitted_at", { ascending: true })
    .order("id", { ascending: true })
    // Fetch one extra row to learn whether another page exists
    // without a separate count query.
    .limit(limit + 1);

  if (cursor) {
    // (submitted_at, id) > (cursor.s, cursor.i), expressed for PostgREST.
    query = query.or(
      `submitted_at.gt.${cursor.s},and(submitted_at.eq.${cursor.s},id.gt.${cursor.i})`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("[queue_fetch_failed] Failed to fetch pending_review inquiries", error);
    return apiFail("queue_fetch_failed");
  }

  const hasMore = data.length > limit;
  const inquiries = hasMore ? data.slice(0, limit) : data;
  const last = inquiries[inquiries.length - 1];

  return apiSuccess({
    inquiries,
    has_more: hasMore,
    next_cursor: hasMore && last ? encodeCursor(last) : null,
  });
}