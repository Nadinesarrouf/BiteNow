namespace BiteNow.Models;

public class MenuItem
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }          // Always decimal for money
    public string Category { get; set; } = string.Empty;
    public bool IsAvailable { get; set; } = true;
    public string? ImageUrl { get; set; } 
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}