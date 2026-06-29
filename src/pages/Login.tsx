import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth, getDiscordOAuthUrl } from '@/hooks/useAuth';

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithDiscord } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle Discord OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleDiscordCallback(code);
    }
  }, [searchParams]);

  const handleDiscordCallback = async (code: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: '1483857198852603985',
          client_secret: 'SXPh1Ta9_rPft3I3OYCbXq-y4jrf8bfh',
          grant_type: 'authorization_code',
          code,
          redirect_uri: 'https://dataportal.korvex.xyz/myportal/dashboard',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to authenticate with Discord');
      }

      const tokenData = await tokenResponse.json();
      
      // Get user info from Discord
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user info from Discord');
      }

      const discordUser = await userResponse.json();
      
      // Login with Discord user
      const result = await loginWithDiscord({
        id: discordUser.id,
        username: discordUser.username,
        avatar: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : undefined,
        email: discordUser.email,
      }, tokenData.access_token);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Discord login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login with Discord');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscordLogin = () => {
    window.location.href = getDiscordOAuthUrl();
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
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end p-12">
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-6 left-6 text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-3">
              dropz Social Space
            </h2>
            <p className="text-gray-400 max-w-sm">
              Drop, share, and chat with friends instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative">
        {/* Mobile back button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-6 left-6 lg:hidden text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Logo - mobile only */}
        <div className="lg:hidden absolute top-6 right-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <span className="text-lg font-semibold text-foreground">dropz</span>
        </div>

        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Enter dropz</h1>
            <p className="text-muted-foreground">
              Sign in with Discord to access your drops and share with friends
            </p>
          </div>

          {/* Discord Login Button */}
          <Button 
            variant="outline" 
            className="w-full h-14 mb-6 border-[#5865F2] text-[#5865F2] hover:bg-[#5865F2]/10 text-base font-medium"
            onClick={handleDiscordLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            )}
            Sign in with Discord
          </Button>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}