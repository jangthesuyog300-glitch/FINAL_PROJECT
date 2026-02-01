namespace Hotel.Models
{
    public class Payment
    {
        public int PaymentId { get; set; }

        public int BookingId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentType { get; set; } = "Combined";
        public string PaymentStatus { get; set; } = "Pending";
        public DateTime PaymentDate { get; set; }

        public string? RazorpayOrderId { get; set; }
        public string? RazorpayPaymentId { get; set; }
        public string? RazorpaySignature { get; set; }

        public Booking Booking { get; set; } = null!;
    }
}
