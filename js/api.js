/**
 * api.js — Fetch wrappers for all 4 backend endpoints
 */

const BASE_URL = "https://mutual-fund-backend-hazel.vercel.app/api";

/**
 * Build a query string from optional date range params.
 * @param {string|null} startDate
 * @param {string|null} endDate
 * @returns {string}
 */
function buildQuery(startDate, endDate) {
  const params = new URLSearchParams();
  if (startDate) params.set("start_date", startDate);
  if (endDate)   params.set("end_date",   endDate);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Generic fetch with error handling.
 */
async function apiFetch(url) {
  const response = await fetch(url);
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }
  return response.json();
}

// ── Endpoint 1: Investor-wise Purchase Summary ───────────────────
export async function fetchInvestorPurchaseSummary(startDate, endDate) {
  return apiFetch(`${BASE_URL}/investor-purchase-summary${buildQuery(startDate, endDate)}`);
}

// ── Endpoint 2: Fund-wise Summary per Investor ───────────────────
export async function fetchFundWiseSummary(startDate, endDate) {
  return apiFetch(`${BASE_URL}/fund-wise-summary${buildQuery(startDate, endDate)}`);
}

// ── Endpoint 3: Investor List with Purchase Details ──────────────
export async function fetchInvestorList(startDate, endDate) {
  return apiFetch(`${BASE_URL}/investor-list${buildQuery(startDate, endDate)}`);
}

// ── Endpoint 4: Mutual Fund Summary ─────────────────────────────
export async function fetchFundSummary(startDate, endDate) {
  return apiFetch(`${BASE_URL}/fund-summary${buildQuery(startDate, endDate)}`);
}
