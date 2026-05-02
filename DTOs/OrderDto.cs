using BiteNow.DTOs;

namespace BiteNow.DTOs;

public class OrderDto
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; }
    public double TotalPrice { get; set; }

    public List<OrderItemDto> Items { get; set; }
}
