namespace BiteNow.DTOs;

public record OrderItemRequest(
    int MenuItemId,
    int Quantity
);

public record OrderItemResponse(
    int Id,
    int MenuItemId,
    string MenuItemName,
    int Quantity,
    decimal UnitPrice,
    decimal LineTotal
);