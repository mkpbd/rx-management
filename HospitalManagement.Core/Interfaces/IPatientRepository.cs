using HospitalManagement.Core.Entities;

namespace HospitalManagement.Core.Interfaces
{
    public interface IPatientRepository : IRepository<Patient>
    {
        Task<Patient?> GetPatientByEmailAsync(string email);
        Task<IEnumerable<Patient>> SearchPatientsByNameAsync(string searchTerm);
        Task<bool> IsEmailUniqueAsync(string email, int? excludeId = null);
    }
}