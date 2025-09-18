using Domain.Models;

namespace Application.Services
{
    public interface IProfileService
    {
        Task<IEnumerable<Profile>> GetAllProfilesAsync();
        Task<Profile?> GetProfileByIdAsync(int id);
        Task<Profile> CreateProfileAsync(Profile profile);
        Task UpdateProfileAsync(Profile profile);
        Task DeleteProfileAsync(int id);
        Task<bool> ProfileExistsAsync(int id);
    }
}