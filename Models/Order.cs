using System.ComponentModel.DataAnnotations.Schema;

namespace BiteNow.Models
{
    public class Order
    {
        public int Id { get; set; }
         public int UserId { get; set; }   // MUST EXIST
         public User User { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public string Status { get; set; } = "Pending";

        public decimal TotalPrice { get; set; }

        public List<OrderItem> OrderItems { get; set; } = new();
    }
}