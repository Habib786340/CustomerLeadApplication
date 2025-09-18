using Application.Services;
using Domain.Models;
using Microsoft.AspNetCore.Mvc;

namespace CustomerLeadImages.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfilesController : ControllerBase
    {
        private readonly IProfileService _profileService;

        public ProfilesController(IProfileService profileService)
        {
            _profileService = profileService;
        }

        [HttpGet]
        public async Task<IActionResult> GetProfiles()
        {
            var profiles = await _profileService.GetAllProfilesAsync();
            return Ok(profiles);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProfile(int id)
        {
            var profile = await _profileService.GetProfileByIdAsync(id);
            if (profile == null)
            {
                return NotFound();
            }
            return Ok(profile);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProfile([FromBody] Profile profile)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdProfile = await _profileService.CreateProfileAsync(profile);
            return CreatedAtAction(nameof(GetProfile), new { id = createdProfile.Id }, createdProfile);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProfile(int id, [FromBody] Profile profile)
        {
            if (id != profile.Id)
            {
                return BadRequest("ID mismatch");
            }

            if (!await _profileService.ProfileExistsAsync(id))
            {
                return NotFound();
            }

            await _profileService.UpdateProfileAsync(profile);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProfile(int id)
        {
            if (!await _profileService.ProfileExistsAsync(id))
            {
                return NotFound();
            }

            await _profileService.DeleteProfileAsync(id);
            return NoContent();
        }
    }
}