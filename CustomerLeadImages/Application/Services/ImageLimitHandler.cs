using Domain.Models;

namespace Application.Services
{
  
    public class ImageLimitHandler
    {
        private const int MaxImagesPerProfile = 10;

      
        public (bool CanUpload, string Message, int AvailableSlots) CheckUploadLimit(
            int currentCount, int requestedCount)
        {
            var availableSlots = MaxImagesPerProfile - currentCount;

            if (availableSlots <= 0)
            {
                return (false, "Maximum number of images (10) already reached for this profile", 0);
            }

            if (requestedCount > availableSlots)
            {
                return (false, $"Can only upload {availableSlots} more image(s). Requested: {requestedCount}", availableSlots);
            }

            return (true, $"Can upload {Math.Min(requestedCount, availableSlots)} image(s)", availableSlots);
        }

        public ProfileImage? GetOldestNonPriorityImage(IEnumerable<ProfileImage> images)
        {
            return images
                .Where(i => !i.IsPriority)
                .OrderBy(i => i.UploadedAt)
                .FirstOrDefault();
        }

        public IEnumerable<ProfileImage> GetOldestNonPriorityImages(IEnumerable<ProfileImage> images, int count)
        {
            return images
                .Where(i => !i.IsPriority)
                .OrderBy(i => i.UploadedAt)
                .Take(count);
        }

        public bool ShouldReplaceOldest(int currentCount, int requestedCount)
        {
            return currentCount >= MaxImagesPerProfile && requestedCount > 0;
        }

        public (bool ShouldReplace, string Message) GetReplacementStrategy(
            int currentCount, int requestedCount, bool hasNonPriorityImages)
        {
            if (currentCount < MaxImagesPerProfile)
            {
                return (false, "No replacement needed");
            }

            if (!hasNonPriorityImages)
            {
                return (false, "All images are priority images. Cannot auto-replace.");
            }

            return (true, "Will replace oldest non-priority image");
        }
    }
}