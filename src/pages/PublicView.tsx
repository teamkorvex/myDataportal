import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowLeft, FileText, Download, Loader2 } from 'lucide-react';
import { parseMarkdown } from '@/lib/markdown';
import type { Document } from '@/types';

export function PublicView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublicDoc = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .eq('is_public', true)
        .single();

      if (error || !data) {
        setError('Document not found or is not public.');
        setLoading(false);
        return;
      }

      setDoc({
        id: data.id,
        userId: data.user_id,
        title: data.title,
        content: data.content || '',
        type: data.type,
        fileType: data.file_type,
        fileData: data.file_data,
        fileName: data.file_name,
        fileSize: data.file_size,
        sharedWith: data.shared_with || [],
        isPublic: data.is_public,
        updatedAt: data.updated_at,
        createdAt: data.created_at,
      });
      setLoading(false);
    };

    fetchPublicDoc();
  }, [id]);

  const handleDownload = () => {
    if (doc?.fileData && doc?.fileName) {
      const link = document.createElement('a');
      link.href = doc.fileData;
      link.download = doc.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-8">{error}</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grid-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold">dropz</span>
            </div>
          </div>
          {doc.type === 'file' && (
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 md:p-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">{doc.title}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Publicly shared via dropz • Updated {new Date(doc.updatedAt).toLocaleDateString()}
          </p>
        </div>

        <Card className="bg-card border-border overflow-hidden">
          <CardContent className="p-0">
            {doc.type === 'file' && doc.fileType?.startsWith('image/') ? (
              <div className="bg-secondary/20 p-8 flex justify-center">
                <img src={doc.fileData} alt={doc.title} className="max-w-full h-auto rounded-lg shadow-2xl" />
              </div>
            ) : (
              <div className="p-8 md:p-12">
                <div 
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(doc.content) }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}