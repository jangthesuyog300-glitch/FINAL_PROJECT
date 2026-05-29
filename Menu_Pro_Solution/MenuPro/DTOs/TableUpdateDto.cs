using System.Text.Json.Serialization;

namespace MenuPro.DTOs
{
    public class TableUpdateDto
    {
        [JsonPropertyName("tableId")]
        public int TableId { get; set; }

        [JsonPropertyName("tableNumber")]
        public string TableNumber { get; set; } = null!;

        [JsonPropertyName("capacity")]
        public int Capacity { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; } = "Available";

        [JsonPropertyName("section")]
        public string? Section { get; set; }

        [JsonPropertyName("location")]
        public string? Location { get; set; }
    }
}
