import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  FileText, 
  Pencil, 
  Trash2, 
  Database,
  Upload,
  Save,
  Search,
  Users,
  X,
  Download,
  Eye,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Globe,
  Lock
} from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useAuth } from '@/hooks/useAuth';
import { parseMarkdown, markdownActions } from '@/lib/markdown';
import type { Document } from '@/types';
import { toast } from 'sonner';

export function Storage() {
  const { user } = useAuth();
  const { 
    filteredDocuments, 
    searchQuery, 
    setSearchQuery,
    createDocument, 
    updateDocument, 
    deleteDocument, 
    shareDocument,
    unshareDocument,
    uploadFile,
    getDocumentById,
    isDocumentOwner 
  } = useDocuments();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [shareUsername, setShareUsername] = useState('');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocContent, setNewDocContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [shareError, setShareError] = useState('');
  const [shareSuccess, setShareSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCreateDocument = () => {
    if (newDocTitle.trim()) {
      createDocument(newDocTitle.trim(), newDocContent);
      setNewDocTitle('');
      setNewDocContent('');
      setIsCreateModalOpen(false);
    }
  };

  const handleEditDocument = () => {
    if (editingDoc && editTitle.trim()) {
      updateDocument(editingDoc.id, { 
        title: editTitle.trim(), 
        content: editContent 
      });
      setIsEditModalOpen(false);
      setEditingDoc(null);
      toast.success('Document updated');
    }
  };

  const openEditModal = (doc: Document) => {
    setEditingDoc(doc);
    setEditTitle(doc.title);
    setEditContent(doc.content);
    setIsEditModalOpen(true);
  };

  const openViewModal = (doc: Document) => {
    setViewingDoc(doc);
    setIsViewModalOpen(true);
  };

  const openShareModal = (doc: Document) => {
    setEditingDoc(doc);
    setShareUsername('');
    setShareError('');
    setShareSuccess('');
    setIsShareModalOpen(true);
  };

  const openImageModal = (doc: Document) => {
    setViewingDoc(doc);
    setIsImageModalOpen(true);
  };

  const handleDeleteDocument = (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteDocument(id);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      await uploadFile(file);
    } catch (error: any) {
      setUploadError(error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleShare = async () => {
    setShareError('');
    setShareSuccess('');
    
    if (!shareUsername.trim()) {
      setShareError('Please enter a username');
      return;
    }

    if (shareUsername.trim() === user?.username) {
      setShareError('Cannot share with yourself');
      return;
    }

    if (editingDoc) {
      const success = await shareDocument(editingDoc.id, shareUsername.trim());
      if (success) {
        setShareSuccess(`Shared with ${shareUsername.trim()}`);
        setShareUsername('');
        const updated = getDocumentById(editingDoc.id);
        if (updated) setEditingDoc(updated);
      } else {
        setShareError('Already shared with this user or document not found');
      }
    }
  };

  const handleUnshare = async (username: string) => {
    if (editingDoc) {
      await unshareDocument(editingDoc.id, username);
      const updated = getDocumentById(editingDoc.id);
      if (updated) setEditingDoc(updated);
    }
  };

  const handleTogglePublic = async (doc: Document) => {
    const updated = await updateDocument(doc.id, { isPublic: !doc.isPublic });
    if (updated) {
      toast.success(updated.isPublic ? 'Document is now public' : 'Document is now private');
      if (editingDoc?.id === doc.id) setEditingDoc(updated);
    }
  };

  const copyPublicLink = (doc: Document) => {
    const link = `${window.location.origin}/share/${doc.id}`;
    navigator.clipboard.writeText(link);
    toast.success('Public link copied to clipboard');
  };

  const handleDownload = (doc: Document) => {
    if (doc.fileData && doc.fileName) {
      const link = document.createElement('a');
      link.href = doc.fileData;
      link.download = doc.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const insertMarkdown = (action: keyof typeof markdownActions) => {
    if (!editTextareaRef.current) return;
    
    const textarea = editTextareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const result = markdownActions[action](editContent, start, end);
    setEditContent(result.text);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(result.cursorPos, result.cursorPos);
    }, 0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) + ', ' + date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Storage</h1>
          <p className="text-muted-foreground">Create and manage your documents</p>
        </div>
        <div className="flex gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Document
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary border-border"
          />
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-16">
              <Database className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">
                {searchQuery ? 'No matching documents' : 'No documents yet'}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try a different search term' : 'Create your first document to get started'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                <div className="col-span-5">Title</div>
                <div className="col-span-3">Updated</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>

              {filteredDocuments.map((doc) => (
                <div 
                  key={doc.id} 
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-secondary/50 transition-colors"
                >
                  <div className="col-span-5 flex items-center gap-3">
                    {doc.type === 'file' && doc.fileType?.startsWith('image/') ? (
                      <button 
                        onClick={() => openImageModal(doc)}
                        className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-primary transition-all"
                      >
                        <img 
                          src={doc.fileData} 
                          alt={doc.title}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ) : (
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{doc.title}</p>
                      {doc.userId !== user?.id && (
                        <Badge variant="secondary" className="text-[10px] h-4 mt-1">
                          Shared
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="col-span-3 text-sm text-muted-foreground">
                    {formatDate(doc.updatedAt)}
                  </div>
                  <div className="col-span-1">
                    {doc.isPublic ? (
                      <Globe className="w-4 h-4 text-primary" title="Public" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" title="Private" />
                    )}
                  </div>
                  <div className="col-span-3 flex justify-end gap-1">
                    {doc.isPublic && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => copyPublicLink(doc)}
                        title="Copy Public Link"
                      >
                        <LinkIcon className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => doc.type === 'text' ? openViewModal(doc) : openImageModal(doc)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    {isDocumentOwner(doc.id) && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEditModal(doc)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => openShareModal(doc)}
                        >
                          <Users className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle>New Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Enter document title"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                placeholder="Enter document content..."
                value={newDocContent}
                onChange={(e) => setNewDocContent(e.target.value)}
                className="bg-secondary border-border min-h-[200px]"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateDocument} disabled={!newDocTitle.trim()}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-4xl bg-card border-border">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <div className="grid grid-cols-2 gap-4">
                <Textarea
                  ref={editTextareaRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="bg-secondary border-border min-h-[300px]"
                />
                <div className="bg-background p-4 rounded-md border border-border overflow-auto max-h-[300px]">
                  <div 
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(editContent) }}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button onClick={handleEditDocument} disabled={!editTitle.trim()}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Share Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Public Access</p>
                  <p className="text-xs text-muted-foreground">Anyone with the link can view</p>
                </div>
              </div>
              <Switch 
                checked={editingDoc?.isPublic} 
                onCheckedChange={() => editingDoc && handleTogglePublic(editingDoc)} 
              />
            </div>

            {editingDoc?.isPublic && (
              <div className="space-y-2">
                <Label className="text-xs uppercase">Public Link</Label>
                <div className="flex gap-2">
                  <Input 
                    readOnly 
                    value={`${window.location.origin}/share/${editingDoc.id}`}
                    className="bg-secondary border-border text-xs"
                  />
                  <Button size="sm" onClick={() => editingDoc && copyPublicLink(editingDoc)}>
                    Copy
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Label className="text-xs uppercase">Share with User</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter username"
                  value={shareUsername}
                  onChange={(e) => setShareUsername(e.target.value)}
                  className="bg-secondary border-border"
                />
                <Button onClick={handleShare}>Share</Button>
              </div>
              {shareError && <p className="text-xs text-destructive">{shareError}</p>}
              {shareSuccess && <p className="text-xs text-green-500">{shareSuccess}</p>}
            </div>

            {editingDoc && editingDoc.sharedWith.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs uppercase">Currently Shared With</Label>
                <div className="space-y-1">
                  {editingDoc.sharedWith.map(u => (
                    <div key={u} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <span className="text-sm">{u}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleUnshare(u)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle>{viewingDoc?.title}</DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            <div 
              className="prose prose-invert max-w-none bg-secondary/30 p-6 rounded-lg"
              dangerouslySetInnerHTML={{ __html: viewingDoc ? parseMarkdown(viewingDoc.content) : '' }}
            />
            <div className="flex justify-end pt-6">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="sm:max-w-4xl bg-card border-border">
          <DialogHeader>
            <DialogTitle>{viewingDoc?.title}</DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            {viewingDoc?.fileData && (
              <img src={viewingDoc.fileData} alt={viewingDoc.title} className="max-w-full h-auto rounded-lg mx-auto" />
            )}
            <div className="flex justify-end gap-3 pt-6">
              <Button variant="outline" onClick={() => setIsImageModalOpen(false)}>Close</Button>
              {viewingDoc && (
                <Button onClick={() => handleDownload(viewingDoc)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}