using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BiteNow.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MenuItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Category = table.Column<string>(type: "TEXT", nullable: false),
                    IsAvailable = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MenuItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
                    Role = table.Column<string>(type: "TEXT", nullable: false, defaultValue: "Customer"),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false, defaultValue: "Pending"),
                    Notes = table.Column<string>(type: "TEXT", nullable: false),
                    PlacedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    TotalAmount = table.Column<decimal>(type: "decimal(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Orders_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OrderItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    OrderId = table.Column<int>(type: "INTEGER", nullable: false),
                    MenuItemId = table.Column<int>(type: "INTEGER", nullable: false),
                    Quantity = table.Column<int>(type: "INTEGER", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderItems_MenuItems_MenuItemId",
                        column: x => x.MenuItemId,
                        principalTable: "MenuItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OrderItems_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "MenuItems",
                columns: new[] { "Id", "Category", "CreatedAt", "Description", "IsAvailable", "Name", "Price" },
                values: new object[,]
                {
                    { 1, "Pizza", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Classic tomato and mozzarella", true, "Margherita Pizza", 12.99m },
                    { 2, "Pizza", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Loaded with pepperoni", true, "Pepperoni Pizza", 14.99m },
                    { 3, "Salad", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Romaine, croutons, parmesan", true, "Caesar Salad", 8.50m },
                    { 4, "Sides", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Toasted with herb butter", true, "Garlic Bread", 4.99m },
                    { 5, "Dessert", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Classic Italian dessert", true, "Tiramisu", 6.99m }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "Name", "PasswordHash", "Role" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin@restaurant.com", "Admin", "$2a$11$rBnqOGV.W0K.Q9z1xHmv7.placeholder.hash", "Admin" },
                    { 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "alice@example.com", "Alice Smith", "$2a$11$rBnqOGV.W0K.Q9z1xHmv7.placeholder.hash", "Customer" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_MenuItemId",
                table: "OrderItems",
                column: "MenuItemId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_OrderId",
                table: "OrderItems",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_UserId",
                table: "Orders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrderItems");

            migrationBuilder.DropTable(
                name: "MenuItems");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
