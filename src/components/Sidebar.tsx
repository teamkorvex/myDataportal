import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Database, 
  Home, 
  Settings, 
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/storage', label: 'Drops', icon: Database },
    { path: '/dashboard', label: 'myPortal', icon: Home },
  ];

  const bottomItems = [
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={cn(
      "w-64 h-screen bg-sidebar-background border-r border-sidebar-border flex flex-col",
      className
    )}>
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">dropz</span>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-11 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              isActive(item.path) && "bg-sidebar-accent text-sidebar-foreground font-medium"
            )}
            onClick={() => navigate(item.path)}
          >
            <item.icon className={cn(
              "w-5 h-5",
              isActive(item.path) ? "text-primary" : "text-sidebar-foreground/50"
            )} />
            {item.label}
          </Button>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-sidebar-border space-y-1">
        {bottomItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-11 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              isActive(item.path) && "bg-sidebar-accent text-sidebar-foreground font-medium"
            )}
            onClick={() => navigate(item.path)}
          >
            <item.icon className={cn(
              "w-5 h-5",
              isActive(item.path) ? "text-primary" : "text-sidebar-foreground/50"
            )} />
            {item.label}
          </Button>
        ))}
        
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-11 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 text-sidebar-foreground/50" />
          Logout
        </Button>
      </div>
    </div>
  );
}