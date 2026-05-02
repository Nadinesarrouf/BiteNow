using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BiteNow.Data;
using BiteNow.DTOs;
using BiteNow.Models;

namespace BiteNow.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;

    // Valid status transitions — enforces a business rule workflow
    private static readonly Dictionary<string, string[]> AllowedTransitions = new()
    {
        ["Pending"]    = ["Confirmed", "Cancelled"],
        ["Confirmed"]  = ["Preparing", "Cancelled"],
        ["Preparing"]  = ["Ready"],
        ["Ready"]      = ["Delivered"],
        ["Delivered"]  = [],
        ["Cancelled"]  = []
    };

    public OrdersController(AppDbContext db) => _db = db;

    // ── Customer Endpoints ──────────────────────────────────

    /// <summary>Place a new order</summary>
    [HttpPost]
    public async Task<ActionResult<OrderResponse>> PlaceOrder([FromBody] PlaceOrderRequest req)
    {
        // Validate user exists
        var user = await _db.Users.FindAsync(req.UserId);
        if (user is null) return NotFound($"User {req.UserId} not found.");

        // Validate items list
        if (req.Items is null || req.Items.Count == 0)
            return BadRequest("An order must contain at least one item.");

        if (req.Items.Any(i => i.Quantity <= 0))
            return BadRequest("All item quantities must be at least 1.");

        // Load and validate all menu items in one query
        var menuItemIds = req.Items.Select(i => i.MenuItemId).Distinct().ToList();
        var menuItems = await _db.MenuItems
            .Where(m => menuItemIds.Contains(m.Id))
            .ToDictionaryAsync(m => m.Id);

        // Check all requested items exist and are available
        foreach (var reqItem in req.Items)
        {
            if (!menuItems.TryGetValue(reqItem.MenuItemId, out var menuItem))
                return NotFound($"Menu item {reqItem.MenuItemId} not found.");

            if (!menuItem.IsAvailable)
                return BadRequest($"'{menuItem.Name}' is currently unavailable.");
        }

        // Build the order
        var order = new Order
        {
            UserId   = req.UserId,
            Notes    = req.Notes?.Trim() ?? string.Empty,
            Status   = "Pending",
            PlacedAt = DateTime.UtcNow
        };

        // Build order items and snapshot the price at order time
        var orderItems = req.Items.Select(reqItem =>
        {
            var menuItem = menuItems[reqItem.MenuItemId];
            return new OrderItem
            {
                MenuItemId = reqItem.MenuItemId,
                Quantity   = reqItem.Quantity,
                UnitPrice  = menuItem.Price   // Price snapshot!
            };
        }).ToList();

        // Calculate total
        order.TotalAmount = orderItems.Sum(oi => oi.UnitPrice * oi.Quantity);
        order.OrderItems  = orderItems;

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        // Re-load with navigation for clean response
        return CreatedAtAction(
            nameof(GetById),
            new { id = order.Id },
            await BuildOrderResponse(order.Id)
        );
    }

    /// <summary>Get a specific order by ID</summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<OrderResponse>> GetById(int id)
    {
        var response = await BuildOrderResponse(id);
        return response is null ? NotFound($"Order {id} not found.") : Ok(response);
    }

    /// <summary>Get all orders for a specific user</summary>
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<OrderSummaryResponse>>> GetByUser(int userId)
    {
        var userExists = await _db.Users.AnyAsync(u => u.Id == userId);
        if (!userExists) return NotFound($"User {userId} not found.");

        var orders = await _db.Orders
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.PlacedAt)
            .Select(o => new OrderSummaryResponse(
                o.Id,
                o.Status,
                o.TotalAmount,
                o.OrderItems.Count,
                o.PlacedAt
            ))
            .ToListAsync();

        return Ok(orders);
    }

    // ── Admin Endpoints ─────────────────────────────────────

    /// <summary>Get all orders with optional status filter (Admin)</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderSummaryResponse>>> GetAll(
        [FromQuery] string? status = null)
    {
        var query = _db.Orders.AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(o => o.Status == status);

        var orders = await query
            .OrderByDescending(o => o.PlacedAt)
            .Select(o => new OrderSummaryResponse(
                o.Id,
                o.Status,
                o.TotalAmount,
                o.OrderItems.Count,
                o.PlacedAt
            ))
            .ToListAsync();

        return Ok(orders);
    }

    /// <summary>Update order status (Admin) — enforces valid workflow transitions</summary>
    [HttpPatch("{id}/status")]
    public async Task<ActionResult<OrderResponse>> UpdateStatus(
        int id, [FromBody] UpdateOrderStatusRequest req)
    {
        var order = await _db.Orders.FindAsync(id);
        if (order is null) return NotFound($"Order {id} not found.");

        if (!AllowedTransitions.TryGetValue(order.Status, out var allowed))
            return BadRequest($"Unknown current status: {order.Status}");

        if (!allowed.Contains(req.Status))
            return BadRequest(
                $"Cannot transition from '{order.Status}' to '{req.Status}'. " +
                $"Allowed: [{string.Join(", ", allowed)}]"
            );

        order.Status    = req.Status;
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(await BuildOrderResponse(id));
    }

    /// <summary>Cancel an order (Customer or Admin) — only if Pending or Confirmed</summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> CancelOrder(int id)
    {
        var order = await _db.Orders.FindAsync(id);
        if (order is null) return NotFound($"Order {id} not found.");

        if (order.Status != "Pending" && order.Status != "Confirmed")
            return Conflict($"Cannot cancel order in '{order.Status}' status.");

        order.Status    = "Cancelled";
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ── Private helpers ─────────────────────────────────────

    private async Task<OrderResponse?> BuildOrderResponse(int orderId)
    {
        var order = await _db.Orders
            .Include(o => o.User)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order is null) return null;

        return new OrderResponse(
            order.Id,
            order.UserId,
            order.User.Name,
            order.Status,
            order.Notes,
            order.TotalAmount,
            order.PlacedAt,
            order.UpdatedAt,
            order.OrderItems.Select(oi => new OrderItemResponse(
                oi.Id,
                oi.MenuItemId,
                oi.MenuItem.Name,
                oi.Quantity,
                oi.UnitPrice,
                oi.UnitPrice * oi.Quantity   // LineTotal
            )).ToList()
        );
    }
}