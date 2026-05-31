/**
 * charts.js — Chart.js helpers for the dashboard
 */

const CHART_DEFAULTS = {
  font: { family: "'Inter', sans-serif" },
  color: "#94a3b8",
};

Chart.defaults.font.family = CHART_DEFAULTS.font.family;
Chart.defaults.color       = CHART_DEFAULTS.color;

const PALETTE = [
  "#00d4aa", "#3d8bff", "#8b5cf6", "#f59e0b",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316",
];

const GRID_COLOR  = "rgba(255,255,255,0.05)";
const TICK_COLOR  = "#4a5568";

// Track chart instances to destroy before re-render
const _charts = {};

function destroyChart(id) {
  if (_charts[id]) {
    _charts[id].destroy();
    delete _charts[id];
  }
}

// ── Bar Chart ────────────────────────────────────────────────────
export function renderBarChart(canvasId, labels, datasets, options = {}) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  _charts[canvasId] = new Chart(ctx, {
    type: "bar",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 600, easing: "easeOutQuart" },
      plugins: {
        legend: {
          display: datasets.length > 1,
          labels: { padding: 16, usePointStyle: true, pointStyleWidth: 8 },
        },
        tooltip: {
          backgroundColor: "#131d35",
          borderColor: "rgba(0,212,170,0.3)",
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: (ctx) => {
              const val = ctx.raw;
              if (options.currency) return ` ₹${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
              return ` ${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: GRID_COLOR },
          ticks: { color: TICK_COLOR, maxRotation: 30 },
        },
        y: {
          grid: { color: GRID_COLOR },
          ticks: {
            color: TICK_COLOR,
            callback: (v) =>
              options.currency
                ? `₹${Number(v).toLocaleString("en-IN")}`
                : Number(v).toLocaleString("en-IN"),
          },
        },
      },
      ...options.extra,
    },
  });
}

// ── Horizontal Bar Chart ─────────────────────────────────────────
export function renderHorizontalBarChart(canvasId, labels, data, label, color, options = {}) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  _charts[canvasId] = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label,
        data,
        backgroundColor: color || PALETTE[0],
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 600, easing: "easeOutQuart" },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#131d35",
          borderColor: "rgba(0,212,170,0.3)",
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: (ctx) => {
              const val = ctx.raw;
              if (options.currency) return ` ₹${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
              return ` ${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: GRID_COLOR },
          ticks: {
            color: TICK_COLOR,
            callback: (v) =>
              options.currency
                ? `₹${Number(v / 1000).toLocaleString("en-IN")}K`
                : Number(v).toLocaleString("en-IN"),
          },
        },
        y: { grid: { display: false }, ticks: { color: TICK_COLOR } },
      },
    },
  });
}

// ── Doughnut Chart ───────────────────────────────────────────────
export function renderDoughnutChart(canvasId, labels, data, options = {}) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  _charts[canvasId] = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: PALETTE.slice(0, labels.length),
        borderColor: "#0a0e1a",
        borderWidth: 3,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 600, easing: "easeOutQuart" },
      cutout: "68%",
      plugins: {
        legend: {
          position: "right",
          labels: {
            padding: 14,
            usePointStyle: true,
            pointStyleWidth: 10,
            generateLabels: (chart) =>
              chart.data.labels.map((label, i) => ({
                text: label.length > 25 ? label.slice(0, 25) + "…" : label,
                fillStyle: PALETTE[i % PALETTE.length],
                hidden: false,
                index: i,
              })),
          },
        },
        tooltip: {
          backgroundColor: "#131d35",
          borderColor: "rgba(0,212,170,0.3)",
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: (ctx) => {
              const val  = ctx.raw;
              const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
              const pct  = ((val / total) * 100).toFixed(1);
              if (options.currency)
                return ` ₹${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })} (${pct}%)`;
              return ` ${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })} (${pct}%)`;
            },
          },
        },
      },
    },
  });
}

export { PALETTE };
