using System.ComponentModel.DataAnnotations;

namespace Hotel.Models
{
    public class Review
    {
        public int ReviewId { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public int RestaurantId { get; set; }
        
        // Link to booking to ensure they actually visited
        public int? BookingId { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }

        public string? Comment { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Optionally add review images
        public string? ImageUrl { get; set; }

        public User User { get; set; } = null!;
        public Restaurant Restaurant { get; set; } = null!;
        public Booking? Booking { get; set; }
    }
}
