'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ArchivedNoteCardProps {
  note: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    archivedAt: string;
    hasAttachment: boolean;
  };
  onRestore: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ArchivedNoteCard({ note, onRestore, onDelete }: ArchivedNoteCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const timeAgo = formatDistanceToNow(new Date(note.archivedAt), { addSuffix: true });

  const handleRestore = async () => {
    try {
      setIsLoading(true);
      await onRestore(note.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this note? This action cannot be undone.')) {
      return;
    }

    try {
      setIsLoading(true);
      await onDelete(note.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="group flex h-full flex-col bg-gray-50 transition-shadow hover:shadow-lg">
      <CardHeader className="flex-none space-y-2 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="line-clamp-1 text-lg text-gray-700">{note.title}</CardTitle>
            <p className="text-xs text-gray-500">Archived {timeAgo}</p>
          </div>
          {note.hasAttachment && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              📎
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <p className="line-clamp-3 text-sm text-gray-600">{note.content}</p>
      </CardContent>

      <CardFooter className="flex-none border-t border-gray-200 pt-4">
        <div className="flex w-full justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRestore}
            disabled={isLoading}
          >
            Restore
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-error-500 hover:bg-error-50 hover:text-error-600"
            onClick={handleDelete}
            disabled={isLoading}
          >
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 