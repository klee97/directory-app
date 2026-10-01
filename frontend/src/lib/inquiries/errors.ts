export const API_ERRORS = {
  unauthorized: { status: 401, message: "Unauthorized" },
  forbidden: { status: 403, message: "Forbidden" },
  invalid_body: { status: 400, message: "Invalid request body" },
  not_found: { status: 404, message: "Inquiry not found" },
  already_reviewed: { status: 409, message: "Inquiry has already been reviewed" },
  update_failed: { status: 500, message: "Failed to update inquiry" },
  queue_fetch_failed: { status: 500, message: "Failed to fetch queue" },
} as const satisfies Record<string, { status: number; message: string }>;

export type ApiErrorCode = keyof typeof API_ERRORS;