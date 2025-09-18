
export interface Profile {
    id: number;
    profileType: string;
    name: string;
    email: string;
    createdAt: string;
    images?: ProfileImage[];
}

export interface ProfileImage {
    id: number;
    profileId: number;
    imageData: string;
    fileName: string;
    contentType: string;
    uploadedAt: string;
    displayOrder: number;
    isPriority: boolean;
    profile?: Profile;
}

export interface ProfileImageDto {
    id: number;
    profileId: number;
    imageData: string;
    fileName: string;
    contentType: string;
    uploadedAt: string;
    displayOrder: number;
    isPriority: boolean;
}

export interface UploadImagesRequest {
    Base64Images: string[];
    FileNames: string[];
}


export interface UploadImagesResponse {
    success: boolean;
    message: string;
    ImagesUploaded: number;
    RemainingSlots: number;
    Images: ProfileImageDto[];
}

export interface ImageCountResponse {
    count: number;
    maxAllowed: number;
    remainingSlots: number;
}

export interface PriorityToggleRequest {
    isPriority: boolean;
}