'use client';

import { useEffect, useState } from 'react';
import { Editor } from './Editor';
import { FileUpload } from './FileUpload';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';

interface NoteFormProps {
  initialData?: {
    id?: string;
    title: string;
    content: string;
    attachmentUrl?: string;
  };
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

export function NoteForm({ initialData, onSubmit, onCancel }: NoteFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();

  // Otomatik kaydetme için debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title && content && !isSaving) {
        handleSave();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, content]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(undefined);

      const formData = new FormData();
      if (initialData?.id) {
        formData.append('id', initialData.id);
      }
      formData.append('title', title);
      formData.append('content', content);
      if (file) {
        formData.append('attachment', file);
      }

      await onSubmit(formData);
    } catch (err) {
      setError('Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Note' : 'New Note'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Content</label>
          <Editor content={content} onChange={setContent} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Attachment</label>
          <FileUpload
            onFileSelect={setFile}
            currentFile={initialData?.attachmentUrl}
          />
        </div>

        {error && (
          <p className="text-sm text-error-500">{error}</p>
        )}
      </CardContent>

      <CardFooter className="flex justify-end gap-2 border-t bg-gray-50 p-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!title || !content || isSaving}
          isLoading={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Note'}
        </Button>
      </CardFooter>
    </Card>
  );
} 