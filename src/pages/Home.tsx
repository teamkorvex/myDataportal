import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, LogIn, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleAction = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen w-full bg-background grid-background relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="gradient-orb gradient-orb-1" />
      <div className="gradient-orb gradient-orb-2" />
      
      {/* Logo */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <span className="text-lg font-semibold text-foreground">dropz</span>
      </div>

      {/* Main content */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Welcome to<br />
            <span className="text-primary">dropz</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
            A fun, social spaceto drop, share, and manage your images and documents with friends.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-medium"
              onClick={handleAction}
            >
              {isAuthenticated ? (
                <>
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Enter dropz
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}