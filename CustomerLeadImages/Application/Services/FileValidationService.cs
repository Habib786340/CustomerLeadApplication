using System.Text.RegularExpressions;

namespace Application.Services
{
    
    public class FileValidationService
    {
        private const int MaxFileSizeInBytes = 5 * 1024 * 1024; // 5MB
        private readonly string[] _allowedContentTypes = { "image/jpeg", "image/png", "image/gif", "image/webp" };
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };


        public bool IsValidBase64Image(string base64Image)
        {
            if (string.IsNullOrWhiteSpace(base64Image))
                return false;

            try
            {
                var bytes = Convert.FromBase64String(base64Image);

                if (bytes.Length > MaxFileSizeInBytes)
                    return false;

                return IsValidImageHeader(bytes);
            }
            catch
            {
                return false;
            }
        }

        public bool IsValidFileName(string fileName)
        {
            if (string.IsNullOrWhiteSpace(fileName))
                return false;

            var invalidChars = Path.GetInvalidFileNameChars();
            if (fileName.Any(c => invalidChars.Contains(c)))
                return false;

            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return _allowedExtensions.Contains(extension);
        }

   
        public string GetContentTypeFromBase64(string base64Image)
        {
            try
            {
                var bytes = Convert.FromBase64String(base64Image);
                return GetContentTypeFromBytes(bytes);
            }
            catch
            {
                return "application/octet-stream";
            }
        }

        public long GetFileSizeFromBase64(string base64Image)
        {
            try
            {
                var bytes = Convert.FromBase64String(base64Image);
                return bytes.Length;
            }
            catch
            {
                return 0;
            }
        }

        private bool IsValidImageHeader(byte[] bytes)
        {
            if (bytes.Length < 4)
                return false;

            // JPEG: FF D8 FF
            if (bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF)
                return true;

            // PNG: 89 50 4E 47
            if (bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47)
                return true;

            // GIF: 47 49 46
            if (bytes[0] == 0x47 && bytes[1] == 0x49 && bytes[2] == 0x46)
                return true;

            // WebP: 52 49 46 46 (RIFF) followed by WEBP
            if (bytes.Length >= 12 &&
                bytes[0] == 0x52 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x46 &&
                bytes[8] == 0x57 && bytes[9] == 0x45 && bytes[10] == 0x42 && bytes[11] == 0x50)
                return true;

            return false;
        }

        private string GetContentTypeFromBytes(byte[] bytes)
        {
            if (bytes.Length < 4)
                return "application/octet-stream";

            // JPEG: FF D8 FF
            if (bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF)
                return "image/jpeg";

            // PNG: 89 50 4E 47
            if (bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47)
                return "image/png";

            // GIF: 47 49 46
            if (bytes[0] == 0x47 && bytes[1] == 0x49 && bytes[2] == 0x46)
                return "image/gif";

            // WebP: 52 49 46 46 (RIFF) followed by WEBP
            if (bytes.Length >= 12 &&
                bytes[0] == 0x52 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x46 &&
                bytes[8] == 0x57 && bytes[9] == 0x45 && bytes[10] == 0x42 && bytes[11] == 0x50)
                return "image/webp";

            return "image/jpeg";
        }
    }
}