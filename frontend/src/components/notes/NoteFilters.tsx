'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface NoteFiltersProps {
  onSearch: (query: string) => void;
  onSort: (sortBy: 'date' | 'title') => void;
}

export function NoteFilters({ onSearch, onSort }: NoteFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  const handleSort = (newSortBy: 'date' | 'title') => {
    setSortBy(newSortBy);
    onSort(newSortBy);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full max-w-md">
        <Input
          type="search"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Sort by:</span>
        <div className="flex rounded-md border border-gray-200">
          <Button
            type="button"
            variant={sortBy === 'date' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-r-none"
            onClick={() => handleSort('date')}
          >
            Date
          </Button>
          <Button
            type="button"
            variant={sortBy === 'title' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-l-none border-l"
            onClick={() => handleSort('title')}
          >
            Title
          </Button>
        </div>
      </div>
    </div>
  );
} 