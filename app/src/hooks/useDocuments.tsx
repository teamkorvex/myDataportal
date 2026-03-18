import { useCallback, useState, useEffect, useMemo } from 'react';
import { documentAPI } from '@/services/api';
import type { Document } from '@/types';
import { useAuth } from './useAuth';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB max file size

export function useDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load documents for current user (including shared ones)
  useEffect(() => {
    if (!user) {
      setDocuments([]);
      return;
    }

    const loadDocuments = async () => {
      try {
        const docs = await documentAPI.getByUser(user.id);
        setDocuments(docs);
      } catch (error) {
        console.error('Failed to load documents:', error);
        setDocuments([]);
      }
    };

    loadDocuments();
  }, [user]);

  // Filtered documents based on search query
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    
    const query = searchQuery.toLowerCase();
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(query) ||
      doc.content.toLowerCase().includes(query)
    );
  }, [documents, searchQuery]);

  const createDocument = useCallback(async (title: string, content: string): Promise<Document | null> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const newDoc = await documentAPI.create({
        userId: user.id,
        title,
        content,
        type: 'text',
        sharedWith: []
      });
      
      setDocuments(prev => [...prev, newDoc]);
      return newDoc;
    } catch (error) {
      console.error('Failed to create document:', error);
      throw error;
    }
  }, [user]);

  const updateDocument = useCallback(async (id: string, updates: Partial<Document>): Promise<Document | null> => {
    if (!user) return null;

    try {
      const updatedDoc = await documentAPI.update(id, updates);
      
      setDocuments(prev => 
        prev.map(doc => doc.id === id ? updatedDoc : doc)
      );
      
      return updatedDoc;
    } catch (error) {
      console.error('Failed to update document:', error);
      return null;
    }
  }, [user]);

  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      await documentAPI.delete(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      return true;
    } catch (error) {
      console.error('Failed to delete document:', error);
      return false;
    }
  }, [user]);

  const shareDocument = useCallback(async (id: string, username: string): Promise<boolean> => {
    if (!user) return false;

    try {
      await documentAPI.share(id, username);
      
      // Refresh documents to get updated sharedWith list
      const docs = await documentAPI.getByUser(user.id);
      setDocuments(docs);
      
      return true;
    } catch (error) {
      console.error('Failed to share document:', error);
      return false;
    }
  }, [user]);

  const unshareDocument = useCallback(async (id: string, username: string): Promise<boolean> => {
    if (!user) return false;

    try {
      await documentAPI.unshare(id, username);
      
      // Refresh documents to get updated sharedWith list
      const docs = await documentAPI.getByUser(user.id);
      setDocuments(docs);
      
      return true;
    } catch (error) {
      console.error('Failed to unshare document:', error);
      return false;
    }
  }, [user]);

  const uploadFile = useCallback(async (file: File): Promise<Document | null> => {
    if (!user) throw new Error('User not authenticated');

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only images (JPEG, PNG, GIF, WebP) and TXT files are allowed');
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size must be less than 5MB');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const fileData = reader.result as string;
          
          const newDoc = await documentAPI.create({
            userId: user.id,
            title: file.name,
            content: '',
            type: 'file',
            fileType: file.type,
            fileData: fileData,
            fileName: file.name,
            fileSize: file.size,
            sharedWith: []
          });
          
          setDocuments(prev => [...prev, newDoc]);
          resolve(newDoc);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
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
