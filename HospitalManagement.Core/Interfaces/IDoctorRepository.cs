using HospitalManagement.Core.Entities;

namespace HospitalManagement.Core.Interfaces
{
    public interface IDoctorRepository : IRepository<Doctor>
    {
        Task<Doctor?> GetDoctorByEmailAsync(string email);
        Task<IEnumerable<Doctor>> GetDoctorsBySpecializationAsync(string specialization);
        Task<IEnumerable<Doctor>> SearchDoctorsByNameAsync(string searchTerm);
        Task<bool> IsEmailUniqueAsync(string email, int? excludeId = null);
        Task<bool> IsLicenseNumberUniqueAsync(string licenseNumber, int? excludeId = null);
    }
}