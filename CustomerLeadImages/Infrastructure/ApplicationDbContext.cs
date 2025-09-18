using Microsoft.EntityFrameworkCore;
using Domain.Models;

namespace Infrastructure
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Profile> Profiles { get; set; }
        public DbSet<ProfileImage> ProfileImages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<ProfileImage>()
                .HasOne(pi => pi.Profile)
                .WithMany(p => p.Images)
                .HasForeignKey(pi => pi.ProfileId);
        }
    }
}