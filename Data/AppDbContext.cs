using Microsoft.EntityFrameworkCore;
using BiteNow.Models;

namespace BiteNow.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ── User ─────────────────────────────────────────────
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).IsRequired().HasMaxLength(200);
            e.Property(u => u.Name).IsRequired().HasMaxLength(100);
            e.Property(u => u.Role).HasDefaultValue("Customer");
        });

        // ── MenuItem ─────────────────────────────────────────
        modelBuilder.Entity<MenuItem>(e =>
        {
            e.HasKey(m => m.Id);
            e.Property(m => m.Price).HasColumnType("decimal(10,2)");
            e.Property(m => m.Name).IsRequired().HasMaxLength(150);
        });

        // ── Order ─────────────────────────────────────────────
        modelBuilder.Entity<Order>(e =>
        {
            e.HasKey(o => o.Id);
            e.Property(o => o.TotalAmount).HasColumnType("decimal(10,2)");
            e.Property(o => o.Status).HasDefaultValue("Pending");

            e.HasOne(o => o.User)
             .WithMany(u => u.Orders)
             .HasForeignKey(o => o.UserId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── OrderItem ─────────────────────────────────────────
        modelBuilder.Entity<OrderItem>(e =>
        {
            e.HasKey(oi => oi.Id);
            e.Property(oi => oi.UnitPrice).HasColumnType("decimal(10,2)");

            e.HasOne(oi => oi.Order)
             .WithMany(o => o.OrderItems)
             .HasForeignKey(oi => oi.OrderId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(oi => oi.MenuItem)
             .WithMany(m => m.OrderItems)
             .HasForeignKey(oi => oi.MenuItemId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Seed Data ─────────────────────────────────────────
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                Name = "Admin",
                Email = "admin@restaurant.com",
                // In a real project, use a proper hash. This is BCrypt of "admin123"
                PasswordHash = "$2a$11$rBnqOGV.W0K.Q9z1xHmv7.placeholder.hash",
                Role = "Admin",
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = 2,
                Name = "Alice Smith",
                Email = "alice@example.com",
                PasswordHash = "$2a$11$rBnqOGV.W0K.Q9z1xHmv7.placeholder.hash",
                Role = "Customer",
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        modelBuilder.Entity<MenuItem>().HasData(
            new MenuItem { Id = 1, Name = "Margherita Pizza", Description = "Classic tomato and mozzarella", Price = 12.99m, Category = "Pizza", IsAvailable = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new MenuItem { Id = 2, Name = "Pepperoni Pizza",  Description = "Loaded with pepperoni",       Price = 14.99m, Category = "Pizza", IsAvailable = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new MenuItem { Id = 3, Name = "Caesar Salad",     Description = "Romaine, croutons, parmesan", Price = 8.50m,  Category = "Salad", IsAvailable = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new MenuItem { Id = 4, Name = "Garlic Bread",     Description = "Toasted with herb butter",    Price = 4.99m,  Category = "Sides", IsAvailable = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new MenuItem { Id = 5, Name = "Tiramisu",         Description = "Classic Italian dessert",     Price = 6.99m,  Category = "Dessert", IsAvailable = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );
    }
}



