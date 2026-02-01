using Hotel.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/timeslots")]
public class TimeSlotsController : ControllerBase
{
    private readonly AppDbContext _context;
    public TimeSlotsController(AppDbContext context) => _context = context;

    // ✅ PUBLIC – NO LOGIN REQUIRED
    [HttpGet("restaurant/{restaurantId}")]
    public async Task<IActionResult> GetByRestaurant(int restaurantId, [FromQuery] DateTime? date)
    {
        var bookingDate = date?.Date ?? DateTime.Today;

        var restaurant = await _context.Restaurants
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.RestaurantId == restaurantId);

        if (restaurant == null)
            return NotFound("Restaurant not found");

        if (string.IsNullOrEmpty(restaurant.OpenTime) || string.IsNullOrEmpty(restaurant.CloseTime))
            return Ok(new List<object>());

        var open = TimeSpan.Parse(restaurant.OpenTime);
        var close = TimeSpan.Parse(restaurant.CloseTime);

        // Fetch all slots from DB
        var allSlots = await _context.TimeSlots.ToListAsync();

        // Get total tables count for this restaurant
        var totalTables = await _context.Tables.CountAsync(t => t.RestaurantId == restaurantId);

        // Get count of bookings per slot for this date
        var bookingsPerSlot = await _context.Bookings
            .Where(b => b.RestaurantId == restaurantId && b.BookingDate.Date == bookingDate && b.BookingStatus != "Cancelled")
            .GroupBy(b => b.TimeSlotId)
            .Select(g => new { TimeSlotId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.TimeSlotId, x => x.Count);

        var availableSlots = allSlots
            .Where(s => s.StartTime >= open && s.EndTime <= (close < open ? close.Add(TimeSpan.FromHours(24)) : close))
            .Select(s => new
            {
                s.TimeSlotId,
                startTime = s.StartTime.ToString(@"hh\:mm"),
                endTime = s.EndTime.ToString(@"hh\:mm"),
                isAvailable = totalTables > (bookingsPerSlot.ContainsKey(s.TimeSlotId) ? bookingsPerSlot[s.TimeSlotId] : 0)
            })
            // Only return available slots as per requirement "Hide Already-Booked Slots"
            .Where(s => s.isAvailable) 
            .ToList();

        return Ok(availableSlots);
    }
}
