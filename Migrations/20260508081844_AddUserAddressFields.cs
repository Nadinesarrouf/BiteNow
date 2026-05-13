using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BiteNow.Migrations
{
    /// <inheritdoc />
    public partial class AddUserAddressFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "Users",
                type: "TEXT",
                maxLength: 30,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "Location",
                table: "Users",
                type: "TEXT",
                maxLength: 200,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "Users",
                type: "TEXT",
                maxLength: 500,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Address", "Location", "PasswordHash", "Phone" },
                values: new object[] { "Restaurant HQ", "Jounieh, Lebanon", "$2a$11$placeholder", "+961 03 819 412" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Location", "PasswordHash", "Phone" },
                values: new object[] { "Beirut", "$2a$11$placeholder", "+961 70 000 001" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "Users",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 30,
                oldDefaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Location",
                table: "Users",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 200,
                oldDefaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "Users",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 500,
                oldDefaultValue: "");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Address", "Location", "PasswordHash", "Phone" },
                values: new object[] { "", "", "$2a$11$rBnqOGV.W0K.Q9z1xHmv7.placeholder.hash", "" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Location", "PasswordHash", "Phone" },
                values: new object[] { "", "$2a$11$rBnqOGV.W0K.Q9z1xHmv7.placeholder.hash", "" });
        }
    }
}
