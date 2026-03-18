import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, ArrowLeft, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!/^\d{4}$/.test(twoFactorCode)) {
      setError('2FA code must be exactly 4 digits');
      return;
    }

    // Email validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({ 
        username, 
        email,
        password, 
        twoFactorCode 
      });
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 relative grid-background">
      {/* Gradient orbs */}
      <div className="gradient-orb gradient-orb-1" />
      <div className="gradient-orb gradient-orb-2" />

      {/* Back button */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="absolute top-6 left-6 text-muted-foreground hover:text-foreground"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Logo */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <span className="text-lg font-semibold text-foreground">DataPortal</span>
      </div>

      {/* Registration card */}
      <div className="w-full max-w-md animate-fade-in relative z-10">
        <div className="bg-card border border-border rounded-xl p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Create Account</h1>
            <p className="text-sm text-muted-foreground">
              Set up your secure DataPortal account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs uppercase tracking-wider text-muted-foreground">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 bg-secondary border-border focus:border-primary focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                Email <span className="text-muted-foreground/50">(optional)</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-secondary border-border focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-secondary border-border focus:border-primary focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-wider text-muted-foreground">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 bg-secondary border-border focus:border-primary focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="2fa" className="text-xs uppercase tracking-wider text-muted-foreground">
                2FA Code
              </Label>
              <Input
                id="2fa"
                type="text"
                placeholder="Choose a 4-digit code"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="h-11 bg-secondary border-border focus:border-primary focus:ring-primary text-center tracking-[0.5em] font-mono"
                maxLength={4}
                required
              />
              <p className="text-xs text-muted-foreground">
                Choose a 4-digit code for two-factor authentication
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Create Account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
