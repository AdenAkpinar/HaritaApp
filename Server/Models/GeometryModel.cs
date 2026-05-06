using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NetTopologySuite.Geometries;

namespace Server.Models
{
    public class GeometryModel
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string GeometryType { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "geometry")]
        public Geometry Geoloc { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? Color { get; set; }
        public double? Distance { get; set; }
        public double? Duration { get; set; }

        // Kullanıcı ilişkisi
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
