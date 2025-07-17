'use client';

import { forwardRef, useEffect, useState, useImperativeHandle } from 'react';
import { Note, noteService } from '@/services/noteService';
import toast from 'react-hot-toast';

// Not listesi bileşeninin props tanımları
interface NoteListProps {
  onNoteSelect: (note: Note) => void;      // Not seçildiğinde çalışacak fonksiyon
  onNoteDelete?: (noteId: number) => void; // Not silindiğinde çalışacak fonksiyon
  archiveMode?: boolean;                   // Arşiv görünümünde mi çalışacak
}

export type NoteListRef = {
  loadNotes: () => void;
};

const NoteList = forwardRef<NoteListRef, NoteListProps>(({ onNoteSelect, onNoteDelete, archiveMode = false }, ref) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Notları sunucudan yükler
  // archiveMode true ise arşivdeki notları, false ise aktif notları getirir
  // Hata durumunda kullanıcıya bildirim gösterir
  const loadNotes = async () => {
    try {
      setLoading(true);
      const fetchedNotes = archiveMode 
        ? await noteService.getArchivedNotes()
        : await noteService.getNotes();
      setNotes(fetchedNotes);
    } catch (error) {
      toast.error('Notlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    loadNotes
  }));

  useEffect(() => {
    loadNotes();
  }, [archiveMode]); // archiveMode değiştiğinde notları yeniden yükle

  // Not silme işlemini gerçekleştirir
  // Arşiv modunda ise kalıcı silme, değilse soft delete yapar
  // İşlem sonucunu kullanıcıya bildirir ve listeyi günceller
  const handleDelete = async (note: Note) => {
    try {
      if (archiveMode) {
        // Arşivdeki notu kalıcı olarak sil
        await noteService.hardDeleteNote(note.id);
        toast.success('Not kalıcı olarak silindi');
      } else {
        // Notu sil (soft delete)
        await noteService.deleteNote(note.id);
        toast.success('Not silindi');
      }
      onNoteDelete?.(note.id);
      loadNotes();
    } catch (error) {
      toast.error(archiveMode ? 'Not kalıcı olarak silinemedi' : 'Not silinemedi');
    }
  };

  // Arşivdeki bir notu geri yükler
  // Başarılı olursa kullanıcıya bildirim gösterir ve listeyi günceller
  // Hata durumunda kullanıcıya bilgi verir
  const handleRestore = async (note: Note) => {
    try {
      await noteService.restoreNote(note.id);
      toast.success('Not başarıyla geri yüklendi');
      loadNotes();
    } catch (error) {
      toast.error('Not geri yüklenirken bir hata oluştu');
    }
  };

  const filteredNotes = notes.filter(note =>
    note.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent absolute top-0"></div>
        </div>
        <p className="mt-4 text-gray-600 text-sm">Notlar yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          {/* Search Input */}
          <div className="flex-1 w-full lg:max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={archiveMode ? "Arşivdeki notlarda ara..." : "Ders notlarında ara..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center space-x-3">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              archiveMode 
                ? 'bg-orange-100 text-orange-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                archiveMode ? 'bg-orange-500' : 'bg-green-500'
              }`}></div>
              {archiveMode ? 'Arşiv Görünümü' : 'Aktif Notlar'}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{filteredNotes.length} not {searchQuery && 'bulundu'}</span>
          </div>
          {searchQuery && (
            <div className="text-orange-600 font-medium">
              "{searchQuery}" için sonuçlar
            </div>
          )}
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
            {searchQuery ? (
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            ) : (
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery 
              ? 'Aramanızla eşleşen not bulunamadı' 
              : archiveMode 
                ? 'Arşivde not bulunmuyor' 
                : 'Henüz not eklenmemiş'
            }
          </h3>
          <p className="text-gray-500">
            {!searchQuery && !archiveMode && 'İlk notunuzu ekleyerek başlayın!'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`group relative bg-white rounded-xl border-2 transition-all duration-300 hover:shadow-xl ${
                archiveMode 
                  ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 hover:border-orange-300' 
                  : 'border-gray-200 hover:border-orange-300 hover:shadow-orange-100'
              }`}
            >
              {/* Card Header */}
              <div className={`p-6 ${archiveMode ? 'bg-gradient-to-r from-orange-100 to-orange-200' : 'bg-gradient-to-r from-orange-500 to-orange-600'} rounded-t-xl`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-lg truncate ${archiveMode ? 'text-orange-800' : 'text-white'}`}>
                      {note.courseName}
                    </h3>
                    <p className={`text-sm mt-1 ${archiveMode ? 'text-orange-600' : 'text-orange-100'}`}>
                      {new Date(note.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${archiveMode ? 'bg-orange-200' : 'bg-white bg-opacity-20'}`}>
                    <svg className={`w-5 h-5 ${archiveMode ? 'text-orange-600' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {note.description}
                </p>

                {/* File attachment indicator */}
                {note.filePath && (
                  <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-lg border">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="text-sm text-gray-700 font-medium">Dosya Eki</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Son güncelleme: {note.updatedAt ? new Date(note.updatedAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {archiveMode ? (
                      <>
                        <button
                          onClick={() => handleRestore(note)}
                          className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-200"
                          title="Geri Yükle"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(note)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                          title="Sil"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            onNoteSelect(note);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-200"
                          title="Düzenle"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(note)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                          title="Sil"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Archive indicator */}
              {archiveMode && (
                <div className="absolute top-3 right-3">
                  <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Arşiv
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

NoteList.displayName = 'NoteList';

export default NoteList; 