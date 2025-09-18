using Application.Services;
using Application.DTOs;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace CustomerLeadImages.Controllers
{

    [ApiController]
    [Route("api/{profileType}/{profileId}/images")]
    public class ProfileImagesController : ControllerBase
    {
        private readonly IProfileImageService _imageService;
        private readonly IProfileService _profileService;

        public ProfileImagesController(IProfileImageService imageService, IProfileService profileService)
        {
            _imageService = imageService;
            _profileService = profileService;
        }

        [HttpGet]
        public async Task<IActionResult> GetImages(string profileType, int profileId)
        {

            var profile = await _profileService.GetProfileByIdAsync(profileId);
            if (profile == null)
            {
                return NotFound("Profile not found");
            }

            if (!string.Equals(profile.ProfileType, profileType, StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Profile type mismatch");
            }

            var images = await _imageService.GetImagesByProfileIdAsync(profileId);
            var imageDtos = images.Select(i => new ProfileImageDto
            {
                Id = i.Id,
                ProfileId = i.ProfileId,
                ImageData = i.ImageData,
                FileName = i.FileName,
                ContentType = i.ContentType,
                UploadedAt = i.UploadedAt,
                DisplayOrder = i.DisplayOrder,
                IsPriority = i.IsPriority
            });

            return Ok(imageDtos);
        }


        [HttpPost]
        public async Task<IActionResult> UploadImages(string profileType, int profileId, [FromBody] UploadImagesRequest request)
        {

            var profile = await _profileService.GetProfileByIdAsync(profileId);
            if (profile == null)
            {
                return NotFound("Profile not found");
            }

            if (!string.Equals(profile.ProfileType, profileType, StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Profile type mismatch");
            }

            if (request == null || request.Base64Images == null || !request.Base64Images.Any())
            {
                return BadRequest("No images provided");
            }

            if (request.FileNames == null || request.FileNames.Count != request.Base64Images.Count)
            {
                return BadRequest("File names must match the number of images");
            }

            var (success, message, uploadedImages, remainingSlots) = await _imageService.UploadImagesAsync(
                profileId, request.Base64Images, request.FileNames);

            if (!success)
            {
                var currentCount = await _imageService.GetImageCountByProfileIdAsync(profileId);
                var errorResponse = new UploadImagesResponse
                {
                    Success = false,
                    Message = message,
                    ImagesUploaded = 0,
                    RemainingSlots = Math.Max(0, 10 - currentCount),
                    Images = new List<ProfileImageDto>(),
                };

                return BadRequest(errorResponse);
            }

            var response = new UploadImagesResponse
            {
                Success = true,
                Message = message,
                ImagesUploaded = uploadedImages.Count(),
                RemainingSlots = remainingSlots,
                Images = uploadedImages.Select(i => new ProfileImageDto
                {
                    Id = i.Id,
                    ProfileId = i.ProfileId,
                    ImageData = i.ImageData,
                    FileName = i.FileName,
                    ContentType = i.ContentType,
                    UploadedAt = i.UploadedAt,
                    DisplayOrder = i.DisplayOrder,
                    IsPriority = i.IsPriority
                }).ToList()
            };

            return Ok(response);
        }


        [HttpDelete("{imageId}")]
        public async Task<IActionResult> DeleteImage(string profileType, int profileId, int imageId)
        {

            var profile = await _profileService.GetProfileByIdAsync(profileId);
            if (profile == null)
            {
                return NotFound("Profile not found");
            }

            if (!string.Equals(profile.ProfileType, profileType, StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Profile type mismatch");
            }

            var image = await _imageService.GetImageByIdAsync(imageId);
            if (image == null || image.ProfileId != profileId)
            {
                return NotFound("Image not found or does not belong to this profile");
            }

            var deleted = await _imageService.DeleteImageAsync(imageId);
            if (!deleted)
            {
                return StatusCode(500, "Failed to delete image");
            }

            return NoContent();
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetImageCount(string profileType, int profileId)
        {

            var profile = await _profileService.GetProfileByIdAsync(profileId);
            if (profile == null)
            {
                return NotFound("Profile not found");
            }

            if (!string.Equals(profile.ProfileType, profileType, StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Profile type mismatch");
            }

            var count = await _imageService.GetImageCountByProfileIdAsync(profileId);
            var remainingSlots = 10 - count;
            return Ok(new { Count = count, MaxAllowed = 10, RemainingSlots = remainingSlots });
        }

        [HttpPatch("{imageId}/priority")]
        public async Task<IActionResult> ToggleImagePriority(string profileType, int profileId, int imageId, [FromBody] bool isPriority)
        {

            var profile = await _profileService.GetProfileByIdAsync(profileId);
            if (profile == null)
            {
                return NotFound("Profile not found");
            }

            if (!string.Equals(profile.ProfileType, profileType, StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Profile type mismatch");
            }

            var image = await _imageService.GetImageByIdAsync(imageId);
            if (image == null || image.ProfileId != profileId)
            {
                return NotFound("Image not found or does not belong to this profile");
            }

            image.IsPriority = isPriority;
            await _imageService.UpdateImageAsync(image);

            return Ok(new { Message = $"Image priority {(isPriority ? "set" : "removed")}", IsPriority = isPriority });
        }
    }

}