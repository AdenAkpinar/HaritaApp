using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToGeometries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Geometries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Geometries_UserId",
                table: "Geometries",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Geometries_Users_UserId",
                table: "Geometries",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Geometries_Users_UserId",
                table: "Geometries");

            migrationBuilder.DropIndex(
                name: "IX_Geometries_UserId",
                table: "Geometries");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Geometries");
        }
    }
}
