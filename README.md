# 🚀 Sync Community - Community Governance & Intelligence

[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/sync-community/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/sync-community/actions)
[![E2E Tests](https://github.com/YOUR_USERNAME/sync-community/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/YOUR_USERNAME/sync-community/actions)
[![Security Scan](https://github.com/YOUR_USERNAME/sync-community/actions/workflows/security-tests.yml/badge.svg)](https://github.com/YOUR_USERNAME/sync-community/actions)
[![Load Tests](https://github.com/YOUR_USERNAME/sync-community/actions/workflows/stress-tests.yml/badge.svg)](https://github.com/YOUR_USERNAME/sync-community/actions)

Welcome to the official repository of **Sync Community**, an open-source Governance & Workflow automation platform for modern communities, enterprises, and NGOs. 

Built with a highly scalable, multi-tenant architecture, this platform empowers organizations to manage roles, communications, decision-making, and complex approval workflows natively.

## 🔑 Test Accounts (Seed Data)

The platform comes pre-seeded with test users in the database (`sql_app.db`) to allow immediate testing of different permission levels and Organizations:

| Email | Password | Role / Profile | Organization |
| :--- | :--- | :--- | :--- |
| **admin@comunidade.pt** | `Sync@Sec!2026` | **Global Super Administrator** | All |
| **admin_fenix@comunidade.pt** | `Sync@Sec!2026` | Administrator / Manager | Nova Ordem de Fenix |
| **membro_fenix@comunidade.pt**| `Sync@Sec!2026` | Simple Member | Nova Ordem de Fenix |

*(Use these credentials on the Login screen once the environment is up and running).*

---

## 🏗️ Architecture & Tech Stack

This project is built using a modern, scalable microservices approach:
* **Backend (Core API):** Python (FastAPI) + SQLAlchemy + PostgreSQL (SQLite for local dev fallback).
* **Frontend:** React + TypeScript + Vite + Tailwind CSS.
* **Document Service:** Java (Spring Boot) - Dedicated microservice for heavy document generation and processing.
* **Infrastructure:** Fully Dockerized (`docker-compose`) for seamless deployment anywhere.

---

## 💻 Local Development & Troubleshooting (FAQ)

### Getting Started Locally
To run the entire stack (Database, Backend API, Frontend, and Docs Service) seamlessly:
1. Ensure you have **Docker** and **Docker Compose** installed.
2. Run the following command in the root directory:
   ```bash
   docker-compose up --build -d
   ```
3. The platform will be instantly available at `http://localhost`.

### The `npm run dev` doesn't work!
Remember that the project is divided into dedicated folders. If you only want to run the React Frontend locally (without Docker):
1. Open a terminal in the root directory.
2. Type: `cd frontend`.
3. Type: `npm install` (only needed the first time).
4. Type: `npm run dev`.

---

## 🧪 Comprehensive Testing Suite

This repository is equipped with industry-grade, automated testing pipelines via **GitHub Actions**. Every PR and Push undergoes rigorous validation:

1. **Continuous Integration (CI):** Builds Docker images and verifies code compilation.
2. **End-to-End (E2E) UI Testing (Playwright):** Simulates a real user clicking through all interfaces, submitting forms, and interacting with modals across Desktop and Mobile viewports.
3. **Security & Penetration Testing (OWASP ZAP):** Scans the active API for SQL injections, XSS, and security misconfigurations.
4. **Stress & Performance Testing (k6):** Bombards the API with thousands of concurrent requests to evaluate system latency, time complexity (Big-O degradation), and structural resilience.

Detailed HTML reports and logs for all tests are automatically generated and available for download in the GitHub Actions Artifacts tab.
