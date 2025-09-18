import React, { useState, useCallback } from 'react';
import type { Profile, UploadImagesResponse } from '../types/api';
import { imageApi, fileToBase64 } from '../services/api';
import { toast } from 'react-hot-toast';

interface ImageUploadProps {
    profile: Profile;
    onSuccess: (response: UploadImagesResponse) => void;
    onCancel: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    profile,
    onSuccess,
    onCancel,
}) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const validFiles: File[] = [];
        const errors: string[] = [];

        files.forEach(file => {
            if (!file.type.startsWith('image/')) {
                errors.push(`${file.name}: Not an image file`);
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                errors.push(`${file.name}: File size exceeds 5MB`);
                return;
            }
            validFiles.push(file);
        });

        if (validFiles.length > 10) {
            errors.push(`Cannot select more than 10 images at once. You selected ${validFiles.length} images.`);
            validFiles.splice(10);
        }

        if (errors.length > 0) {
            toast.error(errors.join('\n'));
            return;
        }

        setSelectedFiles(validFiles);

        Promise.all(validFiles.map(fileToBase64)).then(setPreviews).catch(() => {
            toast.error('Failed to create image previews');
        });
    }, []);

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            toast.error('Please select at least one image');
            return;
        }

        try {
            setUploading(true);

            const base64Images = await Promise.all(selectedFiles.map(fileToBase64));
            const fileNames = selectedFiles.map(file => file.name);

            const request = {
                Base64Images: base64Images,
                FileNames: fileNames,
            };

            const response = await imageApi.upload(profile.profileType, profile.id, request);

            if (!response.success) {
                toast.error(response.message || 'Upload failed');
            } else {
                toast.success(`${response.message} image(s)!`);
                onSuccess(response);
            }
        } catch (err) {
            const error = err as { response?: { data?: { message?: string; Message?: string } } };
            const errorData = error.response?.data;
            toast.error(errorData?.Message || errorData?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                    Select Images
                </label>
                <div className="
                    border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center
                    hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 group
                ">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                        disabled={uploading}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="text-gray-600 group-hover:text-blue-600 transition-colors duration-300">
                            <svg
                                className="mx-auto h-16 w-16 text-gray-400 group-hover:text-blue-500 mb-4"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                            >
                                <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    strokeWidth={1.5}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <p className="text-xl font-medium mb-2">
                                Drop images here or click to browse
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                PNG, JPG, GIF, WebP • Up to 5MB each • Maximum 10 images
                            </p>
                            <div className="
                                inline-flex items-center px-4 py-2 bg-white border border-gray-200
                                rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50
                                transition-colors duration-200
                            ">
                                Choose Files
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            {selectedFiles.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Selected Images ({selectedFiles.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="relative group">
                                <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
                                    {previews[index] && (
                                        <img
                                            src={`data:image/jpeg;base64,${previews[index]}`}
                                            alt={file.name}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="
                                        absolute top-1 right-1 bg-red-500 text-white rounded-full
                                        w-6 h-6 flex items-center justify-center opacity-0
                                        group-hover:opacity-100 transition-opacity
                                    "
                                    disabled={uploading}
                                >
                                    ×
                                </button>
                                <div className="mt-1 text-xs text-gray-600 truncate">
                                    {file.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {formatFileSize(file.size)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}



            <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                    onClick={onCancel}
                    className="
                        px-4 py-2 text-sm font-medium text-gray-700 bg-white
                        border border-gray-300 rounded-md hover:bg-gray-50
                    "
                    disabled={uploading}
                >
                    Cancel
                </button>
                <button
                    onClick={handleUpload}
                    disabled={selectedFiles.length === 0 || uploading}
                    className="
                        px-4 py-2 text-sm font-medium text-white bg-blue-600
                        border border-transparent rounded-md hover:bg-blue-700
                        disabled:opacity-50 disabled:cursor-not-allowed
                    "
                >
                    {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image${selectedFiles.length !== 1 ? 's' : ''}`}
                </button>
            </div>

        </div>
    );
};

export default ImageUpload;