import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  className?: string;
}

export function DashboardLayout({ className }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("You must sign in first.");
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={cn("min-h-screen flex bg-background", className)}>
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8 grid-background min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
}