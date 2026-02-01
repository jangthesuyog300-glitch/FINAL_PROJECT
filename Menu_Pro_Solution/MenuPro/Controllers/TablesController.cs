using Hotel.DTOs;
using Hotel.Models;
using MenuPro.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hotel.Controllers
{
    [ApiController]
    [Route("api/tables")]
    public class TablesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public TablesController(AppDbContext context) => _context = context;

        // ✅ Manager/Admin can add tables
        [Authorize(Roles = "Manager,Admin")]
        [HttpPost]
        public async Task<IActionResult> Add([FromBody] Table table)
        {
            // If manager, ensure they only add to their restaurant
            if (User.IsInRole("Manager"))
            {
                var restaurantIdClaim = User.Claims.FirstOrDefault(c => c.Type == "RestaurantId")?.Value;
                if (restaurantIdClaim == null || int.Parse(restaurantIdClaim) != table.RestaurantId)
                    return Forbid("Managers can only add tables to their own restaurant.");
            }

            _context.Tables.Add(table);
            await _context.SaveChangesAsync();
            return Ok(table);
        }

        [Authorize(Roles = "Manager,Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Table table)
        {
            if (id != table.TableId) return BadRequest("ID mismatch");

            var existing = await _context.Tables.FindAsync(id);
            if (existing == null) return NotFound();

            // Manager check
            if (User.IsInRole("Manager"))
            {
                var restaurantIdClaim = User.Claims.FirstOrDefault(c => c.Type == "RestaurantId")?.Value;
                if (restaurantIdClaim == null || int.Parse(restaurantIdClaim) != existing.RestaurantId)
                    return Forbid();
            }

            existing.TableNumber = table.TableNumber;
            existing.Capacity = table.Capacity;
            existing.Status = table.Status;
            existing.Section = table.Section;
            existing.Location = table.Location;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        [Authorize(Roles = "Manager,Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var table = await _context.Tables.FindAsync(id);
            if (table == null) return NotFound();

            // Manager check
            if (User.IsInRole("Manager"))
            {
                var restaurantIdClaim = User.Claims.FirstOrDefault(c => c.Type == "RestaurantId")?.Value;
                if (restaurantIdClaim == null || int.Parse(restaurantIdClaim) != table.RestaurantId)
                    return Forbid();
            }

            // Prevent delete if future bookings exist
            var hasFutureBookings = await _context.Bookings
                .AnyAsync(b => b.TableId == id && b.BookingDate >= DateTime.Today && b.BookingStatus != "Cancelled");

            if (hasFutureBookings)
                return BadRequest("Cannot delete table with future bookings.");

            _context.Tables.Remove(table);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Table deleted" });
        }

        [Authorize]
        [HttpGet("restaurant/{restaurantId}")]
        public async Task<IActionResult> GetByRestaurant(int restaurantId)
        {
            var tables = await _context.Tables
                .Where(t => t.RestaurantId == restaurantId)
                .Select(t => new
                {
                    id = t.TableId,
                    tableNumber = t.TableNumber,
                    seats = t.Capacity,
                    status = t.Status,
                    section = t.Section,
                    location = t.Location
                })
                .ToListAsync();

            return Ok(tables);
        }
    }

}
