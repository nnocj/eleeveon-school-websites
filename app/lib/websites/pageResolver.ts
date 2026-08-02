/**
 * Backward-compatible re-export.
 * The canonical resolver now lives in api.ts and operates on PublicWebsitePayload.
 */
export { resolveWebsitePage } from "./api";
export type { WebsiteResolvedPage } from "./types";
