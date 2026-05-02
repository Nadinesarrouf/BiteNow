namespace BiteNow.DTOs;

public record PlaceOrderRequest(
    int UserId,
    string Notes,
    List<OrderItemRequest> Items
);

public record UpdateOrderStatusRequest(
    string Status
);

public record OrderResponse(
    int Id,
    int UserId,
    string UserName,
    string Status,
    string Notes,
    decimal TotalAmount,
    DateTime PlacedAt,
    DateTime? UpdatedAt,
    List<OrderItemResponse> Items
);

public record OrderSummaryResponse(
    int Id,
    string Status,
    decimal TotalAmount,
    int ItemCount,
    DateTime PlacedAt
);
