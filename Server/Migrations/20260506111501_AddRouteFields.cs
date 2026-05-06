using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class AddRouteFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Color",
                table: "Geometries",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Distance",
                table: "Geometries",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Duration",
                table: "Geometries",
                type: "double precision",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Color",
                table: "Geometries");

            migrationBuilder.DropColumn(
                name: "Distance",
                table: "Geometries");

            migrationBuilder.DropColumn(
                name: "Duration",
                table: "Geometries");
        }
    }
}
