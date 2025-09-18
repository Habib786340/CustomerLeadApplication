import axios from 'axios';
import type {
    Profile,
    ProfileImageDto,
    UploadImagesRequest,
    UploadImagesResponse,
    ImageCountResponse,
} from '../types/api';

const api = axios.create({
    baseURL: 'https://localhost:7106/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        // Add any request preprocessing here
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            console.error('API Error:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('Network Error:', error.request);
        } else {

            console.error('Request Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export const profileApi = {
    getAll: async (): Promise<Profile[]> => {
        const response = await api.get<Profile[]>('/profiles');
        return response.data;
    },

    getById: async (id: number): Promise<Profile> => {
        const response = await api.get<Profile>(`/profiles/${id}`);
        return response.data;
    },

    create: async (profile: Omit<Profile, 'id' | 'createdAt' | 'images'>): Promise<Profile> => {
        const response = await api.post<Profile>('/profiles', profile);
        return response.data;
    },

    update: async (id: number, profile: Omit<Profile, 'id' | 'createdAt' | 'images'>): Promise<void> => {
        await api.put(`/profiles/${id}`, profile);
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/profiles/${id}`);
    },
};

export const imageApi = {
    getByProfile: async (profileType: string, profileId: number): Promise<ProfileImageDto[]> => {
        const response = await api.get<ProfileImageDto[]>(`/${profileType}/${profileId}/images`);
        return response.data;
    },

    upload: async (
        profileType: string,
        profileId: number,
        request: UploadImagesRequest
    ): Promise<UploadImagesResponse> => {
        const response = await api.post<UploadImagesResponse>(
            `/${profileType}/${profileId}/images`,
            request
        );
        return response.data;
    },


    delete: async (profileType: string, profileId: number, imageId: number): Promise<void> => {
        await api.delete(`/${profileType}/${profileId}/images/${imageId}`);
    },
    getCount: async (profileType: string, profileId: number): Promise<ImageCountResponse> => {
        const response = await api.get<ImageCountResponse>(`/${profileType}/${profileId}/images/count`);
        return response.data;
    },

    togglePriority: async (
        profileType: string,
        profileId: number,
        imageId: number,
        isPriority: boolean
    ): Promise<void> => {
        await api.patch(`/${profileType}/${profileId}/images/${imageId}/priority`, isPriority);
    },
};

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
    });
};

export default api;