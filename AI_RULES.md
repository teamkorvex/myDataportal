# AI Development Rules for dropz

## Tech Stack
* **Frontend Framework**: React 19 with TypeScript and Vite.
* **Styling**: Tailwind CSS v3 with custom shadcn/ui theme variables.
* **Routing**: React Router DOM v7 (routes managed in `src/App.tsx`).
* **Icons**: Lucide React for clean, consistent iconography.
* **UI Components**: Radix UI primitives styled with Tailwind CSS (shadcn/ui).
* **Notifications**: Sonner for sleek, non-blocking toast notifications.
* **Database & Auth**: Supabase (PostgreSQL database and Discord OAuth).

## Development Rules & Guidelines
1. **Component Structure**: Keep components small, focused, and under 100 lines of code. Create new files in `src/components/` or `src/pages/` instead of nesting multiple components in a single file.
2. **Styling**: Always use Tailwind CSS utility classes. Do not write custom CSS unless absolutely necessary. Use CSS variables from `src/index.css` for theme colors.
3. **State Management**: Use React Context for global state (like `useAuth` and `useTheme`) and local state/custom hooks for page-specific logic.
4. **Icons**: Always import icons from `lucide-react`.
5. **Toasts**: Use `toast` from `sonner` to notify users of actions, errors, and successes.
6. **Responsive Design**: Ensure all layouts are fully responsive and mobile-friendly.
7. **No Placeholders**: Write complete, functional code. Avoid `TODO` comments or partial implementations.