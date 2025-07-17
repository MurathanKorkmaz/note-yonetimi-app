'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Note, noteService, CreateNoteRequest } from '@/services/noteService';
import toast from 'react-hot-toast';

interface NoteFormProps {
    note?: Note;
    onSubmit?: (note: Note) => void;
    onCancel?: () => void;
}

export default function NoteForm({ note, onSubmit, onCancel }: NoteFormProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        courseName: '',
        description: '',
        filePath: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState({
        courseName: '',
        description: ''
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [existingFileName, setExistingFileName] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (note) {
            setFormData({
                courseName: note.courseName,
                description: note.description,
                filePath: note.filePath || '',
            });
            if (note.filePath) {
                const fileName = note.filePath.split('/').pop() || 'Mevcut Dosya';
                const cleanFileName = fileName.includes('_') ? fileName.split('_').slice(1).join('_') : fileName;
                setExistingFileName(cleanFileName);
            } else {
                setExistingFileName('');
            }
        } else {
            setFormData({
                courseName: '',
                description: '',
                filePath: ''
            });
            setSelectedFile(null);
            setUploadProgress(0);
            setExistingFileName('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setFormErrors({
                courseName: '',
                description: ''
            });
            setError(null);
        }
    }, [note]);

    // Form alanlarının doğruluğunu kontrol eder
    // Ders adı minimum 3 karakter, açıklama minimum 10 karakter olmalıdır
    const validateForm = () => {
        const errors = {
            courseName: '',
            description: ''
        };
        
        if (formData.courseName.trim().length < 3) {
            errors.courseName = 'Ders adı en az 3 karakter olmalıdır';
        }
        
        if (formData.description.trim().length < 10) {
            errors.description = 'Açıklama en az 10 karakter olmalıdır';
        }

        setFormErrors(errors);
        return !errors.courseName && !errors.description;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (formErrors[name as keyof typeof formErrors]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Dosya seçildiğinde çalışır
    // Dosya boyutu kontrolü yapar (maksimum 5MB)
    // Geçerli dosya seçilirse state'i günceller
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('Dosya boyutu 5MB\'dan büyük olamaz');
                return;
            }
            setSelectedFile(file);
            setUploadProgress(0);
        }
    };

    // Dosya kaldırma işlemini gerçekleştirir
    // Tüm dosya ile ilgili state'leri temizler
    // Dosya input alanını sıfırlar
    const handleFileRemove = () => {
        setSelectedFile(null);
        setFormData(prev => ({ ...prev, filePath: '' }));
        setExistingFileName(''); // Mevcut dosya adını da temizle
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        toast.success('Dosya kaldırıldı');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Lütfen form hatalarını düzeltin');
            return;
        }

        if (!user?.id) {
            toast.error('Kullanıcı bilgileri bulunamadı');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let filePath = formData.filePath;

            if (selectedFile) {
                filePath = await noteService.uploadFile(selectedFile);
                setUploadProgress(100);
            }

            const noteData: CreateNoteRequest = {
                courseName: formData.courseName,
                description: formData.description,
                filePath,
                userId: user.id
            };

            let savedNote: Note;
            if (note?.id) {
                savedNote = await noteService.updateNote(note.id, {
                    id: note.id,
                    ...formData,
                    filePath,
                    userId: user.id,
                    createdAt: note.createdAt,
                    updatedAt: new Date().toISOString()
                });
                toast.success('Not başarıyla güncellendi');
            } else {
                savedNote = await noteService.createNote(noteData);
                toast.success('Not başarıyla oluşturuldu');
            }
            onSubmit?.(savedNote);
            if (!note?.id) {
                setFormData({ courseName: '', description: '', filePath: '' });
                setSelectedFile(null);
                setUploadProgress(0);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        } catch (err) {
            console.error('Not kaydetme hatası:', err);
            const errorMessage = err instanceof Error ? err.message : 'Not kaydedilirken bir hata oluştu';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-xl p-6 text-white">
                <div className="flex items-center space-x-3">
                    <div className="bg-white bg-opacity-20 rounded-full p-2">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{note ? 'Not Güncelle' : 'Yeni Not Ekleme'}</h2>
                        <p className="text-orange-100 text-sm">Ders notlarınızı organize edin</p>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="bg-white rounded-b-xl shadow-xl border border-gray-100">
                {error && (
                    <div className="mx-6 mt-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Fields */}
                <div className="p-6 space-y-8">
                    {/* Ders Adı */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-orange-600 font-bold text-sm">1</span>
                            </div>
                            <label htmlFor="courseName" className="text-lg font-semibold text-gray-900">
                                Ders Adı
                            </label>
                        </div>
                        <div className="ml-10">
                            
                            <input
                                type="text"
                                id="courseName"
                                name="courseName"
                                value={formData.courseName}
                                onChange={handleChange}
                                required
                                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                                    formErrors.courseName 
                                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                                        : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
                                } text-gray-900 placeholder-gray-500`}
                                placeholder="Örn: Veri Yapıları ve Algoritmalar"
                            />
                            {formErrors.courseName && (
                                <p className="mt-2 text-red-500 text-sm flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {formErrors.courseName}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Açıklama */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-orange-600 font-bold text-sm">2</span>
                            </div>
                            <label htmlFor="description" className="text-lg font-semibold text-gray-900">
                                Açıklama
                            </label>
                        </div>
                        <div className="ml-10">
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={5}
                                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                                    formErrors.description 
                                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                                        : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
                                } text-gray-900 placeholder-gray-500 resize-none`}
                                placeholder="Ders notlarınızın detayını buraya yazın..."
                            />
                            {formErrors.description && (
                                <p className="mt-2 text-red-500 text-sm flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {formErrors.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Dosya Ekleme */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-orange-600 font-bold text-sm">3</span>
                            </div>
                            <label className="text-lg font-semibold text-gray-900">
                                Dosya (PDF, Word, vb.)
                            </label>
                        </div>
                        <div className="ml-10">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.ppt,.pptx"
                            />
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                                <div className="space-y-4">
                                    <div className="flex justify-center">
                                        <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all duration-200"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            Dosya Seç
                                        </button>
                                        <p className="mt-2 text-sm text-gray-500">
                                            PDF, Word, PowerPoint dosyaları kabul edilir (Max: 5MB)
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {(selectedFile || existingFileName) && (
                                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm text-green-700 font-medium">
                                            {selectedFile ? selectedFile.name : existingFileName}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleFileRemove}
                                        className="ml-3 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200"
                                        title="Dosyayı Kaldır"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                            {uploadProgress > 0 && uploadProgress < 100 && (
                                <div className="mt-3">
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Yükleniyor...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tarih Bilgileri */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-orange-600 font-bold text-sm">4</span>
                            </div>
                            <label className="text-lg font-semibold text-gray-900">
                                Tarih Bilgileri
                            </label>
                        </div>
                        <div className="ml-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                <div className="flex items-center space-x-2 mb-2">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">Eklenme Tarihi</span>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    {note?.createdAt ? new Date(note.createdAt).toLocaleDateString('tr-TR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : 'Otomatik olarak eklenecek'}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                <div className="flex items-center space-x-2 mb-2">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">Güncelleme Tarihi</span>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    {note?.updatedAt ? new Date(note.updatedAt).toLocaleDateString('tr-TR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : 'Otomatik olarak güncellenecek'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-200 font-medium"
                    >
                        İptal
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {loading && (
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {loading ? 'Kaydediliyor...' : (note ? 'Güncelle' : 'Kaydet')}
                    </button>
                </div>
            </form>
        </div>
    );
} 