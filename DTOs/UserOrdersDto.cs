namespace BiteNow.DTOs;

// ── Outgoing response ─────────────────────────────────────────
public record UserResponse(
    int      Id,
    string   Name,
    string   Email,
    string   Role,
    DateTime CreatedAt,
    string   Phone,
    string   Location,
    string   Address
);

// ── Incoming: register ────────────────────────────────────────
public record SignupDto(
    string  Name,
    string  Email,
    string  Password,
    string? Phone,
    string? Location
);

// ── Incoming: login ───────────────────────────────────────────
public record LoginRequest(
    string Email,
    string Password
);

// ── Incoming: update address ──────────────────────────────────
public record UpdateAddressRequest(
    string? Address
);

// ── Incoming: update full profile ────────────────────────────
public record UpdateProfileRequest(
    string? Name,
    string? Phone,
    string? Location,
    string? Address
);