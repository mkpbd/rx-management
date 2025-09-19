using HospitalManagement.Core.Entities;
using HospitalManagement.Core.Interfaces;
using HospitalManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.Infrastructure.Repositories
{
    public class MedicineRepository : Repository<Medicine>, IMedicineRepository
    {
        public MedicineRepository(HospitalDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Medicine>> GetActiveMedicinesAsync()
        {
            return await _dbSet
                .Where(m => m.IsActive && !m.IsDeleted)
                .OrderBy(m => m.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<Medicine>> SearchMedicinesByNameAsync(string searchTerm)
        {
            return await _dbSet
                .Where(m => (m.Name.Contains(searchTerm) || 
                           (m.GenericName != null && m.GenericName.Contains(searchTerm))) && 
                           m.IsActive && !m.IsDeleted)
                .OrderBy(m => m.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<Medicine>> GetMedicinesByCategoryAsync(string category)
        {
            return await _dbSet
                .Where(m => m.Category == category && m.IsActive && !m.IsDeleted)
                .OrderBy(m => m.Name)
                .ToListAsync();
        }

        public async Task<bool> IsMedicineNameUniqueAsync(string name, int? excludeId = null)
        {
            var query = _dbSet.Where(m => m.Name == name && !m.IsDeleted);
            
            if (excludeId.HasValue)
            {
                query = query.Where(m => m.Id != excludeId.Value);
            }

            return !await query.AnyAsync();
        }
    }
}