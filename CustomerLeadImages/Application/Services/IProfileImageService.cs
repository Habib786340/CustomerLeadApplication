using Domain.Models;
using Application.DTOs;

namespace Application.Services
{
    public interface IProfileImageService
    {
        Task<IEnumerable<ProfileImage>> GetImagesByProfileIdAsync(int profileId);
        Task<ProfileImage?> GetImageByIdAsync(int id);
        Task<(bool Success, string Message, IEnumerable<ProfileImage> UploadedImages, int RemainingSlots)> UploadImagesAsync(
            int profileId, IEnumerable<string> base64Images, IEnumerable<string> fileNames);
        Task<bool> DeleteImageAsync(int id);
        Task UpdateImageAsync(ProfileImage image);
        Task<int> GetImageCountByProfileIdAsync(int profileId);
    }
}