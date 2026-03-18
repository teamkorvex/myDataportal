import { useCallback, useState, useEffect, useMemo } from 'react';
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

    const storedDocs = localStorage.getItem('dataportal_documents');
    if (storedDocs) {
      const allDocs: Document[] = JSON.parse(storedDocs);
      // Get user's own documents + documents shared with them
      const userDocs = allDocs.filter(doc => 
        doc.userId === user.id || 
        doc.sharedWith.includes(user.username)
      );
      setDocuments(userDocs);
    }
  }, [user]);

  const saveDocuments = useCallback((docs: Document[]) => {
    localStorage.setItem('dataportal_documents', JSON.stringify(docs));
  }, []);

  // Filtered documents based on search query
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    
    const query = searchQuery.toLowerCase();
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(query) ||
      doc.content.toLowerCase().includes(query)
    );
  }, [documents, searchQuery]);

  const createDocument = useCallback((title: string, content: string): Document => {
    if (!user) throw new Error('User not authenticated');

    const newDoc: Document = {
      id: Date.now().toString(),
      userId: user.id,
      title,
      content,
      type: 'text',
      sharedWith: [],
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const storedDocs = localStorage.getItem('dataportal_documents');
    const allDocs: Document[] = storedDocs ? JSON.parse(storedDocs) : [];
    const updatedDocs = [...allDocs, newDoc];
    
    saveDocuments(updatedDocs);
    setDocuments(prev => [...prev, newDoc]);
    
    return newDoc;
  }, [user, saveDocuments]);

  const updateDocument = useCallback((id: string, updates: Partial<Document>): Document | null => {
    if (!user) return null;

    const storedDocs = localStorage.getItem('dataportal_documents');
    if (!storedDocs) return null;

    const allDocs: Document[] = JSON.parse(storedDocs);
    const docIndex = allDocs.findIndex(doc => doc.id === id);
    
    if (docIndex === -1) return null;

    // Check if user has permission (owner or shared with edit access)
    const doc = allDocs[docIndex];
    const isOwner = doc.userId === user.id;
    const isShared = doc.sharedWith.includes(user.username);
    
    if (!isOwner && !isShared) return null;

    const updatedDoc = {
      ...doc,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    allDocs[docIndex] = updatedDoc;
    saveDocuments(allDocs);
    
    setDocuments(prev => 
      prev.map(d => d.id === id ? updatedDoc : d)
    );
    
    return updatedDoc;
  }, [user, saveDocuments]);

  const deleteDocument = useCallback((id: string): boolean => {
    if (!user) return false;

    const storedDocs = localStorage.getItem('dataportal_documents');
    if (!storedDocs) return false;

    const allDocs: Document[] = JSON.parse(storedDocs);
    const doc = allDocs.find(d => d.id === id);
    
    // Only owner can delete
    if (!doc || doc.userId !== user.id) return false;

    const filteredDocs = allDocs.filter(d => d.id !== id);
    
    saveDocuments(filteredDocs);
    setDocuments(prev => prev.filter(d => d.id !== id));
    
    return true;
  }, [user, saveDocuments]);

  const shareDocument = useCallback((id: string, username: string): boolean => {
    if (!user) return false;

    const storedDocs = localStorage.getItem('dataportal_documents');
    if (!storedDocs) return false;

    const allDocs: Document[] = JSON.parse(storedDocs);
    const docIndex = allDocs.findIndex(doc => doc.id === id);
    
    if (docIndex === -1) return false;

    const doc = allDocs[docIndex];
    
    // Only owner can share
    if (doc.userId !== user.id) return false;
    
    // Check if already shared
    if (doc.sharedWith.includes(username)) return true;

    const updatedDoc = {
      ...doc,
      sharedWith: [...doc.sharedWith, username],
      updatedAt: new Date().toISOString(),
    };
    
    allDocs[docIndex] = updatedDoc;
    saveDocuments(allDocs);
    
    setDocuments(prev => 
      prev.map(d => d.id === id ? updatedDoc : d)
    );
    
    return true;
  }, [user, saveDocuments]);

  const unshareDocument = useCallback((id: string, username: string): boolean => {
    if (!user) return false;

    const storedDocs = localStorage.getItem('dataportal_documents');
    if (!storedDocs) return false;

    const allDocs: Document[] = JSON.parse(storedDocs);
    const docIndex = allDocs.findIndex(doc => doc.id === id);
    
    if (docIndex === -1) return false;

    const doc = allDocs[docIndex];
    
    // Only owner can unshare
    if (doc.userId !== user.id) return false;

    const updatedDoc = {
      ...doc,
      sharedWith: doc.sharedWith.filter(u => u !== username),
      updatedAt: new Date().toISOString(),
    };
    
    allDocs[docIndex] = updatedDoc;
    saveDocuments(allDocs);
    
    setDocuments(prev => 
      prev.map(d => d.id === id ? updatedDoc : d)
    );
    
    return true;
  }, [user, saveDocuments]);

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
      
      reader.onload = () => {
        const fileData = reader.result as string;
        
        const newDoc: Document = {
          id: Date.now().toString(),
          userId: user.id,
          title: file.name,
          content: '',
          type: 'file',
          fileType: file.type,
          fileData: fileData,
          fileName: file.name,
          fileSize: file.size,
          sharedWith: [],
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        const storedDocs = localStorage.getItem('dataportal_documents');
        const allDocs: Document[] = storedDocs ? JSON.parse(storedDocs) : [];
        const updatedDocs = [...allDocs, newDoc];
        
        saveDocuments(updatedDocs);
        setDocuments(prev => [...prev, newDoc]);
        
        resolve(newDoc);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }, [user, saveDocuments]);

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
