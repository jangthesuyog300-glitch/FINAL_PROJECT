using Microsoft.EntityFrameworkCore;

namespace Hotel.Models
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Restaurant> Restaurants => Set<Restaurant>();
        public DbSet<Table> Tables => Set<Table>();
        public DbSet<TimeSlot> TimeSlots => Set<TimeSlot>();
        public DbSet<Booking> Bookings => Set<Booking>();
        public DbSet<FoodItem> FoodItems => Set<FoodItem>();
        public DbSet<BookingFood> BookingFoods => Set<BookingFood>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<RestaurantImage> RestaurantImages => Set<RestaurantImage>();
        public DbSet<Review> Reviews => Set<Review>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasOne(u => u.Restaurant)
                .WithMany(r => r.Managers)
                .HasForeignKey(u => u.RestaurantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Restaurant)
                .WithMany(r => r.Bookings)
                .HasForeignKey(b => b.RestaurantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Table)
                .WithMany(t => t.Bookings)
                .HasForeignKey(b => b.TableId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.TimeSlot)
                .WithMany(ts => ts.Bookings)
                .HasForeignKey(b => b.TimeSlotId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<BookingFood>()
                .HasOne(bf => bf.Booking)
                .WithMany(b => b.BookingFoods)
                .HasForeignKey(bf => bf.BookingId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<BookingFood>()
                .HasOne(bf => bf.FoodItem)
                .WithMany(fi => fi.BookingFoods)
                .HasForeignKey(bf => bf.FoodItemId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Booking)
                .WithMany(b => b.Payments)
                .HasForeignKey(p => p.BookingId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RestaurantImage>()
                .HasOne(ri => ri.Restaurant)
                .WithMany(r => r.RestaurantImages)
                .HasForeignKey(ri => ri.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Review>()
                .HasOne(rv => rv.User)
                .WithMany(u => u.Reviews)
                .HasForeignKey(rv => rv.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>()
                .HasOne(rv => rv.Restaurant)
                .WithMany(r => r.Reviews)
                .HasForeignKey(rv => rv.RestaurantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>()
                .HasOne(rv => rv.Booking)
                .WithOne(b => b.Review)
                .HasForeignKey<Review>(rv => rv.BookingId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
