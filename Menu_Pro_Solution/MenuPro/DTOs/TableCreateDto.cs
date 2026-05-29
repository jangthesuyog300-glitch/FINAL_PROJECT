using System.Text.Json.Serialization;

namespace MenuPro.DTOs
{
    public class TableCreateDto
    {
        [JsonPropertyName("restaurantId")]
        public int RestaurantId { get; set; }

        [JsonPropertyName("tableNumber")]
        public string TableNumber { get; set; } = null!;

        [JsonPropertyName("capacity")]
        public int Capacity { get; set; }

        [JsonPropertyName("section")]
        public string? Section { get; set; }

        [JsonPropertyName("location")]
        public string? Location { get; set; }
    }
}
