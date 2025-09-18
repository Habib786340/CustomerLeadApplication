using System.ComponentModel.DataAnnotations;

namespace Application.Validation
{
    [AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
    public class Base64ImageValidationAttribute : ValidationAttribute
    {
        private const int MaxFileSizeInBytes = 5 * 1024 * 1024; // 5MB
        private readonly string[] _allowedContentTypes = { "image/jpeg", "image/png", "image/gif", "image/webp" };

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value == null)
            {
                return ValidationResult.Success;
            }

            if (value is not string base64String)
            {
                return new ValidationResult("Value must be a string");
            }

            if (string.IsNullOrWhiteSpace(base64String))
            {
                return new ValidationResult("Base64 string cannot be empty");
            }

            try
            {
                
                var bytes = Convert.FromBase64String(base64String);

                if (bytes.Length > MaxFileSizeInBytes)
                {
                    return new ValidationResult($"Image size exceeds maximum allowed size of {MaxFileSizeInBytes / (1024 * 1024)}MB");
                }

                if (!IsValidImageHeader(bytes))
                {
                    return new ValidationResult("Invalid image format. Only JPEG, PNG, GIF, and WebP are allowed");
                }

                return ValidationResult.Success;
            }
            catch (FormatException)
            {
                return new ValidationResult("Invalid Base64 string format");
            }
            catch (Exception ex)
            {
                return new ValidationResult($"Image validation failed: {ex.Message}");
            }
        }

        private bool IsValidImageHeader(byte[] bytes)
        {
            if (bytes.Length < 4)
            {
                return false;
            }

            // JPEG: FF D8 FF
            if (bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF)
            {
                return true;
            }

            // PNG: 89 50 4E 47
            if (bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47)
            {
                return true;
            }

            // GIF: 47 49 46
            if (bytes[0] == 0x47 && bytes[1] == 0x49 && bytes[2] == 0x46)
            {
                return true;
            }

            // WebP: 52 49 46 46 (RIFF) followed by WEBP
            if (bytes.Length >= 12 &&
                bytes[0] == 0x52 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x46 &&
                bytes[8] == 0x57 && bytes[9] == 0x45 && bytes[10] == 0x42 && bytes[11] == 0x50)
            {
                return true;
            }

            return false;
        }
    }
}