import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Code
} from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useAuth } from '@/hooks/useAuth';
import { parseMarkdown, markdownActions } from '@/lib/markdown';
import type { Document } from '@/types';

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

      {uploadError && (
        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {uploadError}
        </div>
      )}

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
                <div className="col-span-2">Shared</div>
                <div className="col-span-2 text-right">Actions</div>
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
                      {doc.type === 'file' && doc.fileSize && (
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(doc.fileSize)}
                        </p>
                      )}
                      {doc.userId !== user?.id && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Shared with you
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="col-span-3 text-sm text-muted-foreground">
                    {formatDate(doc.updatedAt)}
                  </div>
                  <div className="col-span-2">
                    {doc.sharedWith.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {doc.sharedWith.length}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 flex justify-end gap-1">
                    {doc.type === 'text' ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openViewModal(doc)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    ) : doc.fileType?.startsWith('image/') ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openImageModal(doc)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {doc.type === 'text' && (isDocumentOwner(doc.id) || doc.userId === user?.id || doc.sharedWith.includes(user?.username || '')) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openEditModal(doc)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {isDocumentOwner(doc.id) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => openShareModal(doc)}
                      >
                        <Users className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {doc.type === 'file' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {isDocumentOwner(doc.id) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New Document
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs uppercase tracking-wider text-muted-foreground">
                Title
              </Label>
              <Input
                id="title"
                placeholder="Enter document title"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content" className="text-xs uppercase tracking-wider text-muted-foreground">
                Content
              </Label>
              <div className="border border-border rounded-md overflow-hidden">
                <div className="flex items-center gap-1 p-2 bg-secondary/50 border-b border-border">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Bold (**text**)">
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Italic (*text*)">
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Underline (__text__)">
                    <Underline className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Strikethrough (~~text~~)">
                    <Strikethrough className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Code (`text`)">
                    <Code className="w-4 h-4" />
                  </Button>
                </div>
                <Textarea
                  id="content"
                  placeholder="Enter document content..."
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  className="bg-secondary border-0 min-h-[200px] resize-none rounded-none focus-visible:ring-0"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateDocument}
                className="bg-primary hover:bg-primary/90"
                disabled={!newDocTitle.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-4xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              Edit Document
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="editTitle" className="text-xs uppercase tracking-wider text-muted-foreground">
                Title
              </Label>
              <Input
                id="editTitle"
                placeholder="Enter document title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Content
              </Label>
              <div className="border border-border rounded-md overflow-hidden">
                <div className="flex items-center gap-1 p-2 bg-secondary/50 border-b border-border">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('bold')} title="Bold">
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('italic')} title="Italic">
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('underline')} title="Underline">
                    <Underline className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('strikethrough')} title="Strikethrough">
                    <Strikethrough className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('code')} title="Code">
                    <Code className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 divide-x divide-border">
                  <Textarea
                    ref={editTextareaRef}
                    placeholder="Enter document content..."
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="bg-secondary border-0 min-h-[300px] resize-none rounded-none focus-visible:ring-0"
                  />
                  <div className="bg-background p-4 min-h-[300px] overflow-auto">
                    <div 
                      className="prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(editContent) }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleEditDocument}
                className="bg-primary hover:bg-primary/90"
                disabled={!editTitle.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground">
              {viewingDoc?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            <div 
              className="prose prose-invert max-w-none bg-secondary/30 p-6 rounded-lg"
              dangerouslySetInnerHTML={{ __html: viewingDoc ? parseMarkdown(viewingDoc.content) : '' }}
            />
            <div className="flex justify-end gap-3 pt-6">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              {viewingDoc && (isDocumentOwner(viewingDoc.id) || viewingDoc.sharedWith.includes(user?.username || '')) && (
                <Button 
                  onClick={() => {
                    setIsViewModalOpen(false);
                    if (viewingDoc) openEditModal(viewingDoc);
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5" />
              Share Document
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="shareUsername" className="text-xs uppercase tracking-wider text-muted-foreground">
                Username to share with
              </Label>
              <div className="flex gap-2">
                <Input
                  id="shareUsername"
                  placeholder="Enter username"
                  value={shareUsername}
                  onChange={(e) => setShareUsername(e.target.value)}
                  className="bg-secondary border-border flex-1"
                />
                <Button onClick={handleShare} className="bg-primary hover:bg-primary/90">
                  Share
                </Button>
              </div>
            </div>

            {shareError && <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{shareError}</div>}
            {shareSuccess && <div className="p-3 rounded-md bg-green-500/10 text-green-500 text-sm">{shareSuccess}</div>}

            {editingDoc && editingDoc.sharedWith.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Currently shared with</Label>
                <div className="space-y-2">
                  {editingDoc.sharedWith.map((username) => (
                    <div key={username} className="flex items-center justify-between p-2 bg-secondary/50 rounded">
                      <span className="text-sm text-foreground">{username}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleUnshare(username)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setIsShareModalOpen(false)}>Done</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="sm:max-w-4xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground">{viewingDoc?.title}</DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            {viewingDoc?.fileData && (
              <img src={viewingDoc.fileData} alt={viewingDoc.title} className="max-w-full h-auto rounded-lg mx-auto" />
            )}
            <div className="flex justify-end gap-3 pt-6">
              <Button variant="outline" onClick={() => setIsImageModalOpen(false)}>Close</Button>
              {viewingDoc && (
                <Button onClick={() => handleDownload(viewingDoc)} className="bg-primary hover:bg-primary/90">
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