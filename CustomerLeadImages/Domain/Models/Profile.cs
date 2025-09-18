using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Models
{
    public class Profile
    {
        public int Id { get; set; }
        public string ProfileType { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<ProfileImage> Images { get; set; } = new();
    }
}
