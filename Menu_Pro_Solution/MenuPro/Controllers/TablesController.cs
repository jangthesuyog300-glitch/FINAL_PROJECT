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
        public async Task<IActionResult> Add([FromBody] TableCreateDto dto)
        {
            // If manager, ensure they only add to their restaurant
            if (User.IsInRole("Manager"))
            {
                // Check multiple possible claim types for RestaurantId
                var restaurantIdClaim = User.Claims.FirstOrDefault(c => 
                    c.Type == "RestaurantId" || 
                    c.Type == "restaurantId" || 
                    c.Type == "id")?.Value;

                if (restaurantIdClaim == null || !int.TryParse(restaurantIdClaim, out int tokenRestId) || tokenRestId != dto.RestaurantId)
                {
                    return StatusCode(403, $"Forbidden: Manager restaurant mismatch. Token ID: {restaurantIdClaim}, DTO ID: {dto.RestaurantId}");
                }
            }

            if (string.IsNullOrWhiteSpace(dto.TableNumber))
                return BadRequest("Table number is required.");

            var table = new Table
            {
                RestaurantId = dto.RestaurantId,
                TableNumber = dto.TableNumber,
                Capacity = dto.Capacity,
                Section = dto.Section,
                Location = dto.Location,
                Status = "Available"
            };

            try 
            {
                _context.Tables.Add(table);
                await _context.SaveChangesAsync();
                return Ok(table);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "Manager,Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TableUpdateDto dto)
        {
            if (id != dto.TableId) return BadRequest("ID mismatch");

            var existing = await _context.Tables.FindAsync(id);
            if (existing == null) return NotFound();

            // Manager check
            if (User.IsInRole("Manager"))
            {
                var restaurantIdClaim = User.Claims.FirstOrDefault(c => 
                    c.Type == "RestaurantId" || 
                    c.Type == "restaurantId" || 
                    c.Type == "id")?.Value;

                if (restaurantIdClaim == null || !int.TryParse(restaurantIdClaim, out int tokenRestId) || tokenRestId != existing.RestaurantId)
                {
                    return StatusCode(403, "Forbidden: Manager restaurant mismatch.");
                }
            }

            existing.TableNumber = dto.TableNumber;
            existing.Capacity = dto.Capacity;
            existing.Status = dto.Status;
            existing.Section = dto.Section;
            existing.Location = dto.Location;

            try 
            {
                await _context.SaveChangesAsync();
                return Ok(existing);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
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
                // Robust claim lookup
                var restaurantIdClaim = User.Claims.FirstOrDefault(c => 
                    c.Type == "RestaurantId" || 
                    c.Type == "restaurantId" || 
                    c.Type == "id")?.Value;

                if (restaurantIdClaim == null || !int.TryParse(restaurantIdClaim, out int tokenRestId) || tokenRestId != table.RestaurantId)
                {
                    return StatusCode(403, "Forbidden: Manager restaurant mismatch.");
                }
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
                    capacity = t.Capacity,
                    status = t.Status,
                    section = t.Section,
                    location = t.Location
                })
                .ToListAsync();

            return Ok(tables);
        }
    }

}
