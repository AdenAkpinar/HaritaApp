using System.Collections.Generic;
using System.Threading.Tasks;
using Server.Models;

namespace Server.Services
{
    public interface IGeometryService
    {
        Task<IEnumerable<GeometryModel>> GetAllGeometriesAsync(int userId);
        Task<GeometryModel?> GetGeometryByIdAsync(int id, int userId);
        Task<GeometryModel> AddGeometryAsync(GeometryModel geometry);
        Task<GeometryModel> UpdateGeometryAsync(GeometryModel geometry);
        Task<bool> DeleteGeometryAsync(int id, int userId);
    }
}
