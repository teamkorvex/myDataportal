import { useCallback, useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Document } from '@/types';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB max file size

export function useDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadDocuments = useCallback(async () => {
    if (!user) {
      setDocuments([]);
      return;
    }

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .or(`user_id.eq.${user.id},shared_with.cs.{"${user.username}"}`);

    if (error) {
      console.error('Error loading documents:', error);
      return;
    }

    const formattedDocs: Document[] = (data || []).map(doc => ({
      id: doc.id,
      userId: doc.user_id,
      title: doc.title,
      content: doc.content || '',
      type: doc.type,
      fileType: doc.file_type,
      fileData: doc.file_data,
      fileName: doc.file_name,
      fileSize: doc.file_size,
      sharedWith: doc.shared_with || [],
      isPublic: doc.is_public || false,
      updatedAt: doc.updated_at,
      createdAt: doc.created_at,
    }));

    setDocuments(formattedDocs);
  }, [user]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    
    const query = searchQuery.toLowerCase();
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(query) ||
      doc.content.toLowerCase().includes(query)
    );
  }, [documents, searchQuery]);

  const createDocument = useCallback(async (title: string, content: string): Promise<Document | null> => {
    if (!user) {
      toast.error('User not authenticated');
      return null;
    }

    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        title,
        content,
        type: 'text',
        shared_with: [],
        is_public: false,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create document: ' + error.message);
      return null;
    }

    const newDoc: Document = {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      content: data.content || '',
      type: data.type,
      sharedWith: data.shared_with || [],
      isPublic: data.is_public || false,
      updatedAt: data.updated_at,
      createdAt: data.created_at,
    };

    setDocuments(prev => [...prev, newDoc]);
    toast.success('Document created successfully');
    return newDoc;
  }, [user]);

  const updateDocument = useCallback(async (id: string, updates: Partial<Document>): Promise<Document | null> => {
    if (!user) return null;

    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.sharedWith !== undefined) dbUpdates.shared_with = updates.sharedWith;
    if (updates.isPublic !== undefined) dbUpdates.is_public = updates.isPublic;

    const { data, error } = await supabase
      .from('documents')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast.error('Failed to update document: ' + error.message);
      return null;
    }

    const updatedDoc: Document = {
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
      isPublic: data.is_public || false,
      updatedAt: data.updated_at,
      createdAt: data.created_at,
    };

    setDocuments(prev => prev.map(d => d.id === id ? updatedDoc : d));
    return updatedDoc;
  }, [user]);

  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete document: ' + error.message);
      return false;
    }

    setDocuments(prev => prev.filter(d => d.id !== id));
    toast.success('Document deleted successfully');
    return true;
  }, [user]);

  const shareDocument = useCallback(async (id: string, username: string): Promise<boolean> => {
    if (!user) return false;

    const doc = documents.find(d => d.id === id);
    if (!doc) return false;

    if (doc.sharedWith.includes(username)) return true;

    const updatedSharedWith = [...doc.sharedWith, username];
    const result = await updateDocument(id, { sharedWith: updatedSharedWith });
    return !!result;
  }, [user, documents, updateDocument]);

  const unshareDocument = useCallback(async (id: string, username: string): Promise<boolean> => {
    if (!user) return false;

    const doc = documents.find(d => d.id === id);
    if (!doc) return false;

    const updatedSharedWith = doc.sharedWith.filter(u => u !== username);
    const result = await updateDocument(id, { sharedWith: updatedSharedWith });
    return !!result;
  }, [user, documents, updateDocument]);

  const uploadFile = useCallback(async (file: File): Promise<Document | null> => {
    if (!user) {
      toast.error('User not authenticated');
      return null;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only images and TXT files are allowed');
      return null;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 5MB');
      return null;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        const fileData = reader.result as string;
        
        const { data, error } = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            title: file.name,
            content: '',
            type: 'file',
            file_type: file.type,
            file_data: fileData,
            file_name: file.name,
            file_size: file.size,
            shared_with: [],
            is_public: false,
          })
          .select()
          .single();

        if (error) {
          toast.error('Failed to upload file: ' + error.message);
          resolve(null);
          return;
        }

        const newDoc: Document = {
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
          isPublic: data.is_public || false,
          updatedAt: data.updated_at,
          createdAt: data.created_at,
        };

        setDocuments(prev => [...prev, newDoc]);
        toast.success('File uploaded successfully');
        resolve(newDoc);
      };
      
      reader.onerror = () => {
        toast.error('Failed to read file');
        resolve(null);
      };
      
      reader.readAsDataURL(file);
    });
  }, [user]);

  const getDocumentById = useCallback((id: string): Document | null => {
    return documents.find(doc => doc.id === id) || null;
  }, [documents]);

  const isDocumentOwner = useCallback((docId: string): boolean => {
    if (!user) return false;
    const doc = documents.find(d => d.id === docId);
    return doc ? doc.userId === user.id : false;
  }, [documents, user]);

  return {
    documents,
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
    isDocumentOwner,
  };
}