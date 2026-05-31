# WealthSync Frontend

Premium dark-mode responsive Single Page Application (SPA) designed to visualize mutual fund transaction summaries.

Built using **HTML5**, **Vanilla CSS (Glassmorphism & animations)**, and **Vanilla JavaScript** (using modern ES Modules).

## Directory Structure
```
frontend/
├── css/
│   └── style.css       # Custom design tokens, dark theme variables, grid layout
├── js/
│   ├── api.js          # Fetch wrappers mapping date-range filters to port 8001
│   ├── charts.js       # Chart.js abstractions for bar, doughnut, and line visuals
│   └── app.js          # Dashboard controller, UI events, tables & accordion rendering
└── index.html          # Main HTML document and layout grids
```

## Features

1. **Dashboard KPI Strip**: Top widgets showing real-time aggregations (Total Amount Invested, Total NAV Units, Active Funds, Unique Investors).
2. **Interactive Date Picker**: Filter transactions dynamically by start and end dates.
3. **Tabbed Navigation**: Switch between 4 modular views corresponding to API summaries.
4. **Visual Chart Panels**: Rendered dynamically using Chart.js, adapting to date filters:
   - Bar Chart: Top purchases by amount.
   - Doughnut Chart: Asset allocation share per scheme.
   - Horizontal Bar Chart: Investor rankings by capital.
   - Dual Bar Charts: Capital vs. Units comparison per scheme.
5. **Investor Drilldown Accordion**: Expandable scheme cards inside Tab 2 to view details of specific investors.

---

## Running Locally

Because the frontend uses native Javascript ES modules (`import`/`export`), web browsers block these requests when loaded directly via a `file://` URL due to CORS security policies. You should run the frontend using a local HTTP server.

### Option A: Python HTTP Server (Recommended)
1. Open your terminal inside the `frontend/` directory.
2. Run:
   ```bash
   python -m http.server 8080
   ```
3. Open your browser and navigate to **[http://localhost:8080](http://localhost:8080)**.

### Option B: VS Code Live Server
1. Open the project in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` and select **"Open with Live Server"**.

---

## How to Interact with the Dashboard

1. **Configure Connection**: The frontend is pre-configured to connect directly to the deployed backend on Vercel at `https://mutual-fund-backend-hazel.vercel.app/api`. (No local backend server is required to view the data).
2. **Initial Load**: The filters are pre-filled with **May 27, 2025** (the date on which the dataset's transactions took place). Click **Apply Filter** to populate the cards and tables.
3. **Explore Data**: Click on tabs at the top to toggle views. Hover over charts to see exact numbers, currencies, and percentages.
4. **Drill Down**: Go to **Fund-wise Drilldown** (Tab 2) and click on any Mutual Fund row to toggle and expand the list of investors for that fund.
