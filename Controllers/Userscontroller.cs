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

    /// <summary>Register a new customer account</summary>
    [HttpPost("register")]
    public async Task<ActionResult<UserResponse>> Register([FromBody] RegisterUserRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest("Email and password are required.");

        if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            return Conflict("An account with that email already exists.");

        var user = new User
        {
            Name         = req.Name.Trim(),
            Email        = req.Email.Trim().ToLower(),
            PasswordHash = HashPassword(req.Password),  // Never store plain text
            Role         = "Customer",
            CreatedAt    = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, ToResponse(user));
    }

    /// <summary>Login (simplified — returns user info; use JWT in production)</summary>
    [HttpPost("login")]
    public async Task<ActionResult<UserResponse>> Login([FromBody] LoginRequest req)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == req.Email.ToLower());

        if (user is null || !VerifyPassword(req.Password, user.PasswordHash))
            return Unauthorized("Invalid email or password.");

        return Ok(ToResponse(user));
    }

    /// <summary>Get a user by ID (Admin)</summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<UserResponse>> GetById(int id)
    {
        var user = await _db.Users.FindAsync(id);
        return user is null ? NotFound($"User {id} not found.") : Ok(ToResponse(user));
    }

    /// <summary>Get all users (Admin)</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponse>>> GetAll()
    {
        var users = await _db.Users
            .OrderBy(u => u.Name)
            .Select(u => ToResponse(u))
            .ToListAsync();

        return Ok(users);
    }

    /// <summary>Get all orders for a user</summary>
    [HttpGet("{id}/orders")]
    public async Task<ActionResult<IEnumerable<object>>> GetUserOrders(int id)
    {
        var userExists = await _db.Users.AnyAsync(u => u.Id == id);
        if (!userExists) return NotFound($"User {id} not found.");

        // Redirect to Orders controller endpoint for consistency
        return Redirect($"/api/orders/user/{id}");
    }

    // ── Private helpers ─────────────────────────────────────

    private static UserResponse ToResponse(User u) =>
        new(u.Id, u.Name, u.Email, u.Role, u.CreatedAt);

    // Simplified hashing — in production use BCrypt or ASP.NET Identity
    private static string HashPassword(string password) =>
        Convert.ToBase64String(
            System.Security.Cryptography.SHA256.HashData(
                System.Text.Encoding.UTF8.GetBytes(password + "restaurant-salt")
            )
        );

    private static bool VerifyPassword(string password, string hash) =>
        HashPassword(password) == hash;
}