using System.Collections.Generic;
using System.Threading.Tasks;
using Server.Models;

namespace Server.Repositories
{
    public interface IGeometryRepository
    {
        Task<IEnumerable<GeometryModel>> GetAllAsync(int userId);
        Task<GeometryModel?> GetByIdAsync(int id, int userId);
        Task<GeometryModel> AddAsync(GeometryModel geometry);
        Task<GeometryModel> UpdateGeometryAsync(GeometryModel geometry);
        Task DeleteAsync(GeometryModel geometry);
    }
}
