using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace market.Migrations
{
    /// <inheritdoc />
    public partial class ItemsUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ico",
                table: "items",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ico",
                table: "items");
        }
    }
}
