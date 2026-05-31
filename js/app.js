/**
 * app.js — Main dashboard controller
 * Binds UI, calls APIs, renders tables and charts.
 */

import {
  fetchInvestorPurchaseSummary,
  fetchFundWiseSummary,
  fetchInvestorList,
  fetchFundSummary,
} from "./api.js";

import {
  renderBarChart,
  renderHorizontalBarChart,
  renderDoughnutChart,
  PALETTE,
} from "./charts.js";

// ── Helpers ──────────────────────────────────────────────────────

const fmt  = (n) => `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtN = (n) => Number(n).toLocaleString("en-IN", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
const fmtNav = (n) => `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
const abbr = (s, max = 28) => s && s.length > max ? s.slice(0, max) + "…" : s;

function schemeBadgeClass(type) {
  const t = (type || "").toLowerCase();
  if (t.includes("equity")) return "equity";
  if (t.includes("gold"))   return "gold";
  if (t.includes("liquid")) return "liquid";
  if (t.includes("index"))  return "index";
  return "default";
}

function showLoading(show) {
  document.getElementById("loadingOverlay").classList.toggle("visible", show);
}

function showToast(msg, icon = "✅") {
  const toast = document.getElementById("toast");
  toast.querySelector(".toast-icon").textContent = icon;
  toast.querySelector(".toast-msg").textContent  = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function emptyState(msg = "No data available for the selected date range.") {
  return `<div class="empty-state">
    <div class="empty-icon">📭</div>
    <div class="empty-text">${msg}</div>
  </div>`;
}

// ── Tab Navigation ───────────────────────────────────────────────
function initTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const panels  = document.querySelectorAll(".tab-panel");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      panels.forEach((p)  => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });
}

// ── KPI Strip ────────────────────────────────────────────────────
function updateKPIs(fundSummary, investorList) {
  const totalAmt  = fundSummary.grand_total_amount  || 0;
  const totalUnits= fundSummary.grand_total_units   || 0;
  const totalFunds= fundSummary.total_funds         || 0;
  const totalInv  = investorList.total_investors    || 0;

  document.getElementById("kpiTotalAmount").textContent   = fmt(totalAmt);
  document.getElementById("kpiTotalUnits").textContent    = fmtN(totalUnits);
  document.getElementById("kpiTotalFunds").textContent    = totalFunds;
  document.getElementById("kpiTotalInvestors").textContent= totalInv;
}

