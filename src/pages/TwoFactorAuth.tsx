import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function TwoFactorAuth() {
  const navigate = useNavigate();
  const { verify2FA } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await verify2FA(code);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Invalid 2FA code');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex">
      {/* Left side - Abstract visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a0a0f] overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute inset-0">
          <div 
            className="absolute w-96 h-96 rounded-full opacity-30"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              top: '10%',
              left: '10%',
              filter: 'blur(60px)',
            }}
          />
          <div 
            className="absolute w-80 h-80 rounded-full opacity-25"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              bottom: '15%',
              right: '15%',
              filter: 'blur(50px)',
            }}
          />
          <div 
            className="absolute w-64 h-64 rounded-full opacity-20"
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #3730a3)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              filter: 'blur(40px)',
            }}
          />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end p-12">
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-6 left-6 text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/login')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-3">
              Two-Factor Authentication
            </h2>
            <p className="text-gray-400 max-w-sm">
              Additional security layer to protect your account.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - 2FA form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative">
        {/* Mobile back button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-6 left-6 lg:hidden text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/login')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Logo - mobile only */}
        <div className="lg:hidden absolute top-6 right-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <span className="text-lg font-semibold text-foreground">DataPortal</span>
        </div>

        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Enter 2 factor auth code
            </h1>
            <p className="text-muted-foreground">
              Please enter your authentication code to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-xs uppercase tracking-wider text-muted-foreground">
                Authentication Code
              </Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 4-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="h-12 bg-secondary border-border focus:border-primary focus:ring-primary text-center text-2xl tracking-[0.5em] font-mono"
                maxLength={4}
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={isLoading || code.length !== 4}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              Confirm
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
