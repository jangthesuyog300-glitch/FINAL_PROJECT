using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Hotel.Models;
using MenuPro.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace Hotel.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FoodItemsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public FoodItemsController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // ✅ GET: api/fooditems
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Models.FoodItem>>> GetAllFoodItems()
        {
            var foods = await _context.FoodItems
                .AsNoTracking()
                .OrderByDescending(f => f.FoodItemId)
                .ToListAsync();

            return Ok(foods);
        }

        // ✅ GET: api/fooditems/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<Models.FoodItem>> GetFoodItemById(int id)
        {
            var food = await _context.FoodItems
                .AsNoTracking()
                .FirstOrDefaultAsync(f => f.FoodItemId == id);

            if (food == null) return NotFound($"FoodItem {id} not found.");
            return Ok(food);
        }

        // ✅ GET: api/fooditems/restaurant/3
        [HttpGet("restaurant/{restaurantId:int}")]
        public async Task<ActionResult<IEnumerable<Models.FoodItem>>> GetFoodItemsByRestaurant(int restaurantId)
        {
            var foods = await _context.FoodItems
                .AsNoTracking()
                .Where(f => f.RestaurantId == restaurantId)
                .OrderByDescending(f => f.FoodItemId)
                .ToListAsync();

            return Ok(foods);
        }

        // ✅ POST: api/fooditems
        [Authorize(Roles = "Manager,Admin")]
        [HttpPost]
        public async Task<ActionResult<Models.FoodItem>> CreateFoodItem([FromForm] FoodItemCreateDto dto)
        {
            var image = dto.Image;
            if (string.IsNullOrWhiteSpace(dto.FoodName))
                return BadRequest("FoodName is required.");

            if (dto.Price < 0)
                return BadRequest("Price cannot be negative.");

            // Optional: ensure restaurant exists
            var restaurantExists = await _context.Restaurants
                .AsNoTracking()
                .AnyAsync(r => r.RestaurantId == dto.RestaurantId && r.IsActive);

            if (!restaurantExists)
                return BadRequest($"Restaurant {dto.RestaurantId} not found or inactive.");

            string? imageUrl = dto.ImageUrl;

            if (image != null)
            {
                var uploadPath = Path.Combine(_env.WebRootPath, "images", "foods");
                if (!Directory.Exists(uploadPath)) Directory.CreateDirectory(uploadPath);

                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);
                var filePath = Path.Combine(uploadPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                imageUrl = $"/images/foods/{fileName}";
            }

            var food = new Models.FoodItem
            {
                RestaurantId = dto.RestaurantId,
                FoodName = dto.FoodName.Trim(),
                Category = dto.Category?.Trim() ?? "General",
                Price = dto.Price,
                IsAvailable = dto.IsAvailable,
                ImageUrl = imageUrl
            };

            _context.FoodItems.Add(food);
            await _context.SaveChangesAsync();

            // returns 201 + created object
            return CreatedAtAction(nameof(GetFoodItemById), new { id = food.FoodItemId }, food);
        }

        // ✅ PUT: api/fooditems/5
        [Authorize(Roles = "Manager,Admin")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateFoodItem(int id, [FromForm] FoodItemUpdateDto dto)
        {
            var image = dto.Image;
            if (string.IsNullOrWhiteSpace(dto.FoodName))
                return BadRequest("FoodName is required.");

            if (dto.Price < 0)
                return BadRequest("Price cannot be negative.");

            var food = await _context.FoodItems.FirstOrDefaultAsync(f => f.FoodItemId == id);
            if (food == null) return NotFound($"FoodItem {id} not found.");

            string? imageUrl = dto.ImageUrl;

            if (image != null)
            {
                var uploadPath = Path.Combine(_env.WebRootPath, "images", "foods");
                if (!Directory.Exists(uploadPath)) Directory.CreateDirectory(uploadPath);

                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);
                var filePath = Path.Combine(uploadPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                imageUrl = $"/images/foods/{fileName}";
            }

            // Update fields
            food.FoodName = dto.FoodName.Trim();
            food.Category = dto.Category?.Trim() ?? "General";
            food.Price = dto.Price;
            food.IsAvailable = dto.IsAvailable;
            if (imageUrl != null) food.ImageUrl = imageUrl;

            // If you want to allow changing restaurantId:
            // food.RestaurantId = dto.RestaurantId;

            await _context.SaveChangesAsync();
            return NoContent(); // 204
        }

        // ✅ DELETE: api/fooditems/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteFoodItem(int id)
        {
            var food = await _context.FoodItems.FirstOrDefaultAsync(f => f.FoodItemId == id);
            if (food == null) return NotFound($"FoodItem {id} not found.");

            // If food item is used in BookingFoods, deletion may fail due to FK Restrict.
            // You can block delete with a clear message:
            bool isUsed = await _context.BookingFoods
                .AsNoTracking()
                .AnyAsync(bf => bf.FoodItemId == id);

            if (isUsed)
                return Conflict("Cannot delete this item because it is already used in bookings.");

            _context.FoodItems.Remove(food);
            await _context.SaveChangesAsync();

            return NoContent(); // 204
        }
    }

    // ---------------- DTOs ----------------

  
}
