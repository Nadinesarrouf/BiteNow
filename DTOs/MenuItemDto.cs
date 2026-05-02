using BiteNow.DTOs;

namespace BiteNow.DTOs;

public class MenuItemDto

{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public double Price { get; set; }
    public bool IsAvailable { get; set; }
}