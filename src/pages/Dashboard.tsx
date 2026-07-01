import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDocuments } from '@/hooks/useDocuments';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, Database, Crown, Users } from 'lucide-react';
import type { Document } from '@/types';

export function Dashboard() {
  const { user } = useAuth();
  const { documents } = useDocuments();
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [lastLogin, setLastLogin] = useState<string>('');
  const [sharedDocsCount, setSharedDocsCount] = useState(0);

  useEffect(() => {
    const storedLastLogin = localStorage.getItem('dataportal_last_login');
    if (storedLastLogin) {
      setLastLogin(storedLastLogin);
    } else {
      const now = new Date().toISOString();
      localStorage.setItem('dataportal_last_login', now);
      setLastLogin(now);
    }

    return () => {
      localStorage.setItem('dataportal_last_login', new Date().toISOString());
    };
  }, []);

  useEffect(() => {
    const sorted = [...documents].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ).slice(0, 5);
    setRecentDocs(sorted);

    const shared = documents.filter(doc => 
      doc.userId === user?.id && doc.sharedWith.length > 0
    ).length;
    setSharedDocsCount(shared);
  }, [documents, user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) + ', ' + date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const ownDocsCount = documents.filter(doc => doc.userId === user?.id).length;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {user?.discordAvatar ? (
              <img 
                src={user.discordAvatar} 
                alt={user.username}
                className="w-12 h-12 rounded-full border-2 border-primary"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">
                  {user?.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome, {user?.username}
              </h1>
              {user?.isPremium && (
                <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
          </div>
          <p className="text-muted-foreground">
            Your secure data management overview
          </p>
        </div>
        
        <Badge variant="outline" className="text-muted-foreground">
          {user?.authType === 'discord' ? 'Discord Account' : 'Local Account'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your Documents</p>
                <p className="text-2xl font-bold text-foreground">{ownDocsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Shared</p>
                <p className="text-2xl font-bold text-foreground">{sharedDocsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Login</p>
                <p className="text-sm font-medium text-foreground">
                  {lastLogin ? formatDate(lastLogin) : 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Recent Activity</h2>
          
          {recentDocs.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                No documents yet. Create your first document in Storage.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDocs.map((doc) => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {doc.type === 'file' && doc.fileType?.startsWith('image/') ? (
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                        <img 
                          src={doc.fileData} 
                          alt={doc.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">{doc.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.type === 'file' ? 'File' : 'Text Document'} • {formatDate(doc.updatedAt)}
                        {doc.userId !== user?.id && (
                          <span className="text-primary ml-2">(Shared)</span>
                        )}
                        {doc.isPublic && (
                          <Badge variant="outline" className="ml-2 text-[10px] h-4">Public</Badge>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}