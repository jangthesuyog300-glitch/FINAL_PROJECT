using Hotel.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hotel.Controllers
{
    [ApiController]
    [Route("api/reviews")]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ReviewsController(AppDbContext context) => _context = context;

        [HttpGet("restaurant/{restaurantId}")]
        public async Task<IActionResult> GetByRestaurant(int restaurantId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var query = _context.Reviews
                .Include(r => r.User)
                .Where(r => r.RestaurantId == restaurantId)
                .OrderByDescending(r => r.CreatedAt);

            var total = await query.CountAsync();
            var reviews = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new
                {
                    r.ReviewId,
                    r.UserId,
                    userName = r.User.Name,
                    r.Rating,
                    r.Comment,
                    r.CreatedAt,
                    r.ImageUrl
                })
                .ToListAsync();

            return Ok(new { total, page, pageSize, reviews });
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> PostReview([FromBody] Review review)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type.EndsWith("/nameidentifier") || c.Type == "UserId");
            if (userIdClaim == null) return Unauthorized();
            int userId = int.Parse(userIdClaim.Value);

            // Check if user has a completed booking for this restaurant
            var hasBooking = await _context.Bookings
                .AnyAsync(b => b.UserId == userId && 
                               b.RestaurantId == review.RestaurantId && 
                               b.BookingStatus == "Completed");

            if (!hasBooking)
                return BadRequest("You can only review restaurants where you have a completed booking.");

            // Check if user already reviewed this booking (if BookingId provided) or just restaurant
            bool alreadyReviewed = false;
            if (review.BookingId.HasValue)
            {
                alreadyReviewed = await _context.Reviews.AnyAsync(r => r.BookingId == review.BookingId);
            }
            else
            {
                // Optionally allow only one review per restaurant per user
                // alreadyReviewed = await _context.Reviews.AnyAsync(r => r.UserId == userId && r.RestaurantId == review.RestaurantId);
            }

            if (alreadyReviewed) return BadRequest("You have already reviewed this booking.");

            review.UserId = userId;
            review.CreatedAt = DateTime.UtcNow;

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return Ok(review);
        }

        [Authorize(Roles = "Manager,Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return NotFound();

            if (User.IsInRole("Manager"))
            {
                var restaurantIdClaim = User.Claims.FirstOrDefault(c => c.Type == "RestaurantId")?.Value;
                if (restaurantIdClaim == null || int.Parse(restaurantIdClaim) != review.RestaurantId)
                    return Forbid();
            }

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Review removed" });
        }
    }
}
