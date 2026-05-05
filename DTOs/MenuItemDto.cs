namespace BiteNow.DTOs;

public record MenuItemResponse(
    int Id,
    string Name,
    string Description,
    decimal Price,
    string Category,
    bool IsAvailable,
    string? ImageUrl,
    DateTime CreatedAt
);

public record CreateMenuItemRequest(
    string Name,
    string Description,
    decimal Price,
    string Category,
    bool IsAvailable = true,
    string? ImageUrl = null
);

public record UpdateMenuItemRequest(
    string Name,
    string Description,
    decimal Price,
    string Category,
    bool IsAvailable,
    string? ImageUrl = null
);