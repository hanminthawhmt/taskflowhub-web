=====================================================
FRONTEND TECH STACK & DEVELOPMENT RULES
=====================================================

The frontend MUST be implemented using the following stack:

Framework
- React 19
- Vite

Language
- TypeScript (strict mode)

Routing
- React Router v7

UI
- Tailwind CSS
- shadcn/ui for reusable UI components
- Lucide React for icons

State Management
- TanStack Query (React Query) for server state
- Zustand for client/global state

Forms
- React Hook Form
- Zod for client-side validation

HTTP Client
- Axios

Tables
- TanStack Table

Calendar
- FullCalendar React

Charts
- Recharts

Notifications
- Sonner

Authentication
- JWT Authentication
- Store JWT securely
- Axios interceptors for Authorization header
- Automatically redirect to login on 401 responses

Project Structure

src/
 ├── api/
 ├── components/
 ├── features/
 ├── hooks/
 ├── layouts/
 ├── lib/
 ├── pages/
 ├── routes/
 ├── services/
 ├── store/
 ├── types/
 ├── utils/

Development Rules

- Build reusable components.
- Use functional React components.
- Prefer hooks over class components.
- Keep business logic inside custom hooks.
- Separate API logic from UI.
- Use TypeScript interfaces/types for all API models.
- Never hardcode backend endpoints or response fields.
- Follow the API documentation below exactly.
- If an endpoint does not exist, do not invent one. Add it to new-endpoint-suggestions.txt.