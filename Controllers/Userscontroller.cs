using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BiteNow.Data;
using BiteNow.DTOs;
using BiteNow.Models;

namespace BiteNow.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db) => _db = db;

    // ── Auth Endpoints ───────────────────────────────────────

    /// <summary>Register a new customer account</summary>
    [HttpPost("register")]
    public async Task<ActionResult<UserResponse>> Register([FromBody] SignupDto req)
    {
        if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest("Email and password are required.");

        if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            return Conflict("An account with that email already exists.");

        var user = new User
        {
            Name         = req.Name.Trim(),
            Email        = req.Email.Trim().ToLower(),
            PasswordHash = HashPassword(req.Password),
            Role         = "Customer",
            CreatedAt    = DateTime.UtcNow,
            Phone        = req.Phone?.Trim()    ?? string.Empty,
            Location     = req.Location?.Trim() ?? string.Empty,
            Address      = string.Empty,
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, ToResponse(user));
    }

    /// <summary>Login</summary>
    [HttpPost("login")]
    public async Task<ActionResult<UserResponse>> Login([FromBody] LoginRequest req)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == req.Email.ToLower());

        if (user is null || !VerifyPassword(req.Password, user.PasswordHash))
            return Unauthorized("Invalid email or password.");

        return Ok(ToResponse(user));
    }

    // ── Customer Endpoints ───────────────────────────────────

    /// <summary>Get a user by ID</summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<UserResponse>> GetById(int id)
    {
        var user = await _db.Users.FindAsync(id);
        return user is null ? NotFound($"User {id} not found.") : Ok(ToResponse(user));
    }

    /// <summary>Update home address only</summary>
    [HttpPatch("{id}/address")]
    public async Task<ActionResult<UserResponse>> UpdateAddress(
        int id, [FromBody] UpdateAddressRequest req)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null) return NotFound($"User {id} not found.");

        user.Address = req.Address?.Trim() ?? string.Empty;
        await _db.SaveChangesAsync();

        return Ok(ToResponse(user));
    }

    /// <summary>Update full profile (name, phone, location, address)</summary>
    [HttpPut("{id}/profile")]
    public async Task<ActionResult<UserResponse>> UpdateProfile(
        int id, [FromBody] UpdateProfileRequest req)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null) return NotFound($"User {id} not found.");

        if (!string.IsNullOrWhiteSpace(req.Name))
            user.Name = req.Name.Trim();

        if (req.Phone is not null)
            user.Phone = req.Phone.Trim();

        if (req.Location is not null)
            user.Location = req.Location.Trim();

        if (req.Address is not null)
            user.Address = req.Address.Trim();

        await _db.SaveChangesAsync();
        return Ok(ToResponse(user));
    }

    /// <summary>Get all orders for a user — proxies to OrdersController</summary>
    [HttpGet("{id}/orders")]
    public IActionResult GetUserOrders(int id)
    {
        return Redirect($"/api/orders/user/{id}");
    }

    // ── Admin Endpoints ──────────────────────────────────────

    /// <summary>Get all users with their details (Admin)</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponse>>> GetAll()
    {
        var users = await _db.Users
            .OrderBy(u => u.Name)
            .Select(u => ToResponse(u))
            .ToListAsync();

        return Ok(users);
    }

    /// <summary>
    /// Get all users with order stats for admin client view (Admin)
    /// Returns name, email, phone, location, address, order count, total spent
    [HttpGet("admin/clients")]
public async Task<ActionResult<IEnumerable<ClientDetailResponse>>> GetClients()
{
    var clients = await _db.Users
        .Include(u => u.Orders)
        .Where(u => u.Role == "Customer")
        .OrderBy(u => u.Name)
        .Select(u => new ClientDetailResponse(
            u.Id,
            u.Name,
            u.Email,
            u.Phone ?? "",
            u.Location ?? "",
            u.Address ?? "",
            u.CreatedAt,
            u.Orders.Count,
            (decimal)(u.Orders
             .Where(o => o.Status != "Cancelled")
             .Sum(o => (double?)o.TotalAmount) ?? 0.0),
            u.Orders
                .OrderByDescending(o => o.PlacedAt)
                .Select(o => (DateTime?)o.PlacedAt)
                .FirstOrDefault()
        ))
        .ToListAsync();

    return Ok(clients);
}


    /// <summary>Admin: update any user's address</summary>
    [HttpPatch("admin/{id}/address")]
    public async Task<ActionResult<UserResponse>> AdminSetAddress(
        int id, [FromBody] UpdateAddressRequest req)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null) return NotFound($"User {id} not found.");

        user.Address = req.Address?.Trim() ?? string.Empty;
        await _db.SaveChangesAsync();

        return Ok(ToResponse(user));
    }

    // ── Mapping + Helpers ────────────────────────────────────

    private static UserResponse ToResponse(User u) =>
        new(u.Id, u.Name, u.Email, u.Role, u.CreatedAt,
            u.Phone, u.Location, u.Address);

    private static string HashPassword(string password) =>
        Convert.ToBase64String(
            System.Security.Cryptography.SHA256.HashData(
                System.Text.Encoding.UTF8.GetBytes(password + "restaurant-salt")
            )
        );

    private static bool VerifyPassword(string password, string hash) =>
        HashPassword(password) == hash;
}

// ── Extra DTO only used in this endpoint ─────────────────────
public record ClientDetailResponse(
    int       Id,
    string    Name,
    string    Email,
    string    Phone,
    string    Location,
    string    Address,
    DateTime  JoinedAt,
    int       TotalOrders,
    decimal   TotalSpent,
    DateTime? LastOrderAt
);