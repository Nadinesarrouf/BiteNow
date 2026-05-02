using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BiteNow.Data;
using BiteNow.Models;
using BiteNow.DTOs;

namespace BiteNow.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderItemsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrderItemsController(AppDbContext context)
        {
            _context = context;
        }

        // GET all order items
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderItem>>> GetOrderItems()
        {
            return await _context.OrderItems
                .Include(oi => oi.MenuItem)
                .Include(oi => oi.Order)
                .ToListAsync();
        }

        // POST add item to order
      [HttpPost]
public async Task<ActionResult<OrderItem>> Create(OrderItem item)
{
    var order = await _context.Orders.FindAsync(item.OrderId);
    var menuItem = await _context.MenuItems.FindAsync(item.MenuItemId);

    if (order == null || menuItem == null)
        return BadRequest("Invalid Order or MenuItem");

    order.TotalPrice += menuItem.Price * item.Quantity;

    _context.OrderItems.Add(item);
    await _context.SaveChangesAsync();

    return Ok(item);
}
       // PUT update item quantity
       [HttpPut("{id}")]
       public async Task<IActionResult> Update(int id, OrderItem updatedItem)
       {
        if (id != updatedItem.Id) return BadRequest();

        var item = await _context.OrderItems.FindAsync(id);
        if (item == null) return NotFound();

        item.Quantity = updatedItem.Quantity;
        await _context.SaveChangesAsync();  

    return Ok(item);
      }
        // DELETE item
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.OrderItems.FirstOrDefaultAsync(x => x.Id == id);
            if (item == null) return NotFound();

            _context.OrderItems.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}