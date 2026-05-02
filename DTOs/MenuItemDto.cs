namespace BiteNow.DTOs;

public record MenuItemResponse(
    int Id,
    string Name,
    string Description,
    decimal Price,
    string Category,
    bool IsAvailable,
    DateTime CreatedAt
);

public record CreateMenuItemRequest(
    string Name,
    string Description,
    decimal Price,
    string Category,
    bool IsAvailable = true
);

public record UpdateMenuItemRequest(
    string Name,
    string Description,
    decimal Price,
    string Category,
    bool IsAvailable
);