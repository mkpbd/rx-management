using HospitalManagement.Core.Entities;
using HospitalManagement.Core.Interfaces;
using HospitalManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.Infrastructure.Repositories
{
    public class PatientRepository : Repository<Patient>, IPatientRepository
    {
        public PatientRepository(HospitalDbContext context) : base(context)
        {
        }

        public async Task<Patient?> GetPatientByEmailAsync(string email)
        {
            return await _dbSet
                .FirstOrDefaultAsync(p => p.Email == email && !p.IsDeleted);
        }

        public async Task<IEnumerable<Patient>> SearchPatientsByNameAsync(string searchTerm)
        {
            return await _dbSet
                .Where(p => (p.FirstName.Contains(searchTerm) || 
                           p.LastName.Contains(searchTerm)) && 
                           !p.IsDeleted)
                .OrderBy(p => p.FirstName)
                .ThenBy(p => p.LastName)
                .ToListAsync();
        }

        public async Task<bool> IsEmailUniqueAsync(string email, int? excludeId = null)
        {
            var query = _dbSet.Where(p => p.Email == email && !p.IsDeleted);
            
            if (excludeId.HasValue)
            {
                query = query.Where(p => p.Id != excludeId.Value);
            }

            return !await query.AnyAsync();
        }
    }
}