using Domain.Models;

namespace Application.Interfaces
{
    public interface IProfileRepository
    {
        Task<IEnumerable<Profile>> GetAllAsync();
        Task<Profile?> GetByIdAsync(int id);
        Task<Profile> AddAsync(Profile profile);
        Task UpdateAsync(Profile profile);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}