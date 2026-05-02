namespace BiteNow.Models
{
    public class User
    {
        public int Id { get; set; }

        public string Username { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public List<Order> Orders { get; set; } = new List<Order>(); // Navigation property for related orders
    }
}