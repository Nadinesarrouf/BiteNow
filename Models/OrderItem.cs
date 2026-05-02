namespace BiteNow.Models;

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int MenuItemId { get; set; }
    public int Quantity { get; set; }

    // Price snapshot at time of order — crucial so price changes don't affect old orders
    public decimal UnitPrice { get; set; }

    // Navigation
    public Order Order { get; set; } = null!;
    public MenuItem MenuItem { get; set; } = null!;
}