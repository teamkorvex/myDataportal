import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-background grid-background relative flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Gradient orbs */}
      <div className="gradient-orb gradient-orb-1 opacity-10" />
      <div className="gradient-orb gradient-orb-2 opacity-10" />
      
      <div className="text-center max-w-md animate-fade-in relative z-10">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8 rotate-12">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        
        <h1 className="text-8xl font-black text-foreground mb-4 tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold text-foreground mb-4">Lost in the void?</h2>
        <p className="text-muted-foreground mb-10">
          The page you're looking for doesn't exist or has been moved to another dimension.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline"
            onClick={() => navigate(-1)}
            className="h-12 px-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button 
            onClick={() => navigate('/')}
            className="h-12 px-6 bg-primary hover:bg-primary/90"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}