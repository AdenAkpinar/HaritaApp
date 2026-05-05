using System.Collections.Generic;
using System.Threading.Tasks;
using Server.Models;
using Server.Repositories;

namespace Server.Services
{
    public class GeometryService : IGeometryService
    {
        private readonly IGeometryRepository _repository;

        public GeometryService(IGeometryRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<GeometryModel>> GetAllGeometriesAsync(int userId)
        {
            return await _repository.GetAllAsync(userId);
        }

        public async Task<GeometryModel?> GetGeometryByIdAsync(int id, int userId)
        {
            return await _repository.GetByIdAsync(id, userId);
        }

        public async Task<GeometryModel> AddGeometryAsync(GeometryModel geometry)
        {
            return await _repository.AddAsync(geometry);
        }

        public async Task<GeometryModel> UpdateGeometryAsync(GeometryModel geometry)
        {
            return await _repository.UpdateGeometryAsync(geometry);
        }

        public async Task<bool> DeleteGeometryAsync(int id, int userId)
        {
            var geometry = await _repository.GetByIdAsync(id, userId);
            if (geometry == null)
            {
                return false;
            }

            await _repository.DeleteAsync(geometry);
            return true;
        }
    }
}
