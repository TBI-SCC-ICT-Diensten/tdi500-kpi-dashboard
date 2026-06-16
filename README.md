# TDI 500 - Contingency KPI Dashboard

## Project Overview
This repository contains the frontend application for Activity 3.4 of the TDI 500 project.The overarching goal of the TDI 500 consortium is to accelerate the installation of (hybrid) heat pumps to 500 per day. 

Specifically, Activity 3.4 focuses on optimizing the "contingentenaanpak" (contingency approach).Instead of evaluating installations individually, this dashboard allows installers and planners to select and deploy systems based on aggregated insights and performance data. By automating the link between the performance datastore and the contingents database, the dashboard provides the necessary Key Performance Indicators (KPIs) to support faster, data-driven decision-making.

## Core Features
* **SPARQL API Integration:** Connects to the Hupie datastore endpoint to retrieve real-time and historical telemetry data.
* **Semantic Data Mapping:** Translates incoming data based on the Heatpump Common Ontology (HCO) and ETSI SAREF standards (e.g., automatically resolving `saref:isMeasuredIn` to correct units like °C or kWh).
* **Automated Contingent Linking:** Filters and maps aggregated heat pump KPIs to specific housing contingents.
* **Decision Support Interface:** Visualizes performance data to advise users on the most suitable installation concepts per contingent.

## Architecture & Tech Stack
* **Frontend Framework:** React 18 with TypeScript in strict mode (Component-based architecture)
* **Routing:** React Router v6 (`/`, `/contingent/:id`, `/about`)
* **Styling:** Material UI (MUI v5) with a custom project theme
* **Visualization:** ApexCharts (via react-apexcharts)
* **Data Fetching:** Axios (HTTP client for SPARQL queries)
* **Data Layer:** SPARQL via HTTP POST/GET interacting with the Hupie API
* **State Management:** Custom React hook (`useDashboardData`) with Context API
* **Ontology:** Heatpump Common Ontology (HCO) & ETSI SAREF core extensions
* **Testing:** Vitest (automated unit tests) + manual functional tests
* **Error Handling:** React ErrorBoundary with fallback UI

Architecture diagrams (component, sequence, routing, and UML class) are available in [`docs/diagrams/`](docs/diagrams/).

## Project Structure
```
src/
  config/                         # Centralized environment configuration
  theme/                          # Custom MUI theme
  types/                          # TypeScript interfaces (API, heatpump, units, decisions)
  services/                       # Business logic (API client, data mapper, aggregator, scoring)
  hooks/                          # Custom React hooks (useDashboardData)
  context/                        # React Context providers
  components/
    common/                       # Reusable UI (ErrorBoundary, LoadingSpinner, EmptyState)
    layout/                       # App shell (Header, Sidebar, Footer, MainLayout)
    dashboard/                    # Main dashboard page and panels
    detail/                       # Contingent detail page
    about/                        # Project info page
    charts/                       # ApexCharts chart components
  pages/                          # 404 and other standalone pages
  __tests__/                      # Vitest unit tests
```
## Privacy, Security & Ethics
* **Privacy:** The dashboard works with anonymized and aggregated data only. No individual household addresses or personally identifiable information is displayed.
* **Security:** Hupie API credentials are stored in environment variables (`.env`), never committed to the repository. All API communication uses HTTPS.
* **Ethics:** KPI visualizations are designed to be honest — bar charts start at zero, axes are clearly labeled with units, and no data is cherry-picked or misleadingly scaled.

## Getting Started

### Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your local machine.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/TBI-SCC-ICT-Diensten/tdi500-kpi-dashboard.git
   ```
2. Navigate to the project directory:
   ```bash
   cd tdi500-kpi-dashboard
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Configure your environment variables:
   ```bash
   cp .env.example .env
   ```
   Then fill in your Hupie API credentials in the `.env` file.

### Running the Application
Start the development server:
```bash
npm start
```
The application will be available at **http://localhost:3000**.

### Running Tests
Run the automated unit tests:
```bash
npm run test
```
