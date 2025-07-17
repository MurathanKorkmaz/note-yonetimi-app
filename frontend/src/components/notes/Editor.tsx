'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Button } from '@/components/ui/Button';

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 bg-white p-2">
      <div className="flex flex-wrap gap-1">
        <Button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          variant={editor.isActive('bold') ? 'default' : 'ghost'}
          size="sm"
        >
          Bold
        </Button>
        <Button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          variant={editor.isActive('italic') ? 'default' : 'ghost'}
          size="sm"
        >
          Italic
        </Button>
        <Button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
          size="sm"
        >
          Bullet List
        </Button>
        <Button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
          size="sm"
        >
          Numbered List
        </Button>
        <Button
          type="button"
          onClick={() => {
            const url = window.prompt('Enter the URL');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          variant={editor.isActive('link') ? 'default' : 'ghost'}
          size="sm"
        >
          Link
        </Button>
      </div>
    </div>
  );
};

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function Editor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-500 hover:underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <MenuBar editor={editor} />
      <div className="min-h-[200px] bg-white p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
} 