// ═══════════════════════════════════════════════════════════════════
// TAB 1 — Investor-wise Purchase Summary
// ═══════════════════════════════════════════════════════════════════
function renderTab1(data) {
  const tbody = document.getElementById("tab1TableBody");
  const badge = document.getElementById("tab1Badge");

  if (!data || !data.data || data.data.length === 0) {
    document.getElementById("tab1TableWrap").innerHTML = emptyState();
    badge.textContent = "0";
    return;
  }

  badge.textContent = data.total_records;

  const rows = data.data.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${r.investor_name}</td>
      <td><span class="pan-text">${r.pan}</span></td>
      <td title="${r.mutual_fund}">${abbr(r.mutual_fund, 38)}</td>
      <td><span class="scheme-badge ${schemeBadgeClass(r.scheme_type)}">${r.scheme_type}</span></td>
      <td class="amount">${fmt(r.total_amount)}</td>
      <td class="units">${fmtN(r.total_units)}</td>
      <td>${r.transaction_count}</td>
    </tr>
  `).join("");

  tbody.innerHTML = rows;

  // Chart: top investors by total amount
  const top = [...data.data]
    .sort((a, b) => b.total_amount - a.total_amount)
    .slice(0, 10);

  renderBarChart(
    "tab1Chart",
    top.map((r) => abbr(r.investor_name, 12)),
    [{
      label: "Amount (₹)",
      data: top.map((r) => r.total_amount),
      backgroundColor: PALETTE.map((c) => c + "cc"),
      borderColor: PALETTE,
      borderWidth: 1.5,
      borderRadius: 6,
    }],
    { currency: true }
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2 — Fund-wise Summary per Investor
// ═══════════════════════════════════════════════════════════════════
function renderTab2(data) {
  const container = document.getElementById("tab2Accordion");
  const badge = document.getElementById("tab2Badge");

  if (!data || !data.data || data.data.length === 0) {
    container.innerHTML = emptyState();
    badge.textContent = "0";
    return;
  }

  badge.textContent = data.total_funds;

  container.innerHTML = data.data.map((fund, fi) => `
    <div class="accordion-item" id="acc-${fi}">
      <div class="accordion-header" onclick="toggleAccordion(${fi})">
        <span class="accordion-fund-name" title="${fund.mutual_fund}">${abbr(fund.mutual_fund, 50)}</span>
        <div class="accordion-meta">
          <span class="scheme-badge ${schemeBadgeClass(fund.scheme_type)}">${fund.scheme_type}</span>
          <span>Investors: <span class="highlight">${fund.investor_count}</span></span>
          <span>Total: <span class="highlight">${fmt(fund.total_amount)}</span></span>
          <span>Units: <span class="highlight">${fmtN(fund.total_units)}</span></span>
        </div>
        <span class="accordion-arrow">▼</span>
      </div>
      <div class="accordion-body">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Investor Name</th>
              <th>PAN</th>
              <th>Amount (₹)</th>
              <th>Units</th>
              <th>Txns</th>
            </tr>
          </thead>
          <tbody>
            ${fund.investors.map((inv, ii) => `
              <tr>
                <td>${ii + 1}</td>
                <td>${inv.investor_name}</td>
                <td><span class="pan-text">${inv.pan}</span></td>
                <td class="amount">${fmt(inv.amount)}</td>
                <td class="units">${fmtN(inv.units)}</td>
                <td>${inv.transaction_count}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `).join("");

  // Chart: fund-wise total amount doughnut
  renderDoughnutChart(
    "tab2Chart",
    data.data.map((f) => abbr(f.mutual_fund, 30)),
    data.data.map((f) => f.total_amount),
    { currency: true }
  );
}

// Global toggle for accordion (needed since onclick is inline)
window.toggleAccordion = function(idx) {
  const item = document.getElementById(`acc-${idx}`);
  item.classList.toggle("open");
};

// ═══════════════════════════════════════════════════════════════════
// TAB 3 — Investor List
// ═══════════════════════════════════════════════════════════════════
function renderTab3(data) {
  const tbody = document.getElementById("tab3TableBody");
  const badge = document.getElementById("tab3Badge");

  if (!data || !data.data || data.data.length === 0) {
    document.getElementById("tab3TableWrap").innerHTML = emptyState();
    badge.textContent = "0";
    return;
  }

  badge.textContent = data.total_investors;

  tbody.innerHTML = data.data.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${r.investor_name}</td>
      <td><span class="pan-text">${r.pan}</span></td>
      <td class="amount">${fmt(r.total_amount_invested)}</td>
      <td class="units">${fmtN(r.total_units_purchased)}</td>
      <td>${r.funds_invested_in}</td>
      <td>${r.transaction_count}</td>
    </tr>
  `).join("");

  // Chart: investor total investment horizontal bar
  renderHorizontalBarChart(
    "tab3Chart",
    data.data.map((r) => abbr(r.investor_name, 18)),
    data.data.map((r) => r.total_amount_invested),
    "Total Invested (₹)",
    PALETTE[0],
    { currency: true }
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 4 — Mutual Fund Summary
// ═══════════════════════════════════════════════════════════════════
function renderTab4(data) {
  const tbody = document.getElementById("tab4TableBody");
  const badge = document.getElementById("tab4Badge");
  const grandTotal = document.getElementById("tab4GrandTotal");
  const grandUnits = document.getElementById("tab4GrandUnits");

  if (!data || !data.data || data.data.length === 0) {
    document.getElementById("tab4TableWrap").innerHTML = emptyState();
    badge.textContent = "0";
    return;
  }

  badge.textContent = data.total_funds;
  grandTotal.textContent = fmt(data.grand_total_amount);
  grandUnits.textContent = fmtN(data.grand_total_units);

  tbody.innerHTML = data.data.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td title="${r.mutual_fund}">${abbr(r.mutual_fund, 40)}</td>
      <td><span class="scheme-badge ${schemeBadgeClass(r.scheme_type)}">${r.scheme_type}</span></td>
      <td class="amount">${fmt(r.total_amount)}</td>
      <td class="units">${fmtN(r.total_units)}</td>
      <td class="nav">${fmtNav(r.avg_nav_price)}</td>
      <td>${r.investor_count}</td>
      <td>${r.transaction_count}</td>
    </tr>
  `).join("");

  // Chart: grouped bar — amount vs units per fund
  const labels = data.data.map((r) => abbr(r.mutual_fund, 18));
  renderBarChart(
    "tab4ChartAmount",
    labels,
    [{
      label: "Total Amount (₹)",
      data: data.data.map((r) => r.total_amount),
      backgroundColor: PALETTE[0] + "bb",
      borderColor: PALETTE[0],
      borderWidth: 1.5,
      borderRadius: 6,
    }],
    { currency: true }
  );

  renderBarChart(
    "tab4ChartUnits",
    labels,
    [{
      label: "Total Units",
      data: data.data.map((r) => r.total_units),
      backgroundColor: PALETTE[1] + "bb",
      borderColor: PALETTE[1],
      borderWidth: 1.5,
      borderRadius: 6,
    }],
    { currency: false }
  );
}

// ── Main Loader ──────────────────────────────────────────────────
async function loadDashboard() {
  const startDate = document.getElementById("startDate").value || null;
  const endDate   = document.getElementById("endDate").value   || null;

  showLoading(true);
  try {
    const [invPurchase, fundWise, invList, fundSum] = await Promise.all([
      fetchInvestorPurchaseSummary(startDate, endDate),
      fetchFundWiseSummary(startDate, endDate),
      fetchInvestorList(startDate, endDate),
      fetchFundSummary(startDate, endDate),
    ]);

    updateKPIs(fundSum, invList);
    renderTab1(invPurchase);
    renderTab2(fundWise);
    renderTab3(invList);
    renderTab4(fundSum);

    const range = startDate || endDate
      ? `${startDate || "any"} → ${endDate || "any"}`
      : "all dates";
    showToast(`Dashboard updated for ${range}`, "📊");
  } catch (err) {
    console.error(err);
    showToast("Failed to load data. Is the backend running?", "❌");
  } finally {
    showLoading(false);
  }
}

// ── Reset ────────────────────────────────────────────────────────
function resetFilters() {
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value   = "";
  loadDashboard();
}

// ── Init ─────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  document.getElementById("applyFilter").addEventListener("click",  loadDashboard);
  document.getElementById("resetFilter").addEventListener("click",  resetFilters);
  loadDashboard();
});
