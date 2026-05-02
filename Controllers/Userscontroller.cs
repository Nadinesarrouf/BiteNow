using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BiteNow.Data;
using BiteNow.Models;
using BiteNow.DTOs;

namespace BiteNow.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // GET users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET user by id
       [HttpGet("{id}/orders")]
public async Task<IActionResult> GetUserOrders(int id)
{
    var user = await _context.Users
        .Include(u => u.Orders)
            .ThenInclude(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
        .FirstOrDefaultAsync(u => u.Id == id);

    if (user == null)
        return NotFound();

    var result = new UserOrdersDto
    {
        UserId = user.Id,
        Orders = user.Orders.Select(o => new OrderDto)
        Items = o.OrderItems.Select(oi => new OrderItemDto)
        {
            Id = o.Id,
            CreatedAt = o.CreatedAt,
            Status = o.Status,
            TotalPrice = o.TotalPrice,
            Items = o.OrderItems.Select(oi => new OrderItemDto)
            {
                Id = oi.Id,
                Quantity = oi.Quantity,
                MenuItemId = oi.MenuItemId,
                MenuItemName = oi.MenuItem?.Name,
                Price = (double)(oi.MenuItem?.Price ?? 0)
            }.ToList()
        }.ToList()
    }

    return Ok(result);
}
        // POST register user
        [HttpPost]
        public async Task<ActionResult<User>> Create(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }
    }
}