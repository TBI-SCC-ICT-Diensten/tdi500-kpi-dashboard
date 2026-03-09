# TDI 500 - Contingency KPI Dashboard (Activity 3.4)

## Project Overview
This repository contains the frontend application for Activity 3.4 of the TDI 500 project.The overarching goal of the TDI 500 consortium is to accelerate the installation of (hybrid) heat pumps to 500 per day. 

Specifically, Activity 3.4 focuses on optimizing the "contingentenaanpak" (contingency approach).Instead of evaluating installations individually, this dashboard allows installers and planners to select and deploy systems based on aggregated insights and performance data. By automating the link between the performance datastore and the contingents database, the dashboard provides the necessary Key Performance Indicators (KPIs) to support faster, data-driven decision-making.

## Core Features
* **SPARQL API Integration:** Connects to the Hupie datastore endpoint to retrieve real-time and historical telemetry data.
* **Semantic Data Mapping:** Translates incoming data based on the Heatpump Common Ontology (HCO) and ETSI SAREF standards (e.g., automatically resolving `saref:isMeasuredIn` to correct units like °C or kWh).
* **Automated Contingent Linking:** Filters and maps aggregated heat pump KPIs to specific housing contingents.
* **Decision Support Interface:** Visualizes performance data to advise users on the most suitable installation concepts per contingent.

## Architecture & Tech Stack
* **Frontend Framework:** React 18 with TypeScript (Component-based architecture)
* **Visualization:** ApexCharts (via react-apexcharts)
* **Styling:** Material UI (MUI v5)
* **Data Fetching:** Axios (HTTP client for SPARQL queries)
* **Data Layer:** SPARQL via HTTP POST/GET interacting with the Hupie API
* **Ontology:** Heatpump Common Ontology (HCO) & ETSI SAREF core extensions

## Getting Started

### Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your local machine.

### Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/TBI-SCC-ICT-Diensten/tdi500-kpi-dashboard]
Navigate to the project directory:

Bash
cd tdi500-kpi-dashboard
Install the dependencies:

Bash
npm install
Configure your environment variables (create a .env file based on .env.example and add the Hupie API credentials).

Running the Application
Start the development server:

Bash
npm start
The application will be available at http://localhost:3000.

Note for Assessors: Project planning, Sprint progress, and the Definition of Done (DoD) can be found on the GitHub Projects Scrum Board.
