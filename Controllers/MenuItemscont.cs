using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BiteNow.Data;
using BiteNow.DTOs;
using BiteNow.Models;

namespace BiteNow.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenuItemsController : ControllerBase
{
    private readonly AppDbContext _db;

    public MenuItemsController(AppDbContext db) => _db = db;

    // ── Public Endpoints ────────────────────────────────────

    /// <summary>Browse all available menu items (optionally filter by category)</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MenuItemResponse>>> GetAll(
        [FromQuery] string? category = null,
        [FromQuery] bool availableOnly = true)
    {
        var query = _db.MenuItems.AsQueryable();

        if (availableOnly)
            query = query.Where(m => m.IsAvailable);

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(m => m.Category.ToLower() == category.ToLower());

        var items = await query
            .OrderBy(m => m.Category)
            .ThenBy(m => m.Name)
            .Select(m => ToResponse(m))
            .ToListAsync();

        return Ok(items);
    }

    /// <summary>Get a single menu item by ID</summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<MenuItemResponse>> GetById(int id)
    {
        var item = await _db.MenuItems.FindAsync(id);
        return item is null ? NotFound($"Menu item {id} not found.") : Ok(ToResponse(item));
    }

    /// <summary>List all distinct categories</summary>
    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetCategories()
    {
        var categories = await _db.MenuItems
            .Where(m => m.IsAvailable)
            .Select(m => m.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return Ok(categories);
    }

    // ── Admin Endpoints ─────────────────────────────────────
    // In a real app these would be [Authorize(Roles = "Admin")]

    /// <summary>Create a new menu item (Admin)</summary>
    [HttpPost]
    public async Task<ActionResult<MenuItemResponse>> Create([FromBody] CreateMenuItemRequest req)
    {
        if (req.Price <= 0)
            return BadRequest("Price must be greater than zero.");

        var item = new MenuItem
        {
            Name        = req.Name.Trim(),
            Description = req.Description.Trim(),
            Price       = req.Price,
            Category    = req.Category.Trim(),
            IsAvailable = req.IsAvailable,
            CreatedAt   = DateTime.UtcNow
        };

        _db.MenuItems.Add(item);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = item.Id }, ToResponse(item));
    }

    /// <summary>Update a menu item (Admin)</summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<MenuItemResponse>> Update(int id, [FromBody] UpdateMenuItemRequest req)
    {
        var item = await _db.MenuItems.FindAsync(id);
        if (item is null) return NotFound($"Menu item {id} not found.");

        if (req.Price <= 0)
            return BadRequest("Price must be greater than zero.");

        item.Name        = req.Name.Trim();
        item.Description = req.Description.Trim();
        item.Price       = req.Price;
        item.Category    = req.Category.Trim();
        item.IsAvailable = req.IsAvailable;

        await _db.SaveChangesAsync();
        return Ok(ToResponse(item));
    }

    /// <summary>Toggle item availability without deleting it (Admin)</summary>
    [HttpPatch("{id}/availability")]
    public async Task<ActionResult<MenuItemResponse>> ToggleAvailability(int id)
    {
        var item = await _db.MenuItems.FindAsync(id);
        if (item is null) return NotFound($"Menu item {id} not found.");

        item.IsAvailable = !item.IsAvailable;
        await _db.SaveChangesAsync();
        return Ok(ToResponse(item));
    }

    /// <summary>Delete a menu item (Admin) — only if it has no orders</summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _db.MenuItems.FindAsync(id);
        if (item is null) return NotFound($"Menu item {id} not found.");

        bool hasOrders = await _db.OrderItems.AnyAsync(oi => oi.MenuItemId == id);
        if (hasOrders)
            return Conflict("Cannot delete a menu item that is part of existing orders. Disable it instead.");

        _db.MenuItems.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ── Mapping helper ──────────────────────────────────────
    private static MenuItemResponse ToResponse(MenuItem m) => new(
        m.Id, m.Name, m.Description, m.Price, m.Category, m.IsAvailable, m.CreatedAt
    );
}