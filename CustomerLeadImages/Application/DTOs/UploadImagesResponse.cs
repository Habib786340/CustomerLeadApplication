namespace Application.DTOs
{

    public class UploadImagesResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public int ImagesUploaded { get; set; }
        public int RemainingSlots { get; set; }
        public List<ProfileImageDto> Images { get; set; } = new();
    }

}