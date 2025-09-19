using HospitalManagement.Core.Entities;
using HospitalManagement.Core.Interfaces;
using HospitalManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.Infrastructure.Repositories
{
    public class DoctorRepository : Repository<Doctor>, IDoctorRepository
    {
        public DoctorRepository(HospitalDbContext context) : base(context)
        {
        }

        public async Task<Doctor?> GetDoctorByEmailAsync(string email)
        {
            return await _dbSet
                .FirstOrDefaultAsync(d => d.Email == email && !d.IsDeleted);
        }

        public async Task<IEnumerable<Doctor>> GetDoctorsBySpecializationAsync(string specialization)
        {
            return await _dbSet
                .Where(d => d.Specialization == specialization && !d.IsDeleted)
                .OrderBy(d => d.FirstName)
                .ThenBy(d => d.LastName)
                .ToListAsync();
        }

        public async Task<IEnumerable<Doctor>> SearchDoctorsByNameAsync(string searchTerm)
        {
            return await _dbSet
                .Where(d => (d.FirstName.Contains(searchTerm) || 
                           d.LastName.Contains(searchTerm) ||
                           d.Specialization.Contains(searchTerm)) && 
                           !d.IsDeleted)
                .OrderBy(d => d.FirstName)
                .ThenBy(d => d.LastName)
                .ToListAsync();
        }

        public async Task<bool> IsEmailUniqueAsync(string email, int? excludeId = null)
        {
            var query = _dbSet.Where(d => d.Email == email && !d.IsDeleted);
            
            if (excludeId.HasValue)
            {
                query = query.Where(d => d.Id != excludeId.Value);
            }

            return !await query.AnyAsync();
        }

        public async Task<bool> IsLicenseNumberUniqueAsync(string licenseNumber, int? excludeId = null)
        {
            var query = _dbSet.Where(d => d.LicenseNumber == licenseNumber && !d.IsDeleted);
            
            if (excludeId.HasValue)
            {
                query = query.Where(d => d.Id != excludeId.Value);
            }

            return !await query.AnyAsync();
        }
    }
}