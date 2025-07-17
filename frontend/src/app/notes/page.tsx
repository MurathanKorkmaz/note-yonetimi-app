'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Container } from '@/components/ui/Container';
import NoteList, { NoteListRef } from '@/components/NoteList';
import NoteForm from '@/components/NoteForm';
import { Note } from '@/services/noteService';

type TabType = 'notes' | 'add' | 'archive';

const tabs = [
  {
    id: 'notes' as TabType,
    name: 'Notlarım',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    description: 'Ders notlarınızı görüntüleyin ve yönetin'
  },
  {
    id: 'add' as TabType,
    name: 'Yeni Not',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    description: 'Yeni ders notu ekleyin'
  },
  {
    id: 'archive' as TabType,
    name: 'Arşiv',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
    description: 'Arşivlenmiş notlarınız'
  }
];

export default function NotesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('notes');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const noteListRef = useRef<NoteListRef>(null);
  const archiveListRef = useRef<NoteListRef>(null);

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

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
    setActiveTab('add');
  };

  const handleNoteSubmit = (note: Note) => {
    setSelectedNote(null);
    setActiveTab('notes');
    // Refresh the note list
    noteListRef.current?.loadNotes();
  };

  const handleNoteCancel = () => {
    setSelectedNote(null);
    setActiveTab('notes');
  };

  const handleNoteDelete = (noteId: number) => {
    // Refresh both lists when a note is deleted
    noteListRef.current?.loadNotes();
    archiveListRef.current?.loadNotes();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notes':
        return (
          <div className="space-y-6">
            <div className="text-center py-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ders Notlarım</h2>
              <p className="text-gray-600">Tüm ders notlarınızı buradan yönetebilirsiniz</p>
            </div>
            <NoteList
              ref={noteListRef}
              onNoteSelect={handleNoteSelect}
              onNoteDelete={handleNoteDelete}
              archiveMode={false}
            />
          </div>
        );
      
      case 'add':
        return (
          <div className="space-y-6">
            <div className="text-center py-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedNote ? 'Not Düzenle' : 'Yeni Not Ekle'}
              </h2>
              <p className="text-gray-600">
                {selectedNote ? 'Mevcut notunuzu güncelleyin' : 'Yeni bir ders notu oluşturun'}
              </p>
            </div>
            <NoteForm
              note={selectedNote || undefined}
              onSubmit={handleNoteSubmit}
              onCancel={handleNoteCancel}
            />
          </div>
        );
      
      case 'archive':
        return (
          <div className="space-y-6">
            <div className="text-center py-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Arşiv</h2>
              <p className="text-gray-600">Arşivlenmiş notlarınızı geri yükleyebilir veya kalıcı olarak silebilirsiniz</p>
            </div>
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-md mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-orange-700">
                    <strong>Dikkat:</strong> Arşivden kalıcı olarak silinen notlar geri getirilemez.
                  </p>
                </div>
              </div>
            </div>
            <NoteList
              ref={archiveListRef}
              onNoteSelect={handleNoteSelect}
              onNoteDelete={handleNoteDelete}
              archiveMode={true}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <Container className="py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Ders Notları Sistemi</h1>
          <p className="text-xl text-gray-600">Notlarınızı organize edin, yönetin ve her yerden erişin</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id !== 'add') {
                      setSelectedNote(null);
                    }
                  }}
                  className={`group relative min-w-0 flex-1 overflow-hidden py-6 px-6 text-center text-sm font-semibold focus:z-10 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-orange-600 bg-orange-50 border-b-2 border-orange-500'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200 ${
                      activeTab === tab.id 
                        ? 'bg-orange-100 text-orange-600' 
                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                    }`}>
                      {tab.icon}
                    </div>
                    <span className="font-medium">{tab.name}</span>
                    <span className={`text-xs transition-colors duration-200 ${
                      activeTab === tab.id ? 'text-orange-500' : 'text-gray-400'
                    }`}>
                      {tab.description}
                    </span>
                  </div>
                  
                  {activeTab === tab.id && (
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {renderTabContent()}
        </div>
      </Container>
    </div>
  );
} 