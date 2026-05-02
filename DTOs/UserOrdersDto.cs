namespace BiteNow.DTOs;

public record RegisterUserRequest(
    string Name,
    string Email,
    string Password
);

public record LoginRequest(
    string Email,
    string Password
);

public record UserResponse(
    int Id,
    string Name,
    string Email,
    string Role,
    DateTime CreatedAt
);