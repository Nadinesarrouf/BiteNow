using BiteNow.DTOs;
namespace BiteNow.DTOs;

public class UserOrdersDto
{
    public int UserId { get; set; }
    public List<OrderDto> Orders { get; set; }
}
