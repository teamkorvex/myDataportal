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
  Users, 
  Crown, 
  Ban, 
  Trash2, 
  Pencil, 
  Search,
  Lock,
  Check
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types';
import { toast } from 'sonner';

export function Admin() {
  const navigate = useNavigate();
  const { 
    user, 
    isAuthenticated,
    isLoading,
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
  const [editIsPremium, setEditIsPremium] = useState(false);
  const [editIsSuspended, setEditIsSuspended] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("You must sign in first.");
      navigate('/', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    if (verifyAdminPassword(adminPassword)) {
      await loadUsers();
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
    setEditIsPremium(userData.isPremium);
    setEditIsSuspended(userData.isSuspended);
    setIsEditModalOpen(true);
  };

  const openDetailsModal = (userData: User) => {
    setSelectedUser(userData);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    const updates: Partial<User> = {};
    if (editUsername !== selectedUser.username) updates.username = editUsername;
    if (editEmail !== (selectedUser.email || '')) updates.email = editEmail;
    if (editIsPremium !== selectedUser.isPremium) updates.isPremium = editIsPremium;
    if (editIsSuspended !== selectedUser.isSuspended) updates.isSuspended = editIsSuspended;

    if (Object.keys(updates).length > 0) {
      const success = await updateUserByAdmin(selectedUser.id, updates);
      if (success) {
        await loadUsers();
        setIsEditModalOpen(false);
      }
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (confirm(`Are you sure you want to delete user "${username}"?`)) {
      const success = await deleteUser(userId);
      if (success) await loadUsers();
    }
  };

  const handleTogglePremium = async (userData: User) => {
    const success = await updateUserByAdmin(userData.id, { isPremium: !userData.isPremium });
    if (success) await loadUsers();
  };

  const handleToggleSuspend = async (userData: User) => {
    const success = await updateUserByAdmin(userData.id, { isSuspended: !userData.isSuspended });
    if (success) await loadUsers();
  };

  const filteredUsers = allUsers.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="bg-card border-border p-8">
          <div className="text-center">
            <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background grid-background relative">
        <Card className="bg-card border-border p-8 w-full max-w-md relative z-10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Admin Authentication</h1>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Admin Password</Label>
              <Input
                id="adminPassword"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="h-12 bg-secondary border-border"
                required
              />
            </div>
            {passwordError && <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{passwordError}</div>}
            <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90">Access Admin Panel</Button>
          </form>
          <Button variant="ghost" className="w-full mt-4" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>Back</Button>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Users className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{allUsers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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

        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                <div className="col-span-3">Username</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-4 text-right">Actions</div>
              </div>

              {filteredUsers.map((userData) => (
                <div key={userData.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-secondary/50 transition-colors">
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{userData.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <p className="font-medium text-foreground">{userData.username}</p>
                  </div>
                  <div className="col-span-3 text-sm text-muted-foreground truncate">{userData.email || '-'}</div>
                  <div className="col-span-2">
                    {userData.isSuspended ? (
                      <Badge variant="destructive" className="text-xs">Suspended</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-500">Active</Badge>
                    )}
                  </div>
                  <div className="col-span-4 flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openDetailsModal(userData)}><Search className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(userData)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleTogglePremium(userData)}><Crown className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleToggleSuspend(userData)}>{userData.isSuspended ? <Check className="w-4 h-4" /> : <Ban className="w-4 h-4" />}</Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(userData.id, userData.username)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="bg-secondary border-border" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateUser} className="bg-primary hover:bg-primary/90">Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border">
          <DialogHeader><DialogTitle>User Details</DialogTitle></DialogHeader>
          {selectedUser && (
            <div className="space-y-4 pt-4">
              <div className="space-y-3">
                <div className="p-3 bg-secondary/50 rounded">
                  <p className="text-xs text-muted-foreground uppercase">User ID</p>
                  <p className="text-sm font-mono">{selectedUser.id}</p>
                </div>
                <div className="p-3 bg-secondary/50 rounded">
                  <p className="text-xs text-muted-foreground uppercase">Email</p>
                  <p className="text-sm">{selectedUser.email || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}