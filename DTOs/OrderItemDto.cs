namespace BiteNow.DTOs
{
    public class OrderItemDto
    {
        public int Id { get; set; }
        public int Quantity { get; set; }
        public int MenuItemId { get; set; }
        public string MenuItemName { get; set; }
        public decimal Price { get; set; }
        public int OrderId { get; set; }
    }
}
/// <summary>
/// DTO for creating or updating an order item.
/// </summary>
/// <remarks>
/// Because the OrderItem entity has navigation properties to MenuItem and Order, we can create a DTO that only includes the necessary fields for creating or updating an order item. This way, we can avoid over-posting and keep our API more secure.
/// </remarks>