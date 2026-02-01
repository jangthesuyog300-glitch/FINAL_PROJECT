namespace Hotel.Models
{
    public class Table
    {
        public int TableId { get; set; }

        public int RestaurantId { get; set; }
        public string TableNumber { get; set; } = null!;
        public int Capacity { get; set; }
        public string Status { get; set; } = "Available";
        public string? Section { get; set; }
        public string? Location { get; set; }

        public Restaurant Restaurant { get; set; } = null!;
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
