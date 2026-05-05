using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Repositories
{
    public class GeometryRepository : IGeometryRepository
    {
        private readonly ApplicationDbContext _context;

        public GeometryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<GeometryModel>> GetAllAsync(int userId)
        {
            return await _context.Geometries
                .Where(g => g.UserId == userId)
                .ToListAsync();
        }

        public async Task<GeometryModel?> GetByIdAsync(int id, int userId)
        {
            return await _context.Geometries
                .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);
        }

        public async Task<GeometryModel> AddAsync(GeometryModel geometry)
        {
            _context.Geometries.Add(geometry);
            await _context.SaveChangesAsync();
            return geometry;
        }

        public async Task<GeometryModel> UpdateGeometryAsync(GeometryModel geometry)
        {
            _context.Geometries.Update(geometry);
            await _context.SaveChangesAsync();
            return geometry;
        }

        public async Task DeleteAsync(GeometryModel geometry)
        {
            _context.Geometries.Remove(geometry);
            await _context.SaveChangesAsync();
        }
    }
}
