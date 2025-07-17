'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';

interface NoteCardProps {
  note: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    hasAttachment: boolean;
  };
  onEdit: (id: string) => void;
  onArchive: (id: string) => void;
}

export function NoteCard({ note, onEdit, onArchive }: NoteCardProps) {
  const timeAgo = formatDistanceToNow(new Date(note.createdAt), { addSuffix: true });

  return (
    <Card className="group flex h-full flex-col transition-shadow hover:shadow-lg">
      <CardHeader className="flex-none space-y-2 pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="line-clamp-1 text-lg">{note.title}</CardTitle>
          {note.hasAttachment && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 text-primary-500">
              📎
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">{timeAgo}</p>
      </CardHeader>

      <CardContent className="flex-grow">
        <p className="line-clamp-4 text-sm text-gray-600">{note.content}</p>
      </CardContent>

      <CardFooter className="flex-none border-t border-gray-100 pt-4 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex w-full justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onArchive(note.id)}
          >
            Archive
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(note.id)}
          >
            Edit
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 