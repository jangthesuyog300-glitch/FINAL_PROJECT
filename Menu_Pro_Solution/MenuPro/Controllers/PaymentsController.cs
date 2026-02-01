using Hotel.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Razorpay.Api;

namespace Hotel.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/payments")]
    public class PaymentsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public PaymentsController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public class CreateOrderDto
        {
            public int BookingId { get; set; }
            public decimal Amount { get; set; }
        }

        [HttpPost("create-order")]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            var booking = await _context.Bookings
                .Include(b => b.Restaurant)
                .FirstOrDefaultAsync(b => b.BookingId == dto.BookingId);

            if (booking == null) return NotFound("Booking not found");

            // VALIDATE AVAILABILITY BEFORE PAYMENT
            var totalTables = await _context.Tables.CountAsync(t => t.RestaurantId == booking.RestaurantId);
            var bookedTables = await _context.Bookings.CountAsync(b => 
                b.RestaurantId == booking.RestaurantId && 
                b.BookingDate.Date == booking.BookingDate.Date && 
                b.TimeSlotId == booking.TimeSlotId && 
                b.BookingStatus == "Confirmed");

            if (bookedTables >= totalTables)
                return BadRequest("Sorry, no tables available for this slot anymore.");

            // SIMULATED ORDER ID
            string orderId = "ord_demo_" + Guid.NewGuid().ToString("N").Substring(0, 10);

            // Store orderId in Payment record
            var payment = new Hotel.Models.Payment
            {
                BookingId = dto.BookingId,
                Amount = dto.Amount,
                PaymentType = "Demo",
                PaymentStatus = "Pending",
                PaymentDate = DateTime.UtcNow,
                RazorpayOrderId = orderId
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                orderId = orderId,
                amount = dto.Amount * 100,
                keyId = "rzp_test_demo", // Dummy Key
                bookingId = booking.BookingId
            });
        }

        public class VerifyPaymentDto
        {
            public string RazorpayOrderId { get; set; } = null!;
            public string RazorpayPaymentId { get; set; } = null!; // Simulated
            public string RazorpaySignature { get; set; } = null!; // Simulated
            public string PaymentMethod { get; set; } = "Card"; // Added for history details
        }

        [HttpPost("verify")]
        public async Task<IActionResult> VerifyPayment([FromBody] VerifyPaymentDto dto)
        {
            try
            {
                // In demo mode, we bypass actual signature verification
                var payment = await _context.Payments
                    .FirstOrDefaultAsync(p => p.RazorpayOrderId == dto.RazorpayOrderId);

                if (payment == null) return NotFound("Payment record not found");

                payment.RazorpayPaymentId = dto.RazorpayPaymentId;
                payment.RazorpaySignature = dto.RazorpaySignature;
                payment.PaymentStatus = "Success";
                payment.PaymentType = "Demo-" + dto.PaymentMethod;
                payment.PaymentDate = DateTime.UtcNow;

                var booking = await _context.Bookings.FindAsync(payment.BookingId);
                if (booking != null)
                {
                    booking.BookingStatus = "Confirmed";
                }

                await _context.SaveChangesAsync();

                return Ok(new { status = "Success", message = "Demo payment processed and booking confirmed" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { status = "Failed", message = "Error processing demo payment", error = ex.Message });
            }
        }

        [HttpGet("booking/{bookingId}")]
        public async Task<IActionResult> GetByBooking(int bookingId)
            => Ok(await _context.Payments
                .Where(p => p.BookingId == bookingId)
                .ToListAsync());

        [Authorize(Roles = "Manager,Admin")] // ✅ manager dashboard needs access
        [HttpGet("restaurant/{restaurantId}")]
        public async Task<IActionResult> GetByRestaurant(int restaurantId)
        {
            var data = await _context.Payments
                .Where(p => p.Booking.RestaurantId == restaurantId)
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new
                {
                    id = p.PaymentId,
                    bookingId = p.BookingId,
                    customer = p.Booking.User.Name,
                    amount = p.Amount,
                    method = p.PaymentType,
                    status = p.PaymentStatus,
                    date = p.PaymentDate,
                    razorpayOrderId = p.RazorpayOrderId
                })
                .ToListAsync();

            return Ok(data);
        }
    }
}
