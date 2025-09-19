using HospitalManagement.Core.Entities;

namespace HospitalManagement.Core.Interfaces
{
    public interface IMedicineRepository : IRepository<Medicine>
    {
        Task<IEnumerable<Medicine>> GetActiveMedicinesAsync();
        Task<IEnumerable<Medicine>> SearchMedicinesByNameAsync(string searchTerm);
        Task<IEnumerable<Medicine>> GetMedicinesByCategoryAsync(string category);
        Task<bool> IsMedicineNameUniqueAsync(string name, int? excludeId = null);
    }
}