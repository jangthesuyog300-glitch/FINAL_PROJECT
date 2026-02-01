using System.ComponentModel.DataAnnotations;

namespace Hotel.Models
{
    public class RestaurantImage
    {
        public int RestaurantImageId { get; set; }
        
        [Required]
        public int RestaurantId { get; set; }
        
        [Required]
        public string ImageUrl { get; set; } = null!;
        
        public bool IsPrimary { get; set; } = false;

        public Restaurant Restaurant { get; set; } = null!;
    }
}
