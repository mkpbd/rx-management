using HospitalManagement.Core.Entities;

namespace HospitalManagement.Core.Interfaces
{
    public interface IAppointmentRepository : IRepository<Appointment>
    {
        Task<(IEnumerable<Appointment> appointments, int totalCount)> GetAppointmentsWithPaginationAsync(
            int pageNumber, 
            int pageSize, 
            string? searchTerm = null, 
            int? doctorId = null, 
            string? visitType = null,
            DateTime? fromDate = null,
            DateTime? toDate = null);
            
        Task<Appointment?> GetAppointmentWithDetailsAsync(int id);
        
        Task<IEnumerable<Appointment>> GetAppointmentsByPatientIdAsync(int patientId);
        
        Task<IEnumerable<Appointment>> GetAppointmentsByDoctorIdAsync(int doctorId);
        
        Task<IEnumerable<Appointment>> GetAppointmentsByDateRangeAsync(DateTime fromDate, DateTime toDate);
    }
}