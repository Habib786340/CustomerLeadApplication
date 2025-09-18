using Application.Interfaces;
using Domain.Models;

namespace Application.Services
{
    public class ProfileService : IProfileService
    {
        private readonly IProfileRepository _profileRepository;

        public ProfileService(IProfileRepository profileRepository)
        {
            _profileRepository = profileRepository;
        }

        public async Task<IEnumerable<Profile>> GetAllProfilesAsync()
        {
            return await _profileRepository.GetAllAsync();
        }

        public async Task<Profile?> GetProfileByIdAsync(int id)
        {
            return await _profileRepository.GetByIdAsync(id);
        }

        public async Task<Profile> CreateProfileAsync(Profile profile)
        {
            profile.CreatedAt = DateTime.UtcNow;
            return await _profileRepository.AddAsync(profile);
        }

        public async Task UpdateProfileAsync(Profile profile)
        {
            await _profileRepository.UpdateAsync(profile);
        }

        public async Task DeleteProfileAsync(int id)
        {
            await _profileRepository.DeleteAsync(id);
        }

        public async Task<bool> ProfileExistsAsync(int id)
        {
            return await _profileRepository.ExistsAsync(id);
        }
    }
}