import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Document {
  id: string;
  title: string;
  createdAt: string;
}

export function DocumentsList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const deleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/knowledge/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      // Update UI by removing the deleted document
      setDocuments(prevDocuments => 
        prevDocuments.filter(doc => doc.id !== documentId)
      );

      console.log('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Failed to delete document');
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/knowledge/documents');
  
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
  
      const data = await response.json();
      setDocuments(data.documents);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch documents:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    window.addEventListener('documentUploaded', fetchDocuments);
    return () => {
      window.removeEventListener('documentUploaded', fetchDocuments);
    };
  }, []);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {loading ? (
        <div>Loading...</div>
      ) : (
        documents.map((doc) => (
          <Card key={doc.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{doc.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Uploaded on: {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-700"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this document?')) {
                    deleteDocument(doc.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}