import React, { useState, useEffect } from 'react';
import type { Profile, ImageCountResponse } from '../types/api';
import { imageApi } from '../services/api';

interface ProfileListProps {
    profiles: Profile[];
    onSelectProfile: (profile: Profile) => void;
    onCreateProfile: () => void;
    onEditProfile: (profile: Profile) => void;
    onDeleteProfile: (profileId: number) => void;
}


const ProfileList: React.FC<ProfileListProps> = ({
    profiles,
    onSelectProfile,
    onCreateProfile,
    onEditProfile,
    onDeleteProfile,
}) => {
    const [imageCounts, setImageCounts] = useState<Record<number, ImageCountResponse>>({});
    const [loadingCounts, setLoadingCounts] = useState<Set<number>>(new Set());

    useEffect(() => {
        const loadImageCounts = async () => {
            const newCounts: Record<number, ImageCountResponse> = {};
            const loadingSet = new Set<number>();

            for (const profile of profiles) {
                loadingSet.add(profile.id);
                try {
                    const count = await imageApi.getCount(profile.profileType, profile.id);
                    const correctedCount = {
                        ...count,
                        remainingSlots: Math.max(0, (count.maxAllowed || 10) - (count.count || 0))
                    };
                    newCounts[profile.id] = correctedCount;
                } catch {
                    const fallbackCount = profile.images?.length || 0;
                    newCounts[profile.id] = {
                        count: fallbackCount,
                        maxAllowed: 10,
                        remainingSlots: Math.max(0, 10 - fallbackCount)
                    };
                }
            }

            setImageCounts(newCounts);
            setLoadingCounts(new Set());
        };

        if (profiles.length > 0) {
            loadImageCounts();
        }
    }, [profiles]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const groupedProfiles = profiles.reduce((acc, profile) => {
        if (!acc[profile.profileType]) {
            acc[profile.profileType] = [];
        }
        acc[profile.profileType].push(profile);
        return acc;
    }, {} as Record<string, typeof profiles>);


    const renderProfileSection = (profileType: string, profiles: typeof groupedProfiles[string]) => (
        <div key={profileType} className="mb-10">
            <div className="flex items-center mb-6">
                <div className={`w-3 h-3 rounded-full mr-3 ${profileType === 'customer' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                <h3 className="text-xl font-semibold text-gray-900 capitalize">
                    {profileType}s
                </h3>
                <span className="ml-2 px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                    {profiles.length}
                </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {profiles.map((profile, index) => (
                    <div
                        key={profile.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-lg font-semibold text-gray-900 truncate mb-1">
                                        {profile.name}
                                    </h4>
                                    <p className="text-sm text-gray-600 truncate mb-3">{profile.email}</p>
                                    <div className="flex items-center space-x-3">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${profile.profileType === 'customer'
                                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
                                            : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800'
                                            }`}>
                                            <div className={`w-2 h-2 rounded-full mr-2 ${profile.profileType === 'customer' ? 'bg-green-500' : 'bg-blue-500'
                                                }`}></div>
                                            {profile.profileType}
                                        </span>
                                        {loadingCounts.has(profile.id) ? (
                                            <div className="flex items-center space-x-1">
                                                <div className="w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                                <span className="text-xs text-gray-500">Loading...</span>
                                            </div>
                                        ) : (
                                            <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                                                <span className="text-sm font-semibold text-blue-800">
                                                    {imageCounts[profile.id]?.count || 0}/{imageCounts[profile.id]?.maxAllowed || 10} images
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-shrink-0 ml-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">
                                            {profile.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                    Created {formatDate(profile.createdAt)}
                                </span>
                            </div>

                            <div className="mt-4 flex space-x-2">
                                <button
                                    onClick={() => onSelectProfile(profile)}
                                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    View Images
                                </button>
                                <button
                                    onClick={() => onEditProfile(profile)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                    title="Edit profile"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => onDeleteProfile(profile.id)}
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                    title="Delete profile"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Profiles</h2>
                    <p className="text-gray-600 mt-1">Manage your customer and lead profiles</p>
                </div>
                <button
                    onClick={onCreateProfile}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Profile
                </button>
            </div>

            {profiles.length === 0 ? (
                <div className="text-center py-16">
                    <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No profiles yet</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Get started by creating your first customer or lead profile. You can upload images and manage them once you have profiles set up.
                    </p>
                    <button
                        onClick={onCreateProfile}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Your First Profile
                    </button>
                </div>
            ) : (
                <div>
                    {groupedProfiles.customer && renderProfileSection('customer', groupedProfiles.customer)}
                    {groupedProfiles.lead && renderProfileSection('lead', groupedProfiles.lead)}

                    {Object.keys(groupedProfiles).filter(type => !['customer', 'lead'].includes(type)).map(type =>
                        renderProfileSection(type, groupedProfiles[type])
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfileList;