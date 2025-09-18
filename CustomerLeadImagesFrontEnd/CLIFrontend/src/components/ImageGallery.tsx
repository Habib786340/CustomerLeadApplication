import React, { useState, useEffect } from 'react';
import type { Profile, ProfileImageDto, ImageCountResponse } from '../types/api';
import { imageApi } from '../services/api';
import ImageUpload from './ImageUpload';
import { toast } from 'react-hot-toast';

type ViewMode = 'grid' | 'list' | 'carousel';

interface ImageGalleryProps {
    profile: Profile;
    onUploadClick: () => void;
}
const ImageGallery: React.FC<ImageGalleryProps> = ({
    profile,
}) => {
    const [images, setImages] = useState<ProfileImageDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [imageCount, setImageCount] = useState<ImageCountResponse | null>(null);
    const [loadingCount, setLoadingCount] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [showUploadPanel, setShowUploadPanel] = useState(false);

    useEffect(() => {
        loadImages();
        loadImageCount();
    }, [profile.id]);

    const loadImages = async () => {
        try {
            setLoading(true);
            const imageList = await imageApi.getByProfile(profile.profileType, profile.id);
            setImages(imageList);
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Failed to load images');
        } finally {
            setLoading(false);
        }
    };

    const loadImageCount = async () => {
        try {
            setLoadingCount(true);
            const count = await imageApi.getCount(profile.profileType, profile.id);

            const correctedCount = {
                ...count,
                remainingSlots: Math.max(0, (count.maxAllowed || 10) - (count.count || 0))
            };
            setImageCount(correctedCount);
        } catch {
            setImageCount({ count: images.length, maxAllowed: 10, remainingSlots: 10 - images.length });
        } finally {
            setLoadingCount(false);
        }
    };

    const handleDeleteImage = async (imageId: number) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            setLoading(true);
            await imageApi.delete(profile.profileType, profile.id, imageId);
            setImages(prev => prev.filter(img => img.id !== imageId));
            toast.success('Image deleted successfully!');
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Failed to delete image');
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePriority = async (imageId: number, currentPriority: boolean) => {
        try {
            setLoading(true);
            await imageApi.togglePriority(profile.profileType, profile.id, imageId, !currentPriority);
            setImages(prev => prev.map(img =>
                img.id === imageId ? { ...img, isPriority: !currentPriority } : img
            ));
            toast.success(`Image ${!currentPriority ? 'marked as' : 'removed from'} priority!`);
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Failed to update image priority');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUploadSuccess = () => {
        loadImages();
        loadImageCount();
        setShowUploadPanel(false);
    };

    const formatFileSize = (base64Data: string) => {
        try {
            const sizeInBytes = (base64Data.length * 3) / 4;
            if (sizeInBytes < 1024) return `${sizeInBytes} B`;
            if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
            return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
        } catch {
            return 'Unknown';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const renderImageCard = (image: ProfileImageDto, index: number, isPriority: boolean = false) => (
        <div
            key={image.id}
            className={`group bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-2 ${isPriority ? 'border-2 border-yellow-200' : 'border-gray-200'
                }`}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="relative aspect-square bg-gray-100 overflow-hidden">
                {(() => {
                    let imageSrc = '';
                    if (image.imageData && image.imageData.trim()) {
                        const cleanData = image.imageData.trim();
                        if (cleanData.startsWith('data:')) {
                            imageSrc = cleanData;
                        } else {
                            imageSrc = `data:${image.contentType};base64,${cleanData}`;
                        }
                    }

                    return imageSrc ? (
                        <img
                            src={imageSrc}
                            alt={image.fileName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 opacity-100"
                            loading="lazy"
                            style={{ opacity: 1, display: 'block' }}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (target.src.includes(image.contentType)) {
                                    target.src = `data:image/jpeg;base64,${image.imageData}`;
                                } else if (!target.src.includes('image/')) {
                                    target.src = `data:image/png;base64,${image.imageData}`;
                                } else {
                                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0VjE2QzE0IDE3LjEgMTMuMSAxOCA5LjkgMTlIMTQuMUMxNS4xIDE5IDE2IDE4LjEgMTYgMTdWNFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTggNkgxNlY4SDhaIiBmaWxsPSIjOUNBNEFGIi8+Cjwvc3ZnPgo=';
                                }
                            }}
                            onLoad={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.opacity = '1';
                                target.style.display = 'block';
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    );
                })()}
                {image.isPriority && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-white">
                        ⭐ PRIORITY
                    </div>
                )}
                <div className="absolute inset-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                        <button
                            onClick={() => handleTogglePriority(image.id, image.isPriority)}
                            className={`p-2 rounded-full ${image.isPriority
                                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                } transition-colors duration-200`}
                            title={image.isPriority ? 'Remove priority' : 'Set as priority'}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => handleDeleteImage(image.id)}
                            className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
                            title="Delete image"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                            {image.fileName}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(image.imageData)} • {formatDate(image.uploadedAt)}
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                            {image.isPriority && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                                    ⭐ Priority
                                </span>
                            )}
                            <span className="text-xs text-gray-500">
                                Order: {image.displayOrder}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-3 flex space-x-2">
                    <button
                        onClick={() => handleTogglePriority(image.id, image.isPriority)}
                        className={`flex-1 px-2 py-1 text-xs font-medium rounded ${image.isPriority
                            ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300'
                            : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                            }`}
                        disabled={loading}
                    >
                        {image.isPriority ? '⭐ Remove Priority' : 'Set Priority'}
                    </button>
                    <button
                        onClick={() => handleDeleteImage(image.id)}
                        className="flex-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded"
                        disabled={loading}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );

    const renderGridView = () => {
        const priorityImages = images.filter(img => img.isPriority);
        const nonPriorityImages = images.filter(img => !img.isPriority);

        return (
            <>
                {priorityImages.length > 0 && (
                    <div>
                        <div className="flex items-center mb-4">
                            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-3"></div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Priority Images ({priorityImages.length})
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
                            {priorityImages.map((image, index) => renderImageCard(image, index, true))}
                        </div>
                    </div>
                )}

                {nonPriorityImages.length > 0 && (
                    <div>
                        <div className="flex items-center mb-4">
                            <div className="w-3 h-3 rounded-full bg-gray-400 mr-3"></div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Other Images ({nonPriorityImages.length})
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
                            {nonPriorityImages.map((image, index) => renderImageCard(image, index + priorityImages.length))}
                        </div>
                    </div>
                )}
            </>
        );
    };

    const renderListView = () => (
        <div className="space-y-4">
            {images.map((image) => (
                <div key={image.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex">
                        <div className="w-32 h-32 flex-shrink-0 bg-gray-100 overflow-hidden">
                            {(() => {
                                let imageSrc = '';
                                if (image.imageData && image.imageData.trim()) {
                                    const cleanData = image.imageData.trim();
                                    if (cleanData.startsWith('data:')) {
                                        imageSrc = cleanData;
                                    } else {
                                        imageSrc = `data:${image.contentType};base64,${cleanData}`;
                                    }
                                }

                                return imageSrc ? (
                                    <img
                                        src={imageSrc}
                                        alt={image.fileName}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="flex-1 p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-gray-900">{image.fileName}</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {formatFileSize(image.imageData)} • Uploaded {formatDate(image.uploadedAt)}
                                    </p>
                                    <div className="flex items-center mt-2 space-x-2">
                                        {image.isPriority && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                ⭐ Priority
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-500">
                                            Display Order: {image.displayOrder}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                    <button
                                        onClick={() => handleTogglePriority(image.id, image.isPriority)}
                                        className={`p-2 rounded-full ${image.isPriority
                                            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            } transition-colors duration-200`}
                                        title={image.isPriority ? 'Remove priority' : 'Set as priority'}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteImage(image.id)}
                                        className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
                                        title="Delete image"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderCarouselView = () => {
        if (images.length === 0) return null;

        const currentImage = images[carouselIndex];
        return (
            <div className="relative">
                <div className="flex items-center justify-center">
                    <button
                        onClick={() => setCarouselIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                        className="absolute left-4 z-10 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="max-w-2xl mx-auto">
                        <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                            {(() => {
                                let imageSrc = '';
                                if (currentImage.imageData && currentImage.imageData.trim()) {
                                    const cleanData = currentImage.imageData.trim();
                                    if (cleanData.startsWith('data:')) {
                                        imageSrc = cleanData;
                                    } else {
                                        imageSrc = `data:${currentImage.contentType};base64,${cleanData}`;
                                    }
                                }

                                return imageSrc ? (
                                    <img
                                        src={imageSrc}
                                        alt={currentImage.fileName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                );
                            })()}
                            {currentImage.isPriority && (
                                <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg border-2 border-white">
                                    ⭐ PRIORITY IMAGE
                                </div>
                            )}
                        </div>

                        <div className="mt-6 text-center">
                            <h3 className="text-xl font-semibold text-gray-900">{currentImage.fileName}</h3>
                            <p className="text-sm text-gray-500 mt-2">
                                {formatFileSize(currentImage.imageData)} • Uploaded {formatDate(currentImage.uploadedAt)}
                            </p>
                            <div className="flex items-center justify-center mt-3 space-x-4">
                                {currentImage.isPriority && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                                        ⭐ Priority Image
                                    </span>
                                )}
                                <span className="text-sm text-gray-500">
                                    Display Order: {currentImage.displayOrder}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setCarouselIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                        className="absolute right-4 z-10 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <div className="flex justify-center mt-6 space-x-2">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCarouselIndex(index)}
                            className={`w-3 h-3 rounded-full transition-colors ${index === carouselIndex ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                        />
                    ))}
                </div>
            </div>
        );
    };

    if (loading && images.length === 0) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                        Images for {profile.name}
                    </h2>
                    <div className="flex items-center space-x-4 mt-2">
                        <div className="text-gray-600">
                            {loadingCount ? (
                                <span className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                    <span>Loading capacity...</span>
                                </span>
                            ) : (
                                <>
                                    <span className="font-semibold">
                                        {imageCount?.count || 0}/{imageCount?.maxAllowed || 10} images
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        ({(imageCount?.remainingSlots) === 0 ? 'Full' : `${imageCount?.remainingSlots} slots remaining`})
                                    </span>
                                </>
                            )}
                        </div>
                        {!loadingCount && (
                            <div className="flex items-center space-x-2">
                                <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${(imageCount?.count || 0) >= (imageCount?.maxAllowed || 10) * 0.9
                                            ? 'bg-red-500'
                                            : (imageCount?.count || 0) >= (imageCount?.maxAllowed || 10) * 0.7
                                                ? 'bg-yellow-500'
                                                : 'bg-green-500'
                                            }`}
                                        style={{
                                            width: `${Math.min(((imageCount?.count || 0) / (imageCount?.maxAllowed || 10)) * 100, 100)}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            List
                        </button>
                        <button
                            onClick={() => setViewMode('carousel')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'carousel' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Carousel
                        </button>
                    </div>
                    <button
                        onClick={() => setShowUploadPanel(!showUploadPanel)}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        {showUploadPanel ? 'Hide Upload' : 'Upload Images'}
                    </button>
                </div>
            </div>


            {showUploadPanel ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-900">Current Images</h3>
                        {images.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl">
                                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">No images yet</h4>
                                <p className="text-gray-600">
                                    Upload some images using the panel on the right to get started.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {viewMode === 'grid' && renderGridView()}
                                {viewMode === 'list' && renderListView()}
                                {viewMode === 'carousel' && renderCarouselView()}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            Upload Images for {profile.name}
                                        </h3>
                                        <p className="text-gray-600 mt-1">
                                            Add images to your {profile.profileType} profile • Maximum 10 images per profile allowed.

                                        </p>
                                        {imageCount?.remainingSlots === 0 && imageCount?.count > 0 ? (
                                            <p className="text-red-600 mt-2 font-semibold">
                                                Profile is at capacity. Uploading new images will replace non-priority images. if there are no non-priority images then no thing will be replaced.
                                            </p>
                                        ) : (
                                            <div>
                                                <h2 className="mt-2 text-lg font-semibold text-gray-800">
                                                    Current: {imageCount?.count || 0} images And remaining slots: {imageCount?.remainingSlots}
                                                </h2>
                                                <h2 className="mt-2 text-lg font-semibold text-red-600">if you select more images than  {imageCount?.remainingSlots} images for upload only the first  {imageCount?.remainingSlots} images will be uploaded. Rest will be ignored.</h2>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setShowUploadPanel(false)}
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors duration-200"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                <ImageUpload
                                    profile={profile}
                                    onSuccess={handleImageUploadSuccess}
                                    onCancel={() => setShowUploadPanel(false)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {images.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No images yet</h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                This profile doesn't have any images yet. Upload some images to get started and see them displayed here.
                            </p>
                            <button
                                onClick={() => setShowUploadPanel(true)}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Upload Your First Images
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {viewMode === 'grid' && renderGridView()}
                            {viewMode === 'list' && renderListView()}
                            {viewMode === 'carousel' && renderCarouselView()}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageGallery;