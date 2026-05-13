namespace BiteNow.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "Customer"; // "Customer" | "Admin"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public string Phone { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    // Navigation
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}