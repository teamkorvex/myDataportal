import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Moon, LogOut, User, Lock, Crown, Mail, Shield, ExternalLink } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { logout, user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [new2FACode, setNew2FACode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleUpdate2FA = () => {
    setError('');
    setSuccess('');
    
    if (!/^\d{4}$/.test(new2FACode)) {
      setError('2FA code must be exactly 4 digits');
      return;
    }

    updateUser({ twoFactorCode: new2FACode });
    setSuccess('2FA code updated successfully');
    setNew2FACode('');
    
    setTimeout(() => {
      setIs2FAModalOpen(false);
      setSuccess('');
    }, 1500);
  };

  const isAdmin = user?.username === 'korvex' || user?.username === 'crews';

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Customize your DataPortal experience</p>
      </div>

      <div className="space-y-6">
        {/* User Profile Card */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {user?.discordAvatar ? (
                <img 
                  src={user.discordAvatar} 
                  alt={user.username}
                  className="w-16 h-16 rounded-full border-2 border-primary"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {user?.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-semibold text-foreground">{user?.username}</h3>
                  {user?.isPremium && (
                    <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {user?.authType === 'discord' ? 'Discord Account' : 'Local Account'}
                </p>
                {user?.email && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Mail className="w-3 h-3" />
                    {user.email}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme toggle */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Moon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Theme</h3>
                  <p className="text-sm text-muted-foreground">
                    Switch between dark and light mode
                  </p>
                </div>
              </div>
              <Switch 
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account info */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Account Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2FA Settings */}
        {user?.authType === 'local' && (
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground">
                      Change your 2FA authentication code
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setIs2FAModalOpen(true)}
                >
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Panel Link */}
        {isAdmin && (
          <Card className="bg-card border-border border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Admin Panel</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage users, view statistics, and configure settings
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary/10"
                  onClick={() => navigate('/admin')}
                >
                  Open
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Logout */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <LogOut className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Logout</h3>
                  <p className="text-sm text-muted-foreground">
                    Sign out from your account
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2FA Change Modal */}
      <Dialog open={is2FAModalOpen} onOpenChange={setIs2FAModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change 2FA Code
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="2fa" className="text-xs uppercase tracking-wider text-muted-foreground">
                New 2FA Code
              </Label>
              <Input
                id="2fa"
                type="text"
                placeholder="Enter new 4-digit code"
                value={new2FACode}
                onChange={(e) => setNew2FACode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="bg-secondary border-border text-center text-xl tracking-[0.5em] font-mono"
                maxLength={4}
              />
              <p className="text-xs text-muted-foreground">
                Choose a new 4-digit code for two-factor authentication
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-md bg-green-500/10 text-green-500 text-sm">
                {success}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIs2FAModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdate2FA}
                className="bg-primary hover:bg-primary/90"
                disabled={new2FACode.length !== 4}
              >
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
