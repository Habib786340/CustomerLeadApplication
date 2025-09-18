namespace Application.DTOs
{
    
    public class ProfileImageDto
    {
        public int Id { get; set; }
        public int ProfileId { get; set; }
        public string ImageData { get; set; }
        public string FileName { get; set; }
        public string ContentType { get; set; }
        public DateTime UploadedAt { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsPriority { get; set; }
    }
}