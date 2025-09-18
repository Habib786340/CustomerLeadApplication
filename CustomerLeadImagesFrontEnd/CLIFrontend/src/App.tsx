import { useState, useEffect } from 'react';
import type { Profile } from './types/api';
import ProfileList from './components/ProfileList';
import { profileApi } from './services/api';
import ImageGallery from './components/ImageGallery';
import ImageUpload from './components/ImageUpload';
import ProfileForm from './components/ProfileForm';
import { Toaster, toast } from 'react-hot-toast';

function App() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'images'>('list');
  const [loading, setLoading] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageGalleryKey, setImageGalleryKey] = useState(0);

  useEffect(() => {
    loadProfiles();
  }, []);


  const loadProfiles = async () => {
    try {
      setLoading(true);
      const allProfiles = await profileApi.getAll();
      setProfiles(allProfiles);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async (profileData: Omit<Profile, 'id' | 'createdAt' | 'images'>) => {
    try {
      setLoading(true);
      const newProfile = await profileApi.create(profileData);
      setProfiles(prev => [...prev, newProfile]);
      setShowProfileForm(false);
      toast.success(`Profile "${newProfile.name}" created successfully!`);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (profileData: Omit<Profile, 'id' | 'createdAt' | 'images'>) => {
    if (!editingProfile) return;

    try {
      setLoading(true);
      await profileApi.update(editingProfile.id, profileData);
      setProfiles(prev => prev.map(p =>
        p.id === editingProfile.id
          ? { ...p, ...profileData }
          : p
      ));
      setShowProfileForm(false);
      setEditingProfile(null);
      toast.success(`Profile "${profileData.name}" updated successfully!`);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async (profileId: number) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;

    try {
      setLoading(true);
      await profileApi.delete(profileId);
      setProfiles(prev => prev.filter(p => p.id !== profileId));
      if (selectedProfile?.id === profileId) {
        setSelectedProfile(null);
        setCurrentView('list');
      }
      toast.success('Profile deleted successfully!');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to delete profile');
    } finally {
      setLoading(false);
    }
  };
  const handleSelectProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setCurrentView('images');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedProfile(null);
  };

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setShowProfileForm(true);
  };

  const handleImageUploadSuccess = () => {
    setShowImageUpload(false);
    setImageGalleryKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <header className="bg-white/90 backdrop-blur-md shadow-xl border-b border-white/30 sticky top-0 z-40">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Customer Lead Images
                </h1>
                <p className="text-sm text-gray-600 font-medium">Professional Image Management</p>
              </div>
            </div>
            {currentView === 'images' && (
              <button
                onClick={handleBackToList}
                className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white hover:shadow-lg hover:border-gray-300 transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Profiles
              </button>
            )}
          </div>
        </div>
      </header>

      <main className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
                  <div className="absolute top-0 left-0 animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-blue-600"></div>
                </div>
                <p className="mt-4 text-lg font-medium text-gray-900">Loading...</p>
                <p className="mt-1 text-sm text-gray-500">Please wait while we fetch your data</p>
              </div>
            </div>
          </div>
        )}

        {currentView === 'list' ? (
          <ProfileList
            profiles={profiles}
            onSelectProfile={handleSelectProfile}
            onCreateProfile={() => setShowProfileForm(true)}
            onEditProfile={handleEditProfile}
            onDeleteProfile={handleDeleteProfile}
          />
        ) : (
          selectedProfile && (
            <ImageGallery
              key={imageGalleryKey}
              profile={selectedProfile}
              onUploadClick={() => setShowImageUpload(true)}
            />
          )
        )}
      </main>

      {showProfileForm && (
        <ProfileForm
          profile={editingProfile}
          onSubmit={editingProfile ? handleUpdateProfile : handleCreateProfile}
          onCancel={() => {
            setShowProfileForm(false);
            setEditingProfile(null);
          }}
        />
      )}

      {showImageUpload && selectedProfile && (
        <ImageUpload
          profile={selectedProfile}
          onSuccess={handleImageUploadSuccess}
          onCancel={() => setShowImageUpload(false)}
        />
      )}

    </div>
  );
}

export default App;