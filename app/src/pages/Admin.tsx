import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Shield, 
  ArrowLeft, 
  Users, 
  Crown, 
  Ban, 
  Trash2, 
  Pencil, 
  Search,
  Lock,
  LogOut,
  Check,
  Mail,
  Key,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types';

export function Admin() {
  const navigate = useNavigate();
  const { 
    user, 
    isAdminAuthenticated, 
    verifyAdminPassword, 
    adminLogout,
    getAllUsers,
    updateUserByAdmin,
    deleteUser 
  } = useAuth();
  
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTwoFactorCode, setEditTwoFactorCode] = useState('');
  const [editRank, setEditRank] = useState<'standard' | 'premium'>('standard');
  const [editSuspended, setEditSuspended] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Check if user is admin
  const isAdmin = user?.username === 'korvex' || user?.username === 'crews';

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadUsers();
    }
  }, [isAdminAuthenticated]);

  const loadUsers = async () => {
    const users = await getAllUsers();
    setAllUsers(users);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    if (verifyAdminPassword(adminPassword)) {
      loadUsers();
    } else {
      setPasswordError('Invalid admin password');
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/dashboard');
  };

  const openEditModal = (userData: User) => {
    setSelectedUser(userData);
    setEditUsername(userData.username);
    setEditEmail(userData.email || '');
    setEditTwoFactorCode(userData.twoFactorCode);
    setEditRank(userData.rank);
    setEditSuspended(userData.suspended);
    setSuccessMessage('');
    setIsEditModalOpen(true);
  };

  const openDetailsModal = (userData: User) => {
    setSelectedUser(userData);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    const updates: Partial<User> = {};
    
    if (editUsername !== selectedUser.username) {
      updates.username = editUsername;
    }
    if (editEmail !== (selectedUser.email || '')) {
      updates.email = editEmail;
    }
    if (editTwoFactorCode !== selectedUser.twoFactorCode) {
      updates.twoFactorCode = editTwoFactorCode;
    }
    if (editRank !== selectedUser.rank) {
      updates.rank = editRank;
    }
    if (editSuspended !== selectedUser.suspended) {
      updates.suspended = editSuspended;
    }

    if (Object.keys(updates).length > 0) {
      const success = await updateUserByAdmin(selectedUser.id, updates);
      if (success) {
        setSuccessMessage('User updated successfully');
        loadUsers();
        setTimeout(() => {
          setIsEditModalOpen(false);
          setSuccessMessage('');
        }, 1500);
      }
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      const success = await deleteUser(userId);
      if (success) {
        loadUsers();
      }
    }
  };

  const handleTogglePremium = async (userData: User) => {
    const newRank = userData.rank === 'premium' ? 'standard' : 'premium';
    const success = await updateUserByAdmin(userData.id, { rank: newRank });
    if (success) {
      loadUsers();
    }
  };

  const handleToggleSuspend = async (userData: User) => {
    const success = await updateUserByAdmin(userData.id, { suspended: !userData.suspended });
    if (success) {
      loadUsers();
    }
  };

  // Filter users based on search
  const filteredUsers = allUsers.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // If not admin, redirect
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="bg-card border-border p-8">
          <div className="text-center">
            <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">You do not have permission to access this page.</p>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // If not authenticated with admin password, show password prompt
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background grid-background relative">
        <div className="gradient-orb gradient-orb-1" />
        <div className="gradient-orb gradient-orb-2" />
        
        <Card className="bg-card border-border p-8 w-full max-w-md relative z-10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Admin Authentication</h1>
            <p className="text-muted-foreground">Please enter your admin password to continue</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminPassword" className="text-xs uppercase tracking-wider text-muted-foreground">
                Admin Password
              </Label>
              <Input
                id="adminPassword"
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="h-12 bg-secondary border-border"
                required
              />
            </div>

            {passwordError && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {passwordError}
              </div>
            )}

            <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90">
              <Shield className="w-4 h-4 mr-2" />
              Access Admin Panel
            </Button>
          </form>

          <Button 
            variant="ghost" 
            className="w-full mt-4"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Logged in as <span className="text-foreground font-medium">{user?.username}</span>
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{allUsers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Premium Users</p>
                  <p className="text-2xl font-bold text-foreground">
                    {allUsers.filter(u => u.rank === 'premium').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Ban className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Suspended</p>
                  <p className="text-2xl font-bold text-foreground">
                    {allUsers.filter(u => u.suspended).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold text-foreground">
                    {allUsers.filter(u => !u.suspended).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
        </div>

        {/* Users table */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                <div className="col-span-3">Username</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {/* Users */}
              {filteredUsers.map((userData) => (
                <div 
                  key={userData.id} 
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-secondary/50 transition-colors"
                >
                  <div className="col-span-3 flex items-center gap-3">
                    {userData.discordAvatar ? (
                      <img 
                        src={userData.discordAvatar} 
                        alt={userData.username}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {userData.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">{userData.username}</p>
                      {userData.rank === 'premium' && (
                        <Badge className="bg-yellow-500/20 text-yellow-500 text-xs">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="col-span-3 text-sm text-muted-foreground truncate">
                    {userData.email || '-'}
                  </div>
                  <div className="col-span-2">
                    {userData.suspended ? (
                      <Badge variant="destructive" className="text-xs">
                        <Ban className="w-3 h-3 mr-1" />
                        Suspended
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-500">
                        <Check className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {userData.authType === 'discord' ? 'Discord' : 'Local'}
                  </div>
                  <div className="col-span-2 flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => openDetailsModal(userData)}
                      title="View Details"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => openEditModal(userData)}
                      title="Edit User"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${userData.rank === 'premium' ? 'text-yellow-500 hover:text-yellow-600' : 'text-muted-foreground hover:text-yellow-500'}`}
                      onClick={() => handleTogglePremium(userData)}
                      title={userData.rank === 'premium' ? 'Remove Premium' : 'Give Premium'}
                    >
                      <Crown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${userData.suspended ? 'text-green-500 hover:text-green-600' : 'text-muted-foreground hover:text-destructive'}`}
                      onClick={() => handleToggleSuspend(userData)}
                      title={userData.suspended ? 'Unsuspend' : 'Suspend'}
                    >
                      {userData.suspended ? <Check className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteUser(userData.id, userData.username)}
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              Edit User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="editUsername" className="text-xs uppercase tracking-wider text-muted-foreground">
                Username
              </Label>
              <Input
                id="editUsername"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editEmail" className="text-xs uppercase tracking-wider text-muted-foreground">
                Email
              </Label>
              <Input
                id="editEmail"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit2FA" className="text-xs uppercase tracking-wider text-muted-foreground">
                2FA Code
              </Label>
              <Input
                id="edit2FA"
                value={editTwoFactorCode}
                onChange={(e) => setEditTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="bg-secondary border-border text-center tracking-[0.5em] font-mono"
                maxLength={4}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-foreground">Premium Status</span>
              </div>
              <Button
                variant={editRank === 'premium' ? 'default' : 'outline'}
                size="sm"
                className={editRank === 'premium' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                onClick={() => setEditRank(editRank === 'premium' ? 'standard' : 'premium')}
              >
                {editRank === 'premium' ? 'Premium' : 'Standard'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded">
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4 text-destructive" />
                <span className="text-sm text-foreground">Account Status</span>
              </div>
              <Button
                variant={editSuspended ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => setEditSuspended(!editSuspended)}
              >
                {editSuspended ? 'Suspended' : 'Active'}
              </Button>
            </div>

            {successMessage && (
              <div className="p-3 rounded-md bg-green-500/10 text-green-500 text-sm">
                {successMessage}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateUser}
                className="bg-primary hover:bg-primary/90"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Search className="w-5 h-5" />
              User Details
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4 mb-6">
                {selectedUser.discordAvatar ? (
                  <img 
                    src={selectedUser.discordAvatar} 
                    alt={selectedUser.username}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {selectedUser.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{selectedUser.username}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedUser.rank === 'premium' && (
                      <Badge className="bg-yellow-500/20 text-yellow-500">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                    {selectedUser.suspended ? (
                      <Badge variant="destructive">
                        <Ban className="w-3 h-3 mr-1" />
                        Suspended
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-500">
                        <Check className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded">
                  <Key className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">User ID</p>
                    <p className="text-sm text-foreground font-mono">{selectedUser.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                    <p className="text-sm text-foreground">{selectedUser.email || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">2FA Code</p>
                    <p className="text-sm text-foreground font-mono">{selectedUser.twoFactorCode}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Created</p>
                    <p className="text-sm text-foreground">
                      {new Date(selectedUser.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Account Type</p>
                    <p className="text-sm text-foreground capitalize">{selectedUser.authType}</p>
                  </div>
                </div>

                {selectedUser.discordId && (
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Discord ID</p>
                      <p className="text-sm text-foreground font-mono">{selectedUser.discordId}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
