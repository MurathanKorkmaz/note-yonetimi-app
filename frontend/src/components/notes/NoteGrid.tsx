'use client';

import { useEffect, useRef } from 'react';
import { NoteCard } from './NoteCard';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  hasAttachment: boolean;
}

interface NoteGridProps {
  notes: Note[];
  onEdit: (id: string) => void;
  onArchive: (id: string) => void;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export function NoteGrid({
  notes,
  onEdit,
  onArchive,
  hasMore,
  isLoading,
  onLoadMore,
}: NoteGridProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  if (notes.length === 0 && !isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-gray-200">
        <p className="text-center text-gray-500">No notes found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEdit}
          onArchive={onArchive}
        />
      ))}
      
      {(hasMore || isLoading) && (
        <div
          ref={observerTarget}
          className="col-span-full flex justify-center p-4"
        >
          {isLoading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          ) : null}
        </div>
      )}
    </div>
  );
} 