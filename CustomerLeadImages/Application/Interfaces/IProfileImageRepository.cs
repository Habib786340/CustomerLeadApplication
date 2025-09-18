using Domain.Models;

namespace Application.Interfaces
{
    public interface IProfileImageRepository
    {
        Task<ProfileImage?> GetByIdAsync(int id);
        Task<IEnumerable<ProfileImage>> GetByProfileIdAsync(int profileId);
        Task<ProfileImage> AddAsync(ProfileImage image);
        Task UpdateAsync(ProfileImage image);
        Task DeleteAsync(int id);
        Task<int> CountByProfileIdAsync(int profileId);
        Task<bool> ExistsAsync(int id);
    }
}