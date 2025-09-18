using Application.Interfaces;
using Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class ProfileImageRepository : IProfileImageRepository
    {
        private readonly ApplicationDbContext _context;

        public ProfileImageRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ProfileImage?> GetByIdAsync(int id)
        {
            return await _context.ProfileImages.FindAsync(id);
        }

        public async Task<IEnumerable<ProfileImage>> GetByProfileIdAsync(int profileId)
        {
            return await _context.ProfileImages
                .Where(i => i.ProfileId == profileId)
                .OrderBy(i => i.DisplayOrder)
                .ToListAsync();
        }

        public async Task<ProfileImage> AddAsync(ProfileImage image)
        {
            _context.ProfileImages.Add(image);
            await _context.SaveChangesAsync();
            return image;
        }

        public async Task UpdateAsync(ProfileImage image)
        {
            _context.ProfileImages.Update(image);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var image = await GetByIdAsync(id);
            if (image != null)
            {
                _context.ProfileImages.Remove(image);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<int> CountByProfileIdAsync(int profileId)
        {
            return await _context.ProfileImages.CountAsync(i => i.ProfileId == profileId);
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.ProfileImages.AnyAsync(i => i.Id == id);
        }
    }
}