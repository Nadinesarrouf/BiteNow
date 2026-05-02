namespace BiteNow.Models;

public class Order
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Status { get; set; } = "Pending"; // Pending | Confirmed | Preparing | Ready | Delivered | Cancelled
    public string Notes { get; set; } = string.Empty;
    public DateTime PlacedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Computed property — stored in DB for query efficiency
    public decimal TotalAmount { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}