import axios from 'axios';

const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/Notes`;
const UPLOAD_URL = `${API_URL}/upload`;



export interface Note {
    id: number;
    courseName: string;
    description: string;
    filePath?: string;
    userId: string;
    createdAt: string;
    updatedAt?: string;
    deletedAt?: string;
}

export interface CreateNoteRequest {
    courseName: string;
    description: string;
    filePath?: string;
    userId: string;
}

export interface ApiError {
    message: string;
    statusCode?: number;
}

interface AxiosErrorResponse {
    response?: {
        data?: {
            message?: string;
        };
        status?: number;
    };
}

const handleAxiosError = (error: unknown): never => {
    const axiosError = error as AxiosErrorResponse;
    
    // Hata detaylarını konsola yazdır - Geliştirme sürecinde hata ayıklama için kullanışlı
    if (axiosError.response) {
        console.error('API Error:', axiosError.response.status, axiosError.response.data);
    } else {
        console.error('Network Error:', axiosError);
    }
    
    const errorMessage = axiosError.response?.data?.message || 'Sunucu ile iletişim kurulamadı';
    const statusCode = axiosError.response?.status;
    
    if (statusCode === 404) {
        throw new Error('Not bulunamadı');
    } else if (statusCode === 401) {
        throw new Error('Bu işlem için yetkiniz yok');
    } else if (statusCode === 400) {
        throw new Error(errorMessage);
    }
    
    throw new Error(errorMessage);
};

export const noteService = {
    async uploadFile(file: File): Promise<string> {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post<{ filePath: string }>(UPLOAD_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data.filePath;
        } catch (error) {
            throw handleAxiosError(error);
        }
    },

    async getNotes(): Promise<Note[]> {
        try {
            const response = await axios.get<Note[]>(API_URL);
            return response.data;
        } catch (error) {
            throw handleAxiosError(error);
        }
    },

    async getNote(id: number): Promise<Note> {
        try {
            const response = await axios.get<Note>(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw handleAxiosError(error);
        }
    },

    async createNote(note: CreateNoteRequest): Promise<Note> {
        try {
            const response = await axios.post<Note>(API_URL, note);
            return response.data;
        } catch (error) {
            throw handleAxiosError(error);
        }
    },

    async updateNote(id: number, note: Partial<Note>): Promise<Note> {
        try {
            const response = await axios.put<Note>(`${API_URL}/${id}`, note);
            return response.data;
        } catch (error) {
            throw handleAxiosError(error);
        }
    },

    async deleteNote(id: number): Promise<void> {
        try {
            await axios.delete(`${API_URL}/${id}`);
        } catch (error) {
            throw handleAxiosError(error);
        }
    },

    // Arşivdeki notları listeler - Silinmiş (DeletedAt != null) notları getirir
    getArchivedNotes: async (): Promise<Note[]> => {
        const response = await axios.get(`${API_URL}/archived`);
        return response.data;
    },

    // Arşivdeki bir notu geri yükler - DeletedAt alanını null yapar
    restoreNote: async (id: number): Promise<Note> => {
        const response = await axios.post(`${API_URL}/${id}/restore`);
        return response.data;
    },

    // Notu veritabanından tamamen siler - Bu işlem geri alınamaz
    hardDeleteNote: async (id: number): Promise<void> => {
        try {
            await axios.delete(`${API_URL}/${id}/permanent`);
        } catch (error) {
            throw handleAxiosError(error);
        }
    }
};

export default noteService;