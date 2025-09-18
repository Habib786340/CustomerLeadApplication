using System.ComponentModel.DataAnnotations;
using Application.Validation;
using System.Text.Json.Serialization;

namespace Application.DTOs
{

    public class UploadImagesRequest
    {
        [Required(ErrorMessage = "Base64 images are required")]
        [MinLength(1, ErrorMessage = "At least one image is required")]
        [MaxLength(10, ErrorMessage = "Maximum 10 images allowed per request")]
        public List<string> Base64Images { get; set; } = new();

        [Required(ErrorMessage = "File names are required")]
        [MinLength(1, ErrorMessage = "At least one file name is required")]
        [MaxLength(10, ErrorMessage = "Maximum 10 file names allowed per request")]
        public List<string> FileNames { get; set; } = new();
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            var results = new List<ValidationResult>();

            if (Base64Images != null && FileNames != null)
            {
                if (Base64Images.Count != FileNames.Count)
                {
                    results.Add(new ValidationResult("Number of Base64 images must match number of file names"));
                }

                for (int i = 0; i < Base64Images.Count; i++)
                {
                    var validator = new Base64ImageValidationAttribute();
                    var result = validator.GetValidationResult(Base64Images[i],
                        new ValidationContext(this) { MemberName = $"Base64Images[{i}]" });

                    if (result != ValidationResult.Success)
                    {
                        results.Add(new ValidationResult($"Image {i + 1}: {result.ErrorMessage}"));
                    }
                }
            }


            return results;
        }
    }

}