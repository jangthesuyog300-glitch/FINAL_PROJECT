using Hotel.DTOs;
using Hotel.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hotel.Controllers
{
    [ApiController]
    [Route("api/restaurants")]
    public class RestaurantsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public RestaurantsController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // =========================================================
        //  PUBLIC API – HOME PAGE (NO LOGIN REQUIRED)
        // =========================================================
        [AllowAnonymous]
        [HttpGet("public")]
        public async Task<IActionResult> GetActiveRestaurants()
        {
            var restaurants = await _context.Restaurants
                .Where(r => r.IsActive)
                .Select(r => new
                {
                    r.RestaurantId,
                    r.Name,
                    r.Location,
                    r.Rating,
                    r.IsActive,
                    r.ImagePath,
                    Images = r.RestaurantImages.Select(ri => ri.ImageUrl).ToList()
                })
                .ToListAsync();

            return Ok(restaurants);
        }

       
        [AllowAnonymous] // public details (optional)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRestaurantById(int id)
        {
            var restaurant = await _context.Restaurants
                .Where(r => r.RestaurantId == id && r.IsActive)
                .Select(r => new
                {
                    r.RestaurantId,
                    r.Name,
                    r.Description,
                    r.Location,
                    r.City,
                    r.Rating,
                    r.TotalRatings,
                    r.PriceForTwo,
                    r.OpenTime,
                    r.CloseTime,
                    r.Phone,
                    r.ImagePath,
                    Images = r.RestaurantImages.Select(ri => new { ri.RestaurantImageId, ri.ImageUrl, ri.IsPrimary }).ToList(),

                    Tables = r.Tables.Select(t => new
                    {
                        t.TableId,
                        t.TableNumber,
                        t.Capacity,
                        t.Status,
                        t.Section,
                        t.Location
                    }).ToList(),

                    FoodItems = r.FoodItems.Select(f => new
                    {
                        f.FoodItemId,
                        f.FoodName,
                        f.Price,
                        f.IsAvailable
                    }).ToList(),

                    AverageRating = r.Reviews.Any() ? r.Reviews.Average(rv => rv.Rating) : 0,
                    ReviewCount = r.Reviews.Count()
                })
                .FirstOrDefaultAsync();

            if (restaurant == null) return NotFound("Restaurant not found");
            return Ok(restaurant);
        }

        [Authorize(Roles = "Manager,Admin")]
        [HttpPost("{id}/images")]
        public async Task<IActionResult> UploadImages(int id, List<IFormFile> files)
        {
            var restaurant = await _context.Restaurants.FindAsync(id);
            if (restaurant == null) return NotFound("Restaurant not found");

            // Manager check
            if (User.IsInRole("Manager"))
            {
                var restaurantIdClaim = User.Claims.FirstOrDefault(c => c.Type == "RestaurantId")?.Value;
                if (restaurantIdClaim == null || int.Parse(restaurantIdClaim) != id)
                    return Forbid();
            }

            if (files == null || files.Count == 0) return BadRequest("No files uploaded");

            var uploadPath = Path.Combine(_env.WebRootPath, "images", "restaurants");
            if (!Directory.Exists(uploadPath)) Directory.CreateDirectory(uploadPath);

            var addedImages = new List<RestaurantImage>();

            foreach (var file in files)
            {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                var filePath = Path.Combine(uploadPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var imageUrl = $"/images/restaurants/{fileName}";
                var ri = new RestaurantImage
                {
                    RestaurantId = id,
                    ImageUrl = imageUrl,
                    IsPrimary = string.IsNullOrEmpty(restaurant.ImagePath)
                };

                if (ri.IsPrimary) restaurant.ImagePath = imageUrl;

                _context.RestaurantImages.Add(ri);
                addedImages.Add(ri);
            }

            await _context.SaveChangesAsync();
            return Ok(addedImages);
        }



        // =========================================================
        //  ADMIN ONLY – CREATE RESTAURANT WITH IMAGE UPLOAD
        // =========================================================
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] CreateRestaurantDto dto)
        {
            var image = dto.Image;
            string? imageUrl = null;

            if (image != null)
            {
                var uploadPath = Path.Combine(_env.WebRootPath, "images", "restaurants");
                if (!Directory.Exists(uploadPath)) Directory.CreateDirectory(uploadPath);

                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);
                var filePath = Path.Combine(uploadPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                imageUrl = $"/images/restaurants/{fileName}";
            }

            var restaurant = new Restaurant
            {
                Name = dto.Name,
                Description = dto.Description,
                Location = dto.Location,
                City = dto.City,
                Rating = dto.Rating,
                TotalRatings = dto.TotalRatings,
                IsActive = dto.IsActive,
                PriceForTwo = dto.PriceForTwo,
                OpenTime = dto.OpenTime,
                CloseTime = dto.CloseTime,
                Phone = dto.Phone,
                ImagePath = imageUrl ?? dto.ImagePath
            };

            _context.Restaurants.Add(restaurant);
            await _context.SaveChangesAsync();

            // Also add to RestaurantImages table if image was uploaded
            if (imageUrl != null)
            {
                var ri = new RestaurantImage
                {
                    RestaurantId = restaurant.RestaurantId,
                    ImageUrl = imageUrl,
                    IsPrimary = true
                };
                _context.RestaurantImages.Add(ri);
                await _context.SaveChangesAsync();
            }

            return Ok(restaurant);
        }


        // =========================================================
        //  ADMIN ONLY – GET ALL RESTAURANTS
        // =========================================================
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllRestaurants()
        {
            return Ok(await _context.Restaurants.ToListAsync());
        }

        // =========================================================
        //  ADMIN ONLY – ACTIVATE / DEACTIVATE RESTAURANT
        // =========================================================
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateRestaurantStatus(int id, bool isActive)
        {
            var restaurant = await _context.Restaurants.FindAsync(id);
            if (restaurant == null)
                return NotFound("Restaurant not found");

            restaurant.IsActive = isActive;
            await _context.SaveChangesAsync();

            return Ok(new { restaurant.RestaurantId, restaurant.Name, restaurant.IsActive });
        }
    }
}
