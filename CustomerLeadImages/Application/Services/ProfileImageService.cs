using Application.Interfaces;
using Application.DTOs;
using Domain.Models;
using System.Linq;
using System.Text.RegularExpressions;

namespace Application.Services
{
    public class ProfileImageService : IProfileImageService
    {
        private readonly IProfileImageRepository _imageRepository;
        private readonly IProfileRepository _profileRepository;
        private readonly ImageLimitHandler _limitHandler;
        private readonly FileValidationService _fileValidationService;
        private const int MaxImagesPerProfile = 10;

        public ProfileImageService(
            IProfileImageRepository imageRepository,
            IProfileRepository profileRepository,
            // the image limit Handler is not used btw you can use it to make the code more modular and can add more methods as well that will support you logic 

            ImageLimitHandler limitHandler,
            FileValidationService fileValidationService)
        {
            _imageRepository = imageRepository;
            _profileRepository = profileRepository;
            _limitHandler = limitHandler;
            _fileValidationService = fileValidationService;
        }

        public async Task<IEnumerable<ProfileImage>> GetImagesByProfileIdAsync(int profileId)
        {
            return await _imageRepository.GetByProfileIdAsync(profileId);
        }

        public async Task<ProfileImage?> GetImageByIdAsync(int id)
        {
            return await _imageRepository.GetByIdAsync(id);
        }

        public async Task<(bool Success, string Message, IEnumerable<ProfileImage> UploadedImages, int RemainingSlots)> UploadImagesAsync(
            int profileId, IEnumerable<string> base64Images, IEnumerable<string> fileNames)
        {

            if (!await _profileRepository.ExistsAsync(profileId))
            {
                return (false, "Profile not found", new List<ProfileImage>(), 0);
            }

            var currentCount = await _imageRepository.CountByProfileIdAsync(profileId);
            var availableSlots = MaxImagesPerProfile - currentCount;
            var requestedCount = base64Images.Count();

            if (availableSlots <= 0)
            {
                var images = await _imageRepository.GetByProfileIdAsync(profileId);
                var nonPriorityImages = images.Where(i => !i.IsPriority).OrderBy(i => i.UploadedAt).ToList();

                if (nonPriorityImages.Count == 0)
                {
                    return (false, "Maximum number of images (10) already reached for this profile and no non-priority images to replace. Please delete some images first.", new List<ProfileImage>(), 0);
                }

                var imagesToDelete = nonPriorityImages.Take(requestedCount).ToList();
                foreach (var image in imagesToDelete)
                {
                    await _imageRepository.DeleteAsync(image.Id);
                }

                availableSlots = imagesToDelete.Count;
                currentCount = MaxImagesPerProfile - imagesToDelete.Count;
            }
            else if (requestedCount > availableSlots)
            {

            }

            var imagesToUpload = base64Images.Zip(fileNames, (base64, fileName) => (Base64: base64, FileName: fileName))
                .Take(availableSlots)
                .ToList();

            var uploadedImages = new List<ProfileImage>();
            var invalidImages = new List<string>();

            foreach ((string base64, string fileName) in imagesToUpload)
            {
                if (!_fileValidationService.IsValidBase64Image(base64))
                {
                    invalidImages.Add(fileName);
                    continue;
                }

                var image = new ProfileImage
                {
                    ProfileId = profileId,
                    ImageData = base64,
                    FileName = fileName,
                    ContentType = _fileValidationService.GetContentTypeFromBase64(base64),
                    UploadedAt = DateTime.UtcNow,
                    DisplayOrder = currentCount + uploadedImages.Count + 1,
                    IsPriority = true
                };

                var savedImage = await _imageRepository.AddAsync(image);
                uploadedImages.Add(savedImage);
            }

            var message = uploadedImages.Count > 0
                ? $"Successfully uploaded {uploadedImages.Count} image(s)"
                : "No valid images were uploaded";

            if (invalidImages.Any())
            {
                message += $". Invalid images: {string.Join(", ", invalidImages)}";
            }

            if (imagesToUpload.Count > availableSlots)
            {
                message += $". {imagesToUpload.Count - availableSlots} image(s) were rejected due to limit";
            }

            var remainingSlots = MaxImagesPerProfile - (currentCount + uploadedImages.Count);
            return (uploadedImages.Count > 0, message, uploadedImages, remainingSlots);
        }

        public async Task<bool> DeleteImageAsync(int id)
        {
            if (!await _imageRepository.ExistsAsync(id))
            {
                return false;
            }

            await _imageRepository.DeleteAsync(id);
            return true;
        }

        public async Task UpdateImageAsync(ProfileImage image)
        {
            await _imageRepository.UpdateAsync(image);
        }

        public async Task<int> GetImageCountByProfileIdAsync(int profileId)
        {
            return await _imageRepository.CountByProfileIdAsync(profileId);
        }

    }
}