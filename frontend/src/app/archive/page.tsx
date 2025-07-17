'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Container } from '@/components/ui/Container';
import { Input } from '@/components/ui/Input';
import { ArchivedNoteCard } from '@/components/notes/ArchivedNoteCard';

// TODO: Replace with actual API call
const MOCK_ARCHIVED_NOTES = Array.from({ length: 6 }, (_, i) => ({
  id: `archived-note-${i}`,
  title: `Archived Note ${i + 1}`,
  content: 'This is an archived note that was moved here. You can restore it or delete it permanently.',
  createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  archivedAt: new Date(Date.now() - i * 12 * 60 * 60 * 1000).toISOString(),
  hasAttachment: i % 2 === 0,
}));

export default function ArchivePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState(MOCK_ARCHIVED_NOTES);

  // Authentication guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto w-16 h-16 mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent absolute top-0"></div>
          </div>
          <p className="text-gray-600 text-lg">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Filter notes based on search query
  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRestore = async (id: string) => {
    try {
      // TODO: Implement restore API call
      console.log('Restoring note:', id);
      
      // Optimistically remove from list
      setNotes((prev) => prev.filter((note) => note.id !== id));
    } catch (error) {
      console.error('Failed to restore note:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // TODO: Implement delete API call
      console.log('Deleting note:', id);
      
      // Optimistically remove from list
      setNotes((prev) => prev.filter((note) => note.id !== id));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  return (
    <Container className="py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">Archive</h1>
        <p className="text-gray-600">
          View and manage your archived notes. You can restore notes back to your active list or delete them permanently.
        </p>
      </div>

      <div className="mb-6">
        <Input
          type="search"
          placeholder="Search archived notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {filteredNotes.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-center text-gray-500">
            {searchQuery
              ? 'No archived notes match your search'
              : 'No archived notes found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <ArchivedNoteCard
              key={note.id}
              note={note}
              onRestore={handleRestore}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </Container>
  );
} 