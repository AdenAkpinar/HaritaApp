using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NetTopologySuite.Features;
using NetTopologySuite.Geometries;
using Server.Models;
using Server.Services;
using Microsoft.AspNetCore.Authorization;

namespace Server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class GeometriesController : ControllerBase
    {
        private readonly IGeometryService _geometryService;

        public GeometriesController(IGeometryService geometryService)
        {
            _geometryService = geometryService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var id) ? id : 0;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = GetCurrentUserId();
            var geometries = await _geometryService.GetAllGeometriesAsync(userId);
            var featureCollection = new FeatureCollection();

            foreach (var geom in geometries)
            {
                var attributes = new AttributesTable
                {
                    { "id", geom.Id },
                    { "name", geom.Name },
                    { "geometryType", geom.GeometryType },
                    { "createdAt", geom.CreatedAt }
                };

                var feature = new Feature(geom.Geoloc, attributes);
                featureCollection.Add(feature);
            }

            return Ok(featureCollection);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userId = GetCurrentUserId();
            var geom = await _geometryService.GetGeometryByIdAsync(id, userId);
            if (geom == null)
                return NotFound();

            var attributes = new AttributesTable
            {
                { "id", geom.Id },
                { "name", geom.Name },
                { "geometryType", geom.GeometryType },
                { "createdAt", geom.CreatedAt }
            };

            var feature = new Feature(geom.Geoloc, attributes);
            return Ok(feature);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Feature feature)
        {
            if (feature == null || feature.Geometry == null)
            {
                return BadRequest("Invalid GeoJSON Feature.");
            }

            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            string name = feature.Attributes != null && feature.Attributes.Exists("name") 
                ? feature.Attributes["name"]?.ToString() ?? "Unnamed Feature" 
                : "Unnamed Feature";

            var geomModel = new GeometryModel
            {
                Name = name,
                GeometryType = feature.Geometry.GeometryType,
                Geoloc = feature.Geometry,
                CreatedAt = DateTime.UtcNow,
                UserId = userId
            };

            geomModel.Geoloc.SRID = 4326;

            var created = await _geometryService.AddGeometryAsync(geomModel);
            
            feature.Attributes?.Add("id", created.Id);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, feature);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Feature feature)
        {
            if (feature == null || feature.Geometry == null)
            {
                return BadRequest("Invalid GeoJSON Feature.");
            }

            var userId = GetCurrentUserId();
            var existing = await _geometryService.GetGeometryByIdAsync(id, userId);
            if (existing == null)
                return NotFound();

            existing.GeometryType = feature.Geometry.GeometryType;
            existing.Geoloc = feature.Geometry;
            existing.Geoloc.SRID = 4326;

            if (feature.Attributes != null && feature.Attributes.Exists("name"))
            {
                existing.Name = feature.Attributes["name"]?.ToString() ?? "Unnamed Feature";
            }

            await _geometryService.UpdateGeometryAsync(existing);
            return Ok(feature);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = GetCurrentUserId();
            var success = await _geometryService.DeleteGeometryAsync(id, userId);
            if (!success)
                return NotFound();

            return NoContent();
        }
    }
}
