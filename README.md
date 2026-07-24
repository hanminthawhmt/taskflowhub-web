# Task Flow Hub — Task Management SaaS Frontend 🚀

[![Live Demo](https://img.shields.io/badge/Live%20Demo-https%3A%2F%2Ftaskflowhub--seven.vercel.app-blue?style=for-the-badge&logo=vercel)](https://taskflowhub-seven.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

**Task Flow Hub** is a modern, high-performance React + TypeScript web frontend for an Enterprise Task Management SaaS platform. Built with rich aesthetics, dark mode support, fluid micro-animations, and full backend API integration.

🔗 **Live Production URL**: [https://taskflowhub-seven.vercel.app/](https://taskflowhub-seven.vercel.app/)  
📡 **Backend API Service**: `https://taskflowhub-935i.onrender.com/api/v1`

---

## ✨ Key Features

### 🏢 Workspace & Multi-Company Architecture
- **Company Switcher**: Switch between corporate workspaces dynamically.
- **Role-Based Access Control (RBAC)**: Enforces role permissions (**Owner**, **Manager**, **Developer**, **Viewer**) across task editing, member removal, and workspace billing.
- **Workspace Roles Guide**: Interactive modal breaking down granular permissions per role.

### 📋 Interactive Kanban & Task Management
- **Drag-and-Drop Board**: Native HTML5 drag-and-drop to update task statuses (`Pending` ↔ `Complete`).
- **View Switcher**: Toggle between Kanban Board view and List view.
- **Full Task Lifecycle**: Create, edit (title, description, priority, dates, assignees), and delete tasks.
- **Filters & Search**: Priority filtering (`High`, `Medium`, `Low`) and real-time task search.

### 👥 Member & Invitation System
- **Project & Workspace Members**: View direct members, assign roles, and remove members with server safety checks.
- **Pending Invitations Management**: View outstanding company and project invitations with instant **Revoke** capability.

### 💳 Stripe Billing & SaaS Subscriptions
- **SaaS Pricing Tiers**: Free (฿0), Starter (฿299), Pro (฿799), and Business (฿1,999).
- **Stripe Checkout**: Direct integration with Stripe Hosted Checkout for upgrading subscription tiers.
- **Stripe Customer Portal**: Redirect to Stripe Portal for managing invoices and payment profiles.

### ⚡ Utility & UX Enhancements
- **Global Command Palette (`Cmd + K` / `Ctrl + K`)**: Quick keyboard-driven navigation across projects, tasks, routes, theme toggling, and actions.
- **Data Export**: Export projects, tasks, and member lists to CSV with one click.
- **Dark / Light Theme Support**: Instant dark mode switching with persistent user preference.

---

## 🛠️ Tech Stack

- **Core Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Lucide Icons
- **Server State Management**: TanStack Query v5 (React Query)
- **Client State Management**: Zustand
- **Form Handling & Validation**: React Hook Form + Zod
- **HTTP Client**: Axios with JWT Bearer Interceptors
- **Notifications**: Sonner Toast Notifications
- **Deployment**: Vercel (Frontend SPA Rewrite rules enabled via `vercel.json`)

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory for local development:

```env
# Local Backend API Base URL (or deployed backend URL)
VITE_API_BASE_URL=https://taskflowhub-935i.onrender.com/api/v1
```

For **Vercel Production Deployment**, configure `VITE_API_BASE_URL` in Vercel Project Settings:

| Environment Variable | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base API Endpoint URL | `https://taskflowhub-935i.onrender.com/api/v1` |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/hanminthawhmt/taskflowhub-web.git
   cd taskflowhub-web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   *The app will open automatically at `http://localhost:5173`.*

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📁 Project Structure

```text
src/
├── api/                  # Axios instance & JWT request/response interceptors
├── components/           # Reusable UI components & CommandPalette
├── features/
│   ├── auth/             # Authentication & user state
│   ├── billing/          # Stripe Checkout & Subscription management
│   ├── dashboard/        # Main Dashboard metrics & project overviews
│   ├── invitations/      # Accept invitation pages & services
│   ├── members/          # Workspace member list & pending invites tab
│   ├── projects/         # Projects, Kanban board, D&D, & Member tabs
│   ├── settings/         # Profile & Workspace settings
│   └── tasks/            # Task detail, My Tasks, & priority filters
├── hooks/                # Custom React hooks
├── layouts/              # DashboardLayout & Navigation bars
├── routes/               # React Router routes definition
├── store/                # Zustand auth & workspace state store
├── types/                # Shared TypeScript interfaces
├── utils/                # CSV exporter & helper functions
└── vite-env.d.ts         # Vite TypeScript environment declarations
```

---

## 🌐 Production Deployments

- **Frontend Application**: Hosted on **Vercel** ([https://taskflowhub-seven.vercel.app](https://taskflowhub-seven.vercel.app))
- **Backend API Service**: Hosted on **Render** ([https://taskflowhub-935i.onrender.com](https://taskflowhub-935i.onrender.com))

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